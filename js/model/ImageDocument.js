import { Layer } from './Layer.js';
import { Palette } from './Palette.js';
import { Brush } from './Brush.js';
import { Selection } from './Selection.js';
import { TRANSPARENT } from '../constants.js';

export class ImageDocument {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.palette = new Palette();
        this.layers = [];
        this.activeLayerIndex = 0;
        this.fgColorIndex = 15; // white in VGA palette
        this.bgColorIndex = 0;  // black
        this.activeBrush = Brush.default();
        this.selection = new Selection(width, height);
        this.selectedLayerIndices = new Set([0]);

        // Grid (per-document; drives Show Grid / Snap to Grid)
        this.gridSize = 16;

        // Animation
        this.animationEnabled = false;
        this.onionSkinning = false;
        this.onionOpacity = 50;
        this.onionExtended = false;
        this.frames = [];
        this.activeFrameIndex = 0;
        // Cel table: celId -> { data, width, height, offsetX, offsetY, opacity, textData }.
        // A frame holds one cel id per layer; two frames holding the same id share
        // that image data (Aseprite-style linked cels). Indirection via id — rather
        // than object identity — is what lets undo snapshots and .pix8 round-trips
        // deep-copy freely without silently breaking links.
        this.cels = new Map();
        this._nextCelId = 1;

        // Start with one empty layer
        this.addLayer('Background');
    }

    getActiveLayer() {
        return this.layers[this.activeLayerIndex];
    }

    addLayer(name) {
        if (!name) {
            name = `Layer ${this.layers.length + 1}`;
        }
        const layer = new Layer(name, this.width, this.height);
        // Insert above active layer (or at 0 if empty)
        const insertIdx = this.layers.length === 0 ? 0 : this.activeLayerIndex + 1;
        this.layers.splice(insertIdx, 0, layer);
        this.activeLayerIndex = insertIdx;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(insertIdx);
        // Give the new layer its own blank cel in every frame — a fresh layer
        // starts unlinked, so painting on it in one frame stays in that frame.
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.celIds) {
                    frame.celIds.splice(insertIdx, 0, this._createCel(this._blankCel(layer)));
                }
            }
        }
        return layer;
    }

    removeLayer(index) {
        if (this.layers.length <= 1) return false;
        this.layers.splice(index, 1);
        this.selectedLayerIndices.delete(index);
        // Shift down indices above the removed one
        const shifted = new Set();
        for (const idx of this.selectedLayerIndices) {
            shifted.add(idx > index ? idx - 1 : idx);
        }
        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }
        shifted.add(this.activeLayerIndex);
        this.selectedLayerIndices = shifted;
        // Remove layer entry from all frames
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.celIds) frame.celIds.splice(index, 1);
            }
            this._gcCels();
        }
        return true;
    }

    moveLayer(from, to) {
        if (to < 0 || to >= this.layers.length) return false;
        const [layer] = this.layers.splice(from, 1);
        this.layers.splice(to, 0, layer);
        this.activeLayerIndex = to;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(to);
        // Reorder layer entry in all frames
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.celIds) {
                    const [id] = frame.celIds.splice(from, 1);
                    frame.celIds.splice(to, 0, id);
                }
            }
        }
        return true;
    }

    duplicateLayer(index) {
        const original = this.layers[index];
        const copy = original.clone();
        this.layers.splice(index + 1, 0, copy);
        this.activeLayerIndex = index + 1;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(index + 1);
        // Duplicate layer entry in all frames (as transparent)
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.celIds) {
                    const blank = this._blankCel(copy);
                    blank.opacity = copy.opacity;
                    blank.textData = copy.textData ? { ...copy.textData } : null;
                    frame.celIds.splice(index + 1, 0, this._createCel(blank));
                }
            }
        }
        return copy;
    }

    swapColors() {
        const tmp = this.fgColorIndex;
        this.fgColorIndex = this.bgColorIndex;
        this.bgColorIndex = tmp;
    }

    flattenToLayer() {
        const flat = new Layer('Flattened', this.width, this.height);
        // Bottom-to-top: topmost non-transparent wins, respecting layer offsets
        for (const layer of this.layers) {
            if (!layer.visible) continue;
            const lx0 = Math.max(0, layer.offsetX);
            const ly0 = Math.max(0, layer.offsetY);
            const lx1 = Math.min(this.width, layer.offsetX + layer.width);
            const ly1 = Math.min(this.height, layer.offsetY + layer.height);
            for (let dy = ly0; dy < ly1; dy++) {
                for (let dx = lx0; dx < lx1; dx++) {
                    const val = layer.data[(dy - layer.offsetY) * layer.width + (dx - layer.offsetX)];
                    if (val !== TRANSPARENT) {
                        flat.data[dy * this.width + dx] = val;
                    }
                }
            }
        }
        return flat;
    }

    getUsedColorIndices() {
        const used = new Set();
        const processLayerData = (data, textData) => {
            if (textData) {
                used.add(textData.colorIndex);
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== TRANSPARENT) used.add(v);
            }
        };
        for (const layer of this.layers) {
            processLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            const live = this._activeCelIds();
            for (const [id, cel] of this.cels) {
                if (live.has(id)) continue; // live layers already covered it
                processLayerData(cel.data, cel.textData);
            }
        }
        return used;
    }

    getColorHistogram() {
        const counts = new Uint32Array(256);
        const processLayerData = (data, textData) => {
            if (textData) {
                counts[textData.colorIndex]++;
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== TRANSPARENT) counts[v]++;
            }
        };
        for (const layer of this.layers) {
            processLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            const live = this._activeCelIds();
            for (const [id, cel] of this.cels) {
                if (live.has(id)) continue;
                processLayerData(cel.data, cel.textData);
            }
        }
        return counts;
    }

    remapColorIndices(mapping) {
        const remapLayerData = (data, textData) => {
            if (textData) {
                const v = textData.colorIndex;
                if (mapping[v] !== undefined) {
                    textData.colorIndex = mapping[v];
                }
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== TRANSPARENT && mapping[v] !== undefined) {
                    data[i] = mapping[v];
                }
            }
        };
        for (const layer of this.layers) {
            remapLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            // Iterate the cel table, not the frames: a cel linked across N frames
            // must be remapped exactly once, or chained mappings (a→b, b→c) would
            // apply repeatedly and corrupt it.
            const live = this._activeCelIds();
            for (const [id, cel] of this.cels) {
                if (live.has(id)) continue;
                remapLayerData(cel.data, cel.textData);
            }
        }
    }

    // ── Frame Animation ──────────────────────────────────────────────

    // ── Cel table ────────────────────────────────────────────────────

    _createCel(rec) {
        const id = this._nextCelId++;
        this.cels.set(id, rec);
        return id;
    }

    _celFromLayer(l) {
        return {
            data: l.data.slice(),
            opacity: l.opacity,
            textData: l.textData ? { ...l.textData } : null,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            width: l.width,
            height: l.height,
        };
    }

    _blankCel(l) {
        return {
            data: new Uint16Array(l.width * l.height).fill(TRANSPARENT),
            opacity: 1.0,
            textData: null,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            width: l.width,
            height: l.height,
        };
    }

    _cloneCel(rec) {
        return {
            ...rec,
            data: rec.data.slice(),
            textData: rec.textData ? { ...rec.textData } : null,
        };
    }

    /** Cel ids the live layers currently stand in for (may be stale until save). */
    _activeCelIds() {
        const frame = this.frames[this.activeFrameIndex];
        return new Set(frame && frame.celIds ? frame.celIds : []);
    }

    getCel(frameIndex, layerIndex) {
        const frame = this.frames[frameIndex];
        if (!frame || !frame.celIds) return null;
        return this.cels.get(frame.celIds[layerIndex]) || null;
    }

    /** How many (frame, layer) cells reference this cel id. */
    celRefCount(celId) {
        let n = 0;
        for (const frame of this.frames) {
            if (!frame.celIds) continue;
            for (const id of frame.celIds) if (id === celId) n++;
        }
        return n;
    }

    isCelLinked(frameIndex, layerIndex) {
        const frame = this.frames[frameIndex];
        if (!frame || !frame.celIds) return false;
        return this.celRefCount(frame.celIds[layerIndex]) > 1;
    }

    /**
     * Contiguous run of frames around frameIndex sharing this layer's cel.
     * The run is derived from the ids, never stored — so inserting, deleting,
     * and reordering frames need no range fix-up.
     */
    getLinkRun(frameIndex, layerIndex) {
        const frame = this.frames[frameIndex];
        if (!frame || !frame.celIds) return { start: frameIndex, end: frameIndex };
        const id = frame.celIds[layerIndex];
        let start = frameIndex, end = frameIndex;
        while (start > 0 && this.frames[start - 1].celIds?.[layerIndex] === id) start--;
        while (end < this.frames.length - 1 && this.frames[end + 1].celIds?.[layerIndex] === id) end++;
        return { start, end };
    }

    /**
     * Point every frame in frameIndices at sourceFrame's cel for this layer.
     * Their previous cels are dropped — this discards that image data.
     */
    linkCels(layerIndex, frameIndices, sourceFrameIndex) {
        const src = this.frames[sourceFrameIndex];
        if (!src || !src.celIds) return false;
        if (sourceFrameIndex === this.activeFrameIndex) this.saveCurrentFrame();
        const id = src.celIds[layerIndex];
        let changed = false;
        for (const fi of frameIndices) {
            const frame = this.frames[fi];
            if (!frame || !frame.celIds || frame.celIds[layerIndex] === id) continue;
            frame.celIds[layerIndex] = id;
            changed = true;
        }
        if (changed) {
            this._gcCels();
            if (frameIndices.includes(this.activeFrameIndex)) this.loadFrame(this.activeFrameIndex);
        }
        return changed;
    }

    /** Give this cell its own private copy of the cel it currently shares. */
    unlinkCel(frameIndex, layerIndex) {
        const frame = this.frames[frameIndex];
        if (!frame || !frame.celIds) return false;
        if (frameIndex === this.activeFrameIndex) this.saveCurrentFrame();
        const id = frame.celIds[layerIndex];
        if (this.celRefCount(id) <= 1) return false;
        const rec = this.cels.get(id);
        if (!rec) return false;
        frame.celIds[layerIndex] = this._createCel(this._cloneCel(rec));
        return true;
    }

    /** Drop cels no frame references any more. */
    _gcCels() {
        const live = new Set();
        for (const frame of this.frames) {
            if (!frame.celIds) continue;
            for (const id of frame.celIds) live.add(id);
        }
        for (const id of [...this.cels.keys()]) {
            if (!live.has(id)) this.cels.delete(id);
        }
    }

    /**
     * Deep snapshot of all animation state, for undo. Cel ids are preserved
     * verbatim, so links survive the round-trip; a cel linked N times is stored
     * once rather than N times.
     */
    snapshotAnimation() {
        if (!this.animationEnabled) return null;
        return {
            activeFrameIndex: this.activeFrameIndex,
            nextCelId: this._nextCelId,
            frames: this.frames.map(f => ({
                tag: f.tag,
                delay: f.delay,
                celIds: f.celIds ? f.celIds.slice() : null,
            })),
            cels: [...this.cels].map(([id, rec]) => [id, this._cloneCel(rec)]),
        };
    }

    /** Restore a snapshotAnimation() result. Copies again so the entry stays reusable. */
    restoreAnimation(snap) {
        if (!snap) return;
        this.frames = snap.frames.map(f => ({
            tag: f.tag,
            delay: f.delay,
            celIds: f.celIds ? f.celIds.slice() : null,
        }));
        this.cels = new Map(snap.cels.map(([id, rec]) => [id, this._cloneCel(rec)]));
        this._nextCelId = snap.nextCelId;
        this.activeFrameIndex = Math.min(snap.activeFrameIndex, this.frames.length - 1);
    }

    // ── Frames ───────────────────────────────────────────────────────

    _restoreLayersFromFrame(frame) {
        if (!frame || !frame.celIds) return;
        for (let i = 0; i < this.layers.length && i < frame.celIds.length; i++) {
            const cel = this.cels.get(frame.celIds[i]);
            if (!cel) continue;
            const layer = this.layers[i];
            layer.data = cel.data.slice();
            layer.opacity = cel.opacity;
            layer.textData = cel.textData ? { ...cel.textData } : null;
            layer.offsetX = cel.offsetX;
            layer.offsetY = cel.offsetY;
            if (cel.width !== undefined) layer.width = cel.width;
            if (cel.height !== undefined) layer.height = cel.height;
        }
    }

    /**
     * Flush live layers back into the active frame's cels. Mutates the cel
     * records in place rather than replacing them — that in-place write is what
     * makes an edit show up in every frame linked to the same cel.
     */
    saveCurrentFrame() {
        if (!this.animationEnabled || this.frames.length === 0) return;
        const frame = this.frames[this.activeFrameIndex];
        if (!frame || !frame.celIds) return;
        for (let i = 0; i < this.layers.length && i < frame.celIds.length; i++) {
            const cel = this.cels.get(frame.celIds[i]);
            if (!cel) continue;
            const l = this.layers[i];
            cel.data = l.data.slice();
            cel.opacity = l.opacity;
            cel.textData = l.textData ? { ...l.textData } : null;
            cel.offsetX = l.offsetX;
            cel.offsetY = l.offsetY;
            cel.width = l.width;
            cel.height = l.height;
        }
    }

    loadFrame(index) {
        if (index < 0 || index >= this.frames.length) return;
        this.activeFrameIndex = index;
        this._restoreLayersFromFrame(this.frames[index]);
    }

    /**
     * Insert a frame after the active one. linked:true shares the current
     * frame's cels instead of copying them, so editing either updates both.
     */
    addFrame(linked = false) {
        this.saveCurrentFrame();
        const cur = this.frames[this.activeFrameIndex];
        const celIds = linked
            ? cur.celIds.slice()
            : cur.celIds.map(id => this._createCel(this._cloneCel(this.cels.get(id))));
        this.frames.splice(this.activeFrameIndex + 1, 0, { tag: '', delay: 100, celIds });
        this.activeFrameIndex++;
    }

    deleteFrame(index) {
        if (this.frames.length <= 1) return false;
        this.frames.splice(index, 1);
        if (this.activeFrameIndex >= this.frames.length) {
            this.activeFrameIndex = this.frames.length - 1;
        }
        this._gcCels();
        this.loadFrame(this.activeFrameIndex);
        return true;
    }

    moveFrame(from, dir) {
        const to = from + dir;
        if (to < 0 || to >= this.frames.length) return false;
        const [frame] = this.frames.splice(from, 1);
        this.frames.splice(to, 0, frame);
        this.activeFrameIndex = to;
        return true;
    }

    enableAnimation() {
        if (this.animationEnabled) return;
        this.animationEnabled = true;
        this.cels = new Map();
        this._nextCelId = 1;
        this.frames = [{
            tag: '',
            delay: 100,
            celIds: this.layers.map(l => this._createCel(this._celFromLayer(l))),
        }];
        this.activeFrameIndex = 0;
    }

    disableAnimation() {
        if (!this.animationEnabled) return;
        // Keep frame 0's data
        if (this.frames.length > 0) {
            this.loadFrame(0);
        }
        this.animationEnabled = false;
        this.frames = [];
        this.cels = new Map();
        this._nextCelId = 1;
        this.activeFrameIndex = 0;
    }
}
