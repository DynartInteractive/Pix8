import { BaseTool } from './BaseTool.js';

export class CircleBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Ellipse Select';
        this.shortcut = '';
        this.icon = `<svg viewBox="0 0 20 20"><ellipse cx="10" cy="10" rx="8" ry="5" fill="none" stroke-dasharray="2,2"/></svg>`;
        this._startX = null;
        this._startY = null;
        this._moving = false;
        this._hoveringSelection = false;
    }

    getCursor() {
        return this._hoveringSelection || this._moving ? 'move' : 'crosshair';
    }

    onHover(x, y) {
        const sel = this.doc.selection;
        this._hoveringSelection = sel.active && !sel.hasFloating() && sel.isSelected(x, y);
    }

    onPointerDown(x, y, e) {
        const sel = this.doc.selection;
        if (sel.hasFloating()) {
            sel.commitFloating(this.doc.getActiveLayer());
        }
        if (sel.active && sel.isSelected(x, y)) {
            this._moving = true;
        }
        this._startX = x;
        this._startY = y;
    }

    _constrain(x, y, e) {
        if (!e.shiftKey) return { x, y };
        const dx = x - this._startX;
        const dy = y - this._startY;
        const side = Math.max(Math.abs(dx), Math.abs(dy));
        return { x: this._startX + side * Math.sign(dx || 1), y: this._startY + side * Math.sign(dy || 1) };
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;
        if (this._moving) {
            const dx = x - this._startX;
            const dy = y - this._startY;
            if (dx !== 0 || dy !== 0) {
                this.doc.selection.moveMask(dx, dy);
                this._startX = x;
                this._startY = y;
                this.canvasView.invalidateSelectionEdges();
                this.bus.emit('selection-changed');
            }
            return;
        }
        const c = this._constrain(x, y, e);
        this.canvasView.clearOverlay();
        const minX = Math.min(this._startX, c.x);
        const minY = Math.min(this._startY, c.y);
        const maxX = Math.max(this._startX, c.x);
        const maxY = Math.max(this._startY, c.y);
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const rx = (maxX - minX) / 2;
        const ry = (maxY - minY) / 2;
        if (rx > 0 && ry > 0) {
            this.canvasView.drawOverlayEllipse(cx, cy, rx, ry, 'rgba(0, 200, 255, 0.8)');
        }
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;

        if (this._moving) {
            this._moving = false;
            this._startX = null;
            this._startY = null;
            return;
        }

        this.canvasView.clearOverlay();

        const x0 = this._startX;
        const y0 = this._startY;
        this._startX = null;
        this._startY = null;

        // Click with no drag = deselect
        if (x0 === x && y0 === y) {
            const sel = this.doc.selection;
            if (sel.active) {
                if (sel.hasFloating()) sel.commitFloating(this.doc.getActiveLayer());
                sel.clear();
                this.bus.emit('selection-changed');
            }
            return;
        }

        const c = this._constrain(x, y, e);
        this.doc.selection.selectEllipse(x0, y0, c.x, c.y);
        this.bus.emit('selection-changed');
    }
}
