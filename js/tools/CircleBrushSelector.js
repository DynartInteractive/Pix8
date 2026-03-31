import { BaseTool } from './BaseTool.js';

export class CircleBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Circle Select';
        this.shortcut = '';
        this.icon = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke-dasharray="2,2"/></svg>`;
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
        const dx = x - this._startX;
        const dy = y - this._startY;
        const r = Math.round(Math.sqrt(dx * dx + dy * dy));
        this.canvasView.drawOverlayEllipse(this._startX, this._startY, r, r, 'rgba(0, 200, 255, 0.8)');
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;
        this.canvasView.clearOverlay();

        const cx = this._startX;
        const cy = this._startY;
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.round(Math.sqrt(dx * dx + dy * dy));

        if (r <= 0) { this._startX = null; return; }

        this.doc.selection.selectCircle(cx, cy, r);
        this.bus.emit('selection-changed');

        this._startX = null;
        this._startY = null;
    }
}
