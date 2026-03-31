import { BaseTool } from './BaseTool.js';

export class RectBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Rect Select';
        this.shortcut = 'M';
        this.icon = `<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" fill="none" stroke-dasharray="2,2"/></svg>`;
        this._startX = null;
        this._startY = null;
    }

    onPointerDown(x, y, e) {
        const sel = this.doc.selection;
        if (sel.hasFloating()) {
            sel.commitFloating(this.doc.getActiveLayer());
        }
        this._startX = x;
        this._startY = y;
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;
        this.canvasView.clearOverlay();
        this.canvasView.drawOverlayRect(this._startX, this._startY, x, y, 'rgba(0, 200, 255, 0.8)');
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;
        this.canvasView.clearOverlay();

        const minX = Math.max(0, Math.min(this._startX, x));
        const minY = Math.max(0, Math.min(this._startY, y));
        const maxX = Math.min(this.doc.width - 1, Math.max(this._startX, x));
        const maxY = Math.min(this.doc.height - 1, Math.max(this._startY, y));

        if (maxX - minX < 0 || maxY - minY < 0) {
            this._startX = null;
            return;
        }

        this.doc.selection.selectRect(minX, minY, maxX, maxY);
        this.bus.emit('selection-changed');

        this._startX = null;
        this._startY = null;
    }
}
