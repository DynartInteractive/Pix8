export class UndoManager {
    constructor(doc, bus, maxEntries = 50) {
        this.doc = doc;
        this.bus = bus;
        this.maxEntries = maxEntries;
        this.undoStack = [];
        this.redoStack = [];
        this._snapshots = null;
        this._selectionSnapshot = null;
    }

    /** Call before a tool operation begins (on pointer down). */
    beginOperation() {
        // Snapshot every layer the operation may touch: the active one plus any
        // additionally selected layers (Move and nudge act on all of them).
        const indices = new Set(this.doc.selectedLayerIndices);
        indices.add(this.doc.activeLayerIndex);
        this._snapshots = [];
        for (const idx of indices) {
            const layer = this.doc.layers[idx];
            if (!layer) continue;
            this._snapshots.push({
                index: idx,
                data: layer.snapshotData(),
                geometry: layer.snapshotGeometry(),
            });
        }
        this._selectionSnapshot = this.doc.selection.snapshot();
    }

    _layerChanged(before, afterData, afterGeometry) {
        const bg = before.geometry;
        if (bg.width !== afterGeometry.width || bg.height !== afterGeometry.height ||
            bg.offsetX !== afterGeometry.offsetX || bg.offsetY !== afterGeometry.offsetY) {
            return true;
        }
        const afterArr = afterData.data || afterData;
        const beforeArr = before.data.data || before.data;
        if (afterArr.length !== beforeArr.length) return true;
        for (let i = 0; i < afterArr.length; i++) {
            if (afterArr[i] !== beforeArr[i]) return true;
        }
        return false;
    }

    /** Call after a tool operation ends (on pointer up). */
    endOperation() {
        if (this._snapshots === null) return;

        const changed = [];
        for (const before of this._snapshots) {
            const layer = this.doc.layers[before.index];
            if (!layer) continue;
            const afterData = layer.snapshotData();
            const afterGeometry = layer.snapshotGeometry();
            if (this._layerChanged(before, afterData, afterGeometry)) {
                changed.push({
                    layerIndex: before.index,
                    beforeData: before.data,
                    afterData: afterData,
                    beforeGeometry: before.geometry,
                    afterGeometry: afterGeometry,
                });
            }
        }

        const afterSelection = this.doc.selection.snapshot();

        // Check if selection changed
        let selectionChanged = false;
        const bs = this._selectionSnapshot;
        if (bs.active !== afterSelection.active) {
            selectionChanged = true;
        } else if (bs.active) {
            for (let i = 0; i < bs.mask.length; i++) {
                if (bs.mask[i] !== afterSelection.mask[i]) {
                    selectionChanged = true;
                    break;
                }
            }
            if (!selectionChanged) {
                const bf = bs.floating;
                const af = afterSelection.floating;
                if ((!bf) !== (!af)) {
                    selectionChanged = true;
                } else if (bf && af) {
                    if (bf.originX !== af.originX || bf.originY !== af.originY) {
                        selectionChanged = true;
                    }
                }
            }
        }

        if (changed.length > 0 || selectionChanged) {
            this.undoStack.push({
                layers: changed,
                beforeSelection: this._selectionSnapshot,
                afterSelection: afterSelection,
            });

            if (this.undoStack.length > this.maxEntries) {
                this.undoStack.shift();
            }

            this.redoStack = [];
        }

        this._snapshots = null;
        this._selectionSnapshot = null;
    }

    pushEntry(entry) {
        this.undoStack.push(entry);
        if (this.undoStack.length > this.maxEntries) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    _restoreLayerState(entry, side) {
        this.doc.activeLayerIndex = entry[side + 'ActiveIndex'];
        this.doc.selectedLayerIndices = new Set(entry[side + 'Selected']);
        if (entry[side + 'Anim']) {
            this.doc.restoreAnimation(entry[side + 'Anim']);
        }
    }

    /** Restore the 'before'/'after' side of a generic (tool) undo entry. */
    _restoreLayers(entry, side) {
        for (const rec of entry.layers) {
            const layer = this.doc.layers[rec.layerIndex];
            if (layer) {
                layer.restoreSnapshot(rec[side + 'Data'], rec[side + 'Geometry']);
            }
        }
    }

    _restoreResize(entry, key) {
        const size = entry[key + 'DocSize'];
        const layers = entry[key + 'Layers'];
        const sel = entry[key + 'Selection'];
        this.doc.width = size.width;
        this.doc.height = size.height;
        for (let i = 0; i < this.doc.layers.length; i++) {
            if (layers[i]) {
                this.doc.layers[i].restoreSnapshot(layers[i].data, layers[i].geometry);
            }
        }
        this.doc.selection.resize(size.width, size.height);
        this.doc.selection.restoreSnapshot(sel);
        document.getElementById('status-size').textContent = `${size.width} x ${size.height}`;
    }

    undo() {
        const entry = this.undoStack.pop();
        if (!entry) return;

        if (entry.type === 'palette') {
            this.doc.palette.import(entry.beforePalette);
            this.doc.layers = entry.beforeLayers;
            if (entry.beforeAnim) {
                this.doc.restoreAnimation(entry.beforeAnim);
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.redoStack.push(entry);
            this.bus.emit('palette-changed');
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'resize') {
            this._restoreResize(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'merge-layers') {
            this.doc.layers = entry.beforeLayers.map(l => l.clone(true));
            this.doc.activeLayerIndex = entry.beforeActiveIndex;
            this.doc.selectedLayerIndices = new Set(entry.beforeSelected);
            if (entry.beforeAnim) {
                this.doc.restoreAnimation(entry.beforeAnim);
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-add') {
            this.doc.layers.splice(entry.insertIndex, 1);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-delete') {
            this.doc.layers.splice(entry.removedIndex, 0, entry.layer);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-move') {
            const [layer] = this.doc.layers.splice(entry.toIndex, 1);
            this.doc.layers.splice(entry.fromIndex, 0, layer);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-rename') {
            this.doc.layers[entry.layerIndex].name = entry.beforeName;
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            return;
        }

        if (entry.type === 'layer-visibility') {
            for (let i = 0; i < entry.beforeStates.length; i++) {
                this.doc.layers[i].visible = entry.beforeStates[i];
            }
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-opacity') {
            this.doc.layers[entry.layerIndex].opacity = entry.beforeOpacity;
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-add' || entry.type === 'frame-delete' || entry.type === 'frame-link') {
            this.doc.restoreAnimation(entry.beforeAnim);
            this.doc.activeFrameIndex = entry.beforeActiveFrame;
            this.doc.loadFrame(this.doc.activeFrameIndex);
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-move') {
            const [frame] = this.doc.frames.splice(entry.toIndex, 1);
            this.doc.frames.splice(entry.fromIndex, 0, frame);
            this.doc.activeFrameIndex = entry.fromIndex;
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        if (entry.type === 'frame-edit') {
            const frame = this.doc.frames[entry.frameIndex];
            frame.tag = entry.beforeTag;
            frame.delay = entry.beforeDelay;
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        this._restoreLayers(entry, 'before');
        this.doc.selection.restoreSnapshot(entry.beforeSelection);
        this.redoStack.push(entry);
        this.bus.emit('selection-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }

    redo() {
        const entry = this.redoStack.pop();
        if (!entry) return;

        if (entry.type === 'palette') {
            this.doc.palette.import(entry.afterPalette);
            this.doc.layers = entry.afterLayers;
            if (entry.afterAnim) {
                this.doc.restoreAnimation(entry.afterAnim);
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.undoStack.push(entry);
            this.bus.emit('palette-changed');
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'resize') {
            this._restoreResize(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'merge-layers') {
            this.doc.layers = entry.afterLayers.map(l => l.clone(true));
            this.doc.activeLayerIndex = entry.afterActiveIndex;
            this.doc.selectedLayerIndices = new Set(entry.afterSelected);
            if (entry.afterAnim) {
                this.doc.restoreAnimation(entry.afterAnim);
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-add') {
            this.doc.layers.splice(entry.insertIndex, 0, entry.layer);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-delete') {
            this.doc.layers.splice(entry.removedIndex, 1);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-move') {
            const [layer] = this.doc.layers.splice(entry.fromIndex, 1);
            this.doc.layers.splice(entry.toIndex, 0, layer);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-rename') {
            this.doc.layers[entry.layerIndex].name = entry.afterName;
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            return;
        }

        if (entry.type === 'layer-visibility') {
            for (let i = 0; i < entry.afterStates.length; i++) {
                this.doc.layers[i].visible = entry.afterStates[i];
            }
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-opacity') {
            this.doc.layers[entry.layerIndex].opacity = entry.afterOpacity;
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-add' || entry.type === 'frame-delete' || entry.type === 'frame-link') {
            this.doc.restoreAnimation(entry.afterAnim);
            this.doc.activeFrameIndex = entry.afterActiveFrame;
            this.doc.loadFrame(this.doc.activeFrameIndex);
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-move') {
            const [frame] = this.doc.frames.splice(entry.fromIndex, 1);
            this.doc.frames.splice(entry.toIndex, 0, frame);
            this.doc.activeFrameIndex = entry.toIndex;
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        if (entry.type === 'frame-edit') {
            const frame = this.doc.frames[entry.frameIndex];
            frame.tag = entry.afterTag;
            frame.delay = entry.afterDelay;
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        this._restoreLayers(entry, 'after');
        this.doc.selection.restoreSnapshot(entry.afterSelection);
        this.undoStack.push(entry);
        this.bus.emit('selection-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }
}
