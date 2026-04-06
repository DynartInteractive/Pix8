export class Guides {
    constructor(canvasView) {
        this.cv = canvasView;
        this.guides = [];
        this.visible = true;

        this._dragging = null; // { axis, creating, guide?, pointerId }
        this._previewPos = null; // doc coordinate during drag

        this._onDocMove = (e) => this._handleDragMove(e);
        this._onDocUp = (e) => this._handleDragEnd(e);

        this._setupRulerListeners();
    }

    _setupRulerListeners() {
        const hCanvas = document.getElementById('ruler-h');
        const vCanvas = document.getElementById('ruler-v');

        hCanvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            this._startCreate('h', e);
        });

        vCanvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            this._startCreate('v', e);
        });
    }

    _startCreate(axis, e) {
        this._dragging = { axis, creating: true };
        this._previewPos = null;
        document.addEventListener('pointermove', this._onDocMove);
        document.addEventListener('pointerup', this._onDocUp);
        e.preventDefault();
    }

    startMove(guide) {
        this._dragging = { axis: guide.axis, creating: false, guide };
        this._previewPos = guide.position;
        document.addEventListener('pointermove', this._onDocMove);
        document.addEventListener('pointerup', this._onDocUp);
    }

    isDragging() {
        return this._dragging !== null;
    }

    _handleDragMove(e) {
        if (!this._dragging) return;
        const pos = this.cv.screenToDoc(e.clientX, e.clientY);
        const docPos = this._dragging.axis === 'h' ? pos.y : pos.x;
        this._previewPos = docPos;

        if (!this._dragging.creating) {
            this._dragging.guide.position = docPos;
        }

        this.cv.render();
    }

    _handleDragEnd(e) {
        if (!this._dragging) return;
        document.removeEventListener('pointermove', this._onDocMove);
        document.removeEventListener('pointerup', this._onDocUp);

        const overRuler = this._isOverRulerOrOutside(e.clientX, e.clientY);

        if (this._dragging.creating) {
            if (!overRuler && this._previewPos !== null) {
                this.guides.push({ axis: this._dragging.axis, position: this._previewPos });
            }
        } else {
            // Moving existing guide — remove if dragged to ruler/outside
            if (overRuler) {
                const idx = this.guides.indexOf(this._dragging.guide);
                if (idx >= 0) this.guides.splice(idx, 1);
            }
        }

        this._dragging = null;
        this._previewPos = null;
        this.cv.render();
    }

    _isOverRulerOrOutside(clientX, clientY) {
        const containerRect = this.cv.container.getBoundingClientRect();
        return clientX < containerRect.left || clientX > containerRect.right ||
               clientY < containerRect.top || clientY > containerRect.bottom;
    }

    hitTest(clientX, clientY) {
        const rect = this.cv.container.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        const threshold = 4;

        for (const g of this.guides) {
            if (g.axis === 'h') {
                const gy = this.cv.panY + g.position * this.cv.zoom;
                if (Math.abs(sy - gy) <= threshold) return g;
            } else {
                const gx = this.cv.panX + g.position * this.cv.zoom;
                if (Math.abs(sx - gx) <= threshold) return g;
            }
        }
        return null;
    }

    draw(ctx, w, h, zoom, panX, panY) {
        if (!this.visible) return;

        ctx.lineWidth = 1;

        // Draw placed guides
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.75)';
        for (const g of this.guides) {
            ctx.beginPath();
            if (g.axis === 'h') {
                const sy = Math.round(panY + g.position * zoom) + 0.5;
                ctx.moveTo(0, sy);
                ctx.lineTo(w, sy);
            } else {
                const sx = Math.round(panX + g.position * zoom) + 0.5;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
            }
            ctx.stroke();
        }

        // Draw drag preview
        if (this._dragging && this._dragging.creating && this._previewPos !== null) {
            ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
            ctx.beginPath();
            if (this._dragging.axis === 'h') {
                const sy = Math.round(panY + this._previewPos * zoom) + 0.5;
                ctx.moveTo(0, sy);
                ctx.lineTo(w, sy);
            } else {
                const sx = Math.round(panX + this._previewPos * zoom) + 0.5;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
            }
            ctx.stroke();
        }
    }

    clear() {
        this.guides = [];
    }
}
