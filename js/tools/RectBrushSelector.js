import { BaseTool } from './BaseTool.js';

export class RectBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Rect Select';
        this.shortcut = 'M';
        this.icon = `<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" fill="none" stroke-dasharray="2,2"/></svg>`;
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
        // If clicking inside an active selection, enter move mode
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
        this.canvasView.drawOverlayRect(this._startX, this._startY, c.x, c.y, 'rgba(0, 200, 255, 0.8)');
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

        // Click with no drag = deselect
        if (x === this._startX && y === this._startY) {
            this._startX = null;
            this._startY = null;
            const sel = this.doc.selection;
            if (sel.active) {
                if (sel.hasFloating()) sel.commitFloating(this.doc.getActiveLayer());
                sel.clear();
                this.bus.emit('selection-changed');
            }
            return;
        }

        const c = this._constrain(x, y, e);
        const minX = Math.max(0, Math.min(this._startX, c.x));
        const minY = Math.max(0, Math.min(this._startY, c.y));
        const maxX = Math.min(this.doc.width - 1, Math.max(this._startX, c.x));
        const maxY = Math.min(this.doc.height - 1, Math.max(this._startY, c.y));

        this._startX = null;
        this._startY = null;

        if (maxX - minX < 0 || maxY - minY < 0) return;

        this.doc.selection.selectRect(minX, minY, maxX, maxY);
        this.bus.emit('selection-changed');
    }
}
