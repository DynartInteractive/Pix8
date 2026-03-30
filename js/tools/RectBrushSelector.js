import { BaseTool } from './BaseTool.js';
import { Brush } from '../model/Brush.js';

export class RectBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Rect Brush Sel';
        this.shortcut = '';
        this.icon = `<svg viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="12" fill="none" stroke-dasharray="2,2"/><circle cx="15" cy="6" r="2" fill="currentColor" stroke="none"/></svg>`;
        this._startX = null;
        this._startY = null;
    }

    onPointerDown(x, y, e) {
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

        const layer = this.doc.getActiveLayer();
        const minX = Math.max(0, Math.min(this._startX, x));
        const minY = Math.max(0, Math.min(this._startY, y));
        const maxX = Math.min(this.doc.width - 1, Math.max(this._startX, x));
        const maxY = Math.min(this.doc.height - 1, Math.max(this._startY, y));

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (w <= 0 || h <= 0) { this._startX = null; return; }

        const data = new Uint16Array(w * h);
        for (let by = 0; by < h; by++) {
            for (let bx = 0; bx < w; bx++) {
                data[by * w + bx] = layer.getPixel(minX + bx, minY + by);
            }
        }

        this.doc.activeBrush = new Brush(w, h, data, true);
        this.bus.emit('brush-changed');
        this.bus.emit('switch-tool', 'Brush'); // auto-switch to brush tool

        this._startX = null;
        this._startY = null;
    }
}
