import { Renderer } from '../render/Renderer.js';
import Dialog from './Dialog.js';
import { withVersion } from '../constants.js';

export class FramePanel {
    constructor(doc, bus, undoManager) {
        this.doc = doc;
        this.bus = bus;
        this.undoManager = undoManager;
        this.panel = document.getElementById('frame-panel');
        this._list = null;
        this._playing = false;
        this._lastClickTime = 0;
        this._lastClickIndex = -1;
        this._playMode = null; // 'all' or 'tag'
        this._playFrameIndices = null; // indices to loop through
        this._playTimer = null;
        // Frame range selection, used by Link/Unlink. Always contains the active frame.
        this._selected = new Set([0]);
        this._selAnchor = 0;

        this._buildUI();

        this.bus.on('layer-changed', () => this._updateAllThumbs());
        this.bus.on('document-changed', () => this._updateAllThumbs());
        this.bus.on('frame-changed', () => this.render());
        this.bus.on('animation-changed', () => this.render());
        // Links are shown for the active layer only, so switching layers
        // changes which runs are drawn.
        this.bus.on('active-layer-changed', () => this.render());
    }

    _snapshotFrames() {
        return {
            activeFrameIndex: this.doc.activeFrameIndex,
            anim: this.doc.snapshotAnimation(),
        };
    }

    _buildUI() {
        // Header
        const header = document.createElement('div');
        header.className = 'frame-panel-header';

        const btn = (iconSrc, title, action) => {
            const b = document.createElement('button');
            b.className = 'icon-btn';
            const img = document.createElement('img');
            img.src = withVersion(iconSrc);
            img.className = 'panel-icon';
            img.draggable = false;
            b.appendChild(img);
            b.title = title;
            b.addEventListener('click', action);
            header.appendChild(b);
            return b;
        };

        const addFrame = (linked) => {
            const before = this._snapshotFrames();
            this.doc.addFrame(linked);
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-add',
                beforeAnim: before.anim,
                afterAnim: after.anim,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this._selectOnly(this.doc.activeFrameIndex);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
        };

        btn('images/icon-add.svg', 'Add frame (copy)', () => addFrame(false));
        btn('images/icon-add-linked.svg', 'Add linked frame (shares this frame’s cels)', () => addFrame(true));
        btn('images/icon-delete.svg', 'Delete frame', () => {
            if (this.doc.frames.length <= 1) return;
            if (!confirm('Delete this frame?')) return;
            const before = this._snapshotFrames();
            this.doc.deleteFrame(this.doc.activeFrameIndex);
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-delete',
                beforeAnim: before.anim,
                afterAnim: after.anim,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this._selectOnly(this.doc.activeFrameIndex);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
        });
        btn('images/icon-move-left.svg', 'Move left', () => {
            this.doc.saveCurrentFrame();
            const from = this.doc.activeFrameIndex;
            if (this.doc.moveFrame(from, -1)) {
                this.undoManager.pushEntry({
                    type: 'frame-move',
                    fromIndex: from,
                    toIndex: this.doc.activeFrameIndex,
                });
                this.bus.emit('frame-changed');
                this.bus.emit('animation-changed');
            }
        });
        btn('images/icon-move-right.svg', 'Move right', () => {
            this.doc.saveCurrentFrame();
            const from = this.doc.activeFrameIndex;
            if (this.doc.moveFrame(from, 1)) {
                this.undoManager.pushEntry({
                    type: 'frame-move',
                    fromIndex: from,
                    toIndex: this.doc.activeFrameIndex,
                });
                this.bus.emit('frame-changed');
                this.bus.emit('animation-changed');
            }
        });

        const sepLink = document.createElement('span');
        sepLink.style.cssText = 'width:1px;height:16px;background:var(--border);margin:0 4px;';
        header.appendChild(sepLink);

        // Link ops act on the ACTIVE LAYER across the selected frames — a cel is
        // (layer × frame), so there is no such thing as linking a whole frame.
        this._linkBtn = btn('images/icon-link.svg', 'Link cels (active layer, selected frames)', () => {
            const li = this.doc.activeLayerIndex;
            const targets = [...this._selected].filter(i => i !== this.doc.activeFrameIndex);
            if (targets.length === 0) return;
            const n = targets.length;
            if (!confirm(`Link the active layer across ${n + 1} frames?\n\nThe other ${n} frame${n > 1 ? 's' : ''} will share this frame's image — their current content on this layer is discarded.`)) return;
            const before = this._snapshotFrames();
            if (!this.doc.linkCels(li, targets, this.doc.activeFrameIndex)) return;
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-link',
                beforeAnim: before.anim,
                afterAnim: after.anim,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
        });
        this._unlinkBtn = btn('images/icon-unlink.svg', 'Unlink cels (active layer, selected frames)', () => {
            const li = this.doc.activeLayerIndex;
            const before = this._snapshotFrames();
            let changed = false;
            for (const fi of this._selected) {
                if (this.doc.unlinkCel(fi, li)) changed = true;
            }
            if (!changed) return;
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-link',
                beforeAnim: before.anim,
                afterAnim: after.anim,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
        });

        const sep = document.createElement('span');
        sep.style.cssText = 'width:1px;height:16px;background:var(--border);margin:0 4px;';
        header.appendChild(sep);

        this._playBtn = btn('images/icon-play.svg', 'Play all', () => this._play());
        this._playTagBtn = btn('images/icon-play-tag.svg', 'Play tag', () => this._playTag());
        this._pauseBtn = btn('images/icon-pause.svg', 'Pause', () => this._pause());
        this._stopBtn = btn('images/icon-stop.svg', 'Stop', () => this._stop());

        const sep2 = document.createElement('span');
        sep2.style.cssText = 'width:1px;height:16px;background:var(--border);margin:0 4px;';
        header.appendChild(sep2);

        // Onion skinning checkbox
        const onionLabel = document.createElement('label');
        onionLabel.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-dim);cursor:pointer;user-select:none;';
        this._onionCheckbox = document.createElement('input');
        this._onionCheckbox.type = 'checkbox';
        this._onionCheckbox.checked = this.doc.onionSkinning;
        this._onionCheckbox.addEventListener('change', () => {
            this.doc.onionSkinning = this._onionCheckbox.checked;
            this.bus.emit('document-changed');
        });
        onionLabel.appendChild(this._onionCheckbox);
        onionLabel.appendChild(document.createTextNode('Onion'));
        header.appendChild(onionLabel);

        // Onion opacity input
        this._onionOpacityInput = document.createElement('input');
        this._onionOpacityInput.type = 'number';
        this._onionOpacityInput.min = 1;
        this._onionOpacityInput.max = 100;
        this._onionOpacityInput.value = this.doc.onionOpacity ?? 50;
        this._onionOpacityInput.style.cssText = 'width:38px;padding:1px 3px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:11px;text-align:center;';
        this._onionOpacityInput.addEventListener('change', () => {
            this.doc.onionOpacity = Math.max(1, Math.min(100, parseInt(this._onionOpacityInput.value) || 50));
            this._onionOpacityInput.value = this.doc.onionOpacity;
            this.bus.emit('document-changed');
        });
        const pctLabel = document.createElement('span');
        pctLabel.textContent = '%';
        pctLabel.style.cssText = 'font-size:11px;color:var(--text-dim);';
        header.appendChild(this._onionOpacityInput);
        header.appendChild(pctLabel);

        // Onion extended checkbox (+/- 2 frames)
        const extLabel = document.createElement('label');
        extLabel.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-dim);cursor:pointer;user-select:none;margin-left:2px;';
        this._onionExtCheckbox = document.createElement('input');
        this._onionExtCheckbox.type = 'checkbox';
        this._onionExtCheckbox.checked = this.doc.onionExtended;
        this._onionExtCheckbox.addEventListener('change', () => {
            this.doc.onionExtended = this._onionExtCheckbox.checked;
            this.bus.emit('document-changed');
        });
        extLabel.appendChild(this._onionExtCheckbox);
        extLabel.appendChild(document.createTextNode('\u00B12'));
        header.appendChild(extLabel);

        this.panel.appendChild(header);

        // Frame list
        this._list = document.createElement('div');
        this._list.className = 'frame-list';

        // Wheel scrolls the timeline horizontally. Mypal draws no horizontal
        // scrollbar here even though the row genuinely overflows and there is
        // room for one (Supermium draws it fine), which leaves the later frames
        // of a long animation unreachable by mouse. This does not depend on the
        // browser rendering a scrollbar at all.
        this._list.addEventListener('wheel', (e) => {
            if (this._list.scrollWidth <= this._list.clientWidth) return;
            const raw = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
            if (!raw) return;
            // Firefox reports deltas in lines (deltaMode 1), Chromium in pixels.
            const unit = e.deltaMode === 1 ? 16 : (e.deltaMode === 2 ? this._list.clientWidth : 1);
            e.preventDefault();
            this._list.scrollLeft += raw * unit;
        }, { passive: false });

        this.panel.appendChild(this._list);
    }

    show() {
        this.panel.classList.add('visible');
        this._onionCheckbox.checked = this.doc.onionSkinning;
        this._onionOpacityInput.value = this.doc.onionOpacity ?? 50;
        this._onionExtCheckbox.checked = this.doc.onionExtended;
        this.render();
    }

    hide() {
        this._stop();
        this.panel.classList.remove('visible');
    }

    _selectOnly(index) {
        this._selected = new Set([index]);
        this._selAnchor = index;
    }

    /** Frames sharing the active layer's cel with `i`, as neighbour flags. */
    _linkNeighbours(i) {
        const frames = this.doc.frames;
        const li = this.doc.activeLayerIndex;
        const id = frames[i].celIds?.[li];
        if (id === undefined) return { prev: false, next: false };
        return {
            prev: i > 0 && frames[i - 1].celIds?.[li] === id,
            next: i < frames.length - 1 && frames[i + 1].celIds?.[li] === id,
        };
    }

    _updateLinkButtons() {
        const li = this.doc.activeLayerIndex;
        const doc = this.doc;
        this._linkBtn.disabled = this._selected.size < 2;
        let anyLinked = false;
        for (const fi of this._selected) {
            if (doc.isCelLinked(fi, li)) { anyLinked = true; break; }
        }
        this._unlinkBtn.disabled = !anyLinked;
    }

    render() {
        // Flush live layers into their cels first: a linked cel edited on the
        // active frame must show up in its siblings' thumbnails too.
        this.doc.saveCurrentFrame();
        // Same clamp-to-zero as the layers list, on the horizontal axis: wiping
        // the thumbs collapses scrollWidth, so a scrubbed timeline snapped back
        // to frame 1 on every frame-changed.
        const scrollLeft = this._list.scrollLeft;
        this._list.innerHTML = '';
        const frames = this.doc.frames;
        const activeIdx = this.doc.activeFrameIndex;
        this._renderedLayerIndex = this.doc.activeLayerIndex;

        // Drop selection entries left dangling by a delete/undo
        this._selected = new Set([...this._selected].filter(i => i < frames.length));
        // "The selection always contains the active frame" is an invariant of
        // *user* frame changes. Playback moves the active frame too, and
        // enforcing it there accumulated every frame the playhead passed
        // through into the selection, so the whole timeline ended up styled as
        // selected until something reset it. While playing the selection is
        // left alone; _pause and _stop then collapse it onto whichever frame
        // the playhead landed on.
        if (!this._playing) this._selected.add(activeIdx);

        // Determine which tag group the active frame belongs to
        let activeTag = null;
        for (let j = activeIdx; j >= 0; j--) {
            if (frames[j].tag) { activeTag = frames[j].tag; break; }
        }

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];

            const thumb = document.createElement('div');
            thumb.className = 'frame-thumb'
                + (i === activeIdx ? ' active' : '')
                + (this._selected.has(i) && i !== activeIdx ? ' selected' : '');

            // Tag label above the frame (only on tag-start frames)
            if (frame.tag) {
                const tagLabel = document.createElement('div');
                tagLabel.className = 'frame-tag-label';
                tagLabel.textContent = frame.tag;
                // Active tag group gets higher z-index
                if (frame.tag === activeTag) {
                    tagLabel.classList.add('active-tag');
                }
                thumb.appendChild(tagLabel);
            }

            // Preview canvas
            const canvas = document.createElement('canvas');
            const scale = Math.min(48 / this.doc.width, 36 / this.doc.height);
            canvas.width = Math.round(this.doc.width * scale);
            canvas.height = Math.round(this.doc.height * scale);
            canvas.style.cssText = `image-rendering:pixelated;`;
            this._renderThumb(canvas, frame, i);
            thumb.appendChild(canvas);

            // Label — always show frame number
            const label = document.createElement('div');
            label.className = 'frame-label';
            label.textContent = `${i + 1}`;
            thumb.appendChild(label);

            // Link run for the ACTIVE LAYER only. The bar bridges the 4px gap
            // between thumbs so a run reads as one continuous span.
            const { prev, next } = this._linkNeighbours(i);
            if (prev || next) {
                const bar = document.createElement('div');
                bar.className = 'frame-link-bar';
                if (prev) bar.style.left = '-4px';
                if (next) bar.style.right = '-4px';
                bar.title = 'Linked cel — shared with adjacent frames on this layer';
                thumb.appendChild(bar);
            }

            thumb.addEventListener('click', (e) => {
                if (this._playing) return;
                if (e.shiftKey) {
                    // Extend the range from the anchor; don't treat as a double-click
                    this._lastClickTime = 0;
                    const lo = Math.min(this._selAnchor, i);
                    const hi = Math.max(this._selAnchor, i);
                    this._selected = new Set();
                    for (let k = lo; k <= hi; k++) this._selected.add(k);
                    // _switchFrame re-renders via 'frame-changed'; only render
                    // here when it short-circuits on an unchanged index.
                    const sameFrame = i === this.doc.activeFrameIndex;
                    this._switchFrame(i);
                    if (sameFrame) this.render();
                    return;
                }
                const now = Date.now();
                if (now - this._lastClickTime < 400 && this._lastClickIndex === i) {
                    this._lastClickTime = 0;
                    this._editFrame(i, frame);
                    return;
                }
                this._lastClickTime = now;
                this._lastClickIndex = i;
                this._selectOnly(i);
                const sameFrame = i === this.doc.activeFrameIndex;
                this._switchFrame(i);
                if (sameFrame) this.render();
            });

            this._list.appendChild(thumb);
        }

        this._list.scrollLeft = scrollLeft;
        this._scrollActiveIntoView();
        this._updateLinkButtons();
    }

    // Restoring the offset alone can leave the active frame off-screen — the
    // playhead moves during playback and stepFrame(), and a tab switch arrives
    // with a different activeFrameIndex. 'nearest' makes this a minimal nudge,
    // so a hand-scrolled timeline showing the active frame is left alone.
    _scrollActiveIntoView() {
        const active = this._list.querySelector('.frame-thumb.active');
        if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // The frame list is one DOM node shared by every tab, each with its own
    // frames; app.js persists the offset per tab alongside zoom/pan.
    getScrollLeft() {
        return this._list.scrollLeft;
    }

    setScrollLeft(value) {
        this._list.scrollLeft = value || 0;
        this._scrollActiveIntoView();
    }

    _renderThumb(canvas, frame, frameIndex) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Temporarily load frame data to render it
        const doc = this.doc;
        const isActive = frameIndex === doc.activeFrameIndex;

        // For active frame, render current state; for others, temporarily swap
        if (!isActive && frame.celIds) {
            // Save current layer state
            const saved = doc.layers.map(l => ({
                data: l.data, opacity: l.opacity, textData: l.textData,
                offsetX: l.offsetX, offsetY: l.offsetY,
                width: l.width, height: l.height,
            }));
            // Load frame data
            doc._restoreLayersFromFrame(frame);
            // Render
            const renderer = new Renderer(doc);
            const imageData = renderer.composite();
            const tmp = document.createElement('canvas');
            tmp.width = doc.width;
            tmp.height = doc.height;
            tmp.getContext('2d').putImageData(imageData, 0, 0);
            ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
            // Restore
            for (let i = 0; i < doc.layers.length && i < saved.length; i++) {
                const s = saved[i];
                doc.layers[i].data = s.data;
                doc.layers[i].opacity = s.opacity;
                doc.layers[i].textData = s.textData;
                doc.layers[i].offsetX = s.offsetX;
                doc.layers[i].offsetY = s.offsetY;
                doc.layers[i].width = s.width;
                doc.layers[i].height = s.height;
            }
        } else {
            const renderer = new Renderer(doc);
            const imageData = renderer.composite();
            const tmp = document.createElement('canvas');
            tmp.width = doc.width;
            tmp.height = doc.height;
            tmp.getContext('2d').putImageData(imageData, 0, 0);
            ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
        }
    }

    _updateAllThumbs() {
        if (!this.doc.animationEnabled || !this.panel.classList.contains('visible')) return;
        // Link runs are drawn for the active layer, but 'active-layer-changed'
        // only fires on a layer-row click — add/delete/undo move the active
        // layer silently. Comparing against what we last drew catches them all.
        if (this._renderedLayerIndex !== this.doc.activeLayerIndex) {
            this.render();
            return;
        }
        // Push the in-progress edit into its cel so frames linked to it repaint too
        this.doc.saveCurrentFrame();
        const thumbs = this._list.querySelectorAll('.frame-thumb');
        const frames = this.doc.frames;
        for (let i = 0; i < thumbs.length && i < frames.length; i++) {
            const canvas = thumbs[i].querySelector('canvas');
            if (canvas) this._renderThumb(canvas, frames[i], i);
        }
    }

    _switchFrame(index) {
        if (index === this.doc.activeFrameIndex) return;
        this.doc.saveCurrentFrame();
        this.doc.loadFrame(index);
        this.bus.emit('frame-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }

    /** Step to the previous (-1) or next (+1) frame, wrapping around. */
    stepFrame(dir) {
        const n = this.doc.frames.length;
        if (n <= 1) return;
        if (this._playing) this._pause();
        const target = (this.doc.activeFrameIndex + dir + n) % n;
        this._selectOnly(target);
        this._switchFrame(target);
        // No scroll fix-up here: _switchFrame emitted 'frame-changed', and
        // render() scrolls the active thumb into view itself now.
    }

    _editFrame(index, frame) {
        const dlg = Dialog.create({
            title: `Frame ${index + 1} Properties`,
            width: '260px',
            buttons: [
                { label: 'Cancel' },
                { label: 'OK', primary: true, onClick: () => {
                    const newTag = tagInput.value.trim();
                    const newDelay = Math.max(1, parseInt(delayInput.value) || 100);
                    if (newTag !== frame.tag || newDelay !== frame.delay) {
                        const beforeTag = frame.tag;
                        const beforeDelay = frame.delay;
                        frame.tag = newTag;
                        frame.delay = newDelay;
                        this.undoManager.pushEntry({
                            type: 'frame-edit',
                            frameIndex: index,
                            beforeTag,
                            afterTag: newTag,
                            beforeDelay,
                            afterDelay: newDelay,
                        });
                    }
                    this.render();
                    dlg.close();
                }},
            ],
            enterButton: 1,
        });

        const body = dlg.body;
        body.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 0;';

        const tagRow = document.createElement('div');
        tagRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const tagLabel = document.createElement('label');
        tagLabel.textContent = 'Tag:';
        tagLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.value = frame.tag || '';
        tagInput.placeholder = 'e.g. idle, run';
        tagInput.style.cssText = 'flex:1;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;';
        tagRow.appendChild(tagLabel);
        tagRow.appendChild(tagInput);
        body.appendChild(tagRow);

        const delayRow = document.createElement('div');
        delayRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const delayLabel = document.createElement('label');
        delayLabel.textContent = 'Delay:';
        delayLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.value = frame.delay || 100;
        delayInput.min = 1;
        delayInput.max = 10000;
        delayInput.style.cssText = 'width:80px;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;';
        const delayUnit = document.createElement('span');
        delayUnit.textContent = 'ms';
        delayUnit.style.cssText = 'font-size:12px;color:var(--text-dim);';
        delayRow.appendChild(delayLabel);
        delayRow.appendChild(delayInput);
        delayRow.appendChild(delayUnit);
        body.appendChild(delayRow);

        dlg.show(tagInput);
    }

    _getTagFrameIndices() {
        // A tag marks the start of a group. The group extends until the next
        // tagged frame (or end of frames). Find which group the active frame
        // belongs to and return all indices in that group.
        const frames = this.doc.frames;
        const idx = this.doc.activeFrameIndex;

        // Walk backwards to find the group's start (a frame with a non-empty tag)
        let start = idx;
        while (start > 0 && !frames[start].tag) start--;
        // If the start frame has no tag either, there's no tag group here
        if (!frames[start].tag) return null;

        // Walk forwards from start to find the end (next tagged frame or end)
        let end = start + 1;
        while (end < frames.length && !frames[end].tag) end++;
        // end is now exclusive

        if (end - start < 2) return null; // single frame, nothing to animate
        const indices = [];
        for (let i = start; i < end; i++) indices.push(i);
        return indices;
    }

    togglePlayTag() {
        if (this._playing) {
            this._stop();
        } else {
            this._playTag();
        }
    }

    _setPlayingState(playing) {
        this._playing = playing;
        this._playBtn.disabled = playing;
        this._playTagBtn.disabled = playing;
    }

    _play() {
        if (this._playing || this.doc.frames.length <= 1) return;
        this._playMode = 'all';
        const indices = [];
        for (let i = 0; i < this.doc.frames.length; i++) indices.push(i);
        this._playFrameIndices = indices;
        this._setPlayingState(true);
        this._tick();
    }

    _playTag() {
        if (this._playing) return;
        const indices = this._getTagFrameIndices();
        if (!indices) return; // not in a tag group or only 1 frame
        this._playMode = 'tag';
        this._playFrameIndices = indices;
        this._setPlayingState(true);
        this._tick();
    }

    _tick() {
        if (!this._playing) return;
        this.doc.saveCurrentFrame();
        const indices = this._playFrameIndices;
        const curPos = indices.indexOf(this.doc.activeFrameIndex);
        const nextPos = (curPos + 1) % indices.length;
        const nextIdx = indices[nextPos];
        this.doc.loadFrame(nextIdx);
        this.bus.emit('frame-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
        const delay = this.doc.frames[nextIdx].delay || 100;
        this._playTimer = setTimeout(() => this._tick(), delay);
    }

    _pause() {
        // Pause: stop playback but stay on current frame
        if (!this._playing) return;
        this._playing = false;
        this._playMode = null;
        this._playFrameIndices = null;
        this._setPlayingState(false);
        if (this._playTimer) {
            clearTimeout(this._playTimer);
            this._playTimer = null;
        }
        // Land on the frame the playhead stopped at, the same as stepping to it
        // would: one highlighted frame, not the playhead plus whatever was
        // selected before Play was pressed.
        this._selectOnly(this.doc.activeFrameIndex);
        this.render();
    }

    _stop() {
        // Stop: stop playback and jump to beginning
        if (!this._playing) return;
        const mode = this._playMode;
        const indices = this._playFrameIndices;
        this._playing = false;
        this._setPlayingState(false);
        if (this._playTimer) {
            clearTimeout(this._playTimer);
            this._playTimer = null;
        }
        // Jump to first frame of the played range
        const targetIdx = (mode === 'tag' && indices && indices.length > 0) ? indices[0] : 0;
        if (targetIdx !== this.doc.activeFrameIndex) {
            this.doc.saveCurrentFrame();
            this.doc.loadFrame(targetIdx);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
        this._playMode = null;
        this._playFrameIndices = null;
        // As in _pause: collapse to the frame we landed on. Also covers the
        // case where the jump above was a no-op because playback happened to
        // stop on the target frame, which skipped the re-render entirely.
        this._selectOnly(this.doc.activeFrameIndex);
        this.render();
    }
}
