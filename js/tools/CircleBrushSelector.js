import { BaseTool } from './BaseTool.js';
import { Brush } from '../model/Brush.js';
import { TRANSPARENT } from '../constants.js';

export class CircleBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Circle Brush Sel';
        this.shortcut = '';
        this.icon = `<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke-dasharray="2,2"/><circle cx="15" cy="5" r="2" fill="currentColor" stroke="none"/></svg>`;
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
        const dx = x - this._startX;
        const dy = y - this._startY;
        const r = Math.round(Math.sqrt(dx * dx + dy * dy));
        this.canvasView.drawOverlayEllipse(this._startX, this._startY, r, r, 'rgba(0, 200, 255, 0.8)');
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;
        this.canvasView.clearOverlay();

        const layer = this.doc.getActiveLayer();
        const cx = this._startX;
        const cy = this._startY;
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.round(Math.sqrt(dx * dx + dy * dy));

        if (r <= 0) { this._startX = null; return; }

        const minX = Math.max(0, cx - r);
        const minY = Math.max(0, cy - r);
        const maxX = Math.min(this.doc.width - 1, cx + r);
        const maxY = Math.min(this.doc.height - 1, cy + r);
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        const data = new Uint16Array(w * h);
        data.fill(TRANSPARENT);
        for (let by = 0; by < h; by++) {
            for (let bx = 0; bx < w; bx++) {
                const px = minX + bx;
                const py = minY + by;
                const distSq = (px - cx) * (px - cx) + (py - cy) * (py - cy);
                if (distSq <= r * r) {
                    data[by * w + bx] = layer.getPixel(px, py);
                }
            }
        }

        const brush = new Brush(w, h, data, true);
        brush.originX = cx - minX;
        brush.originY = cy - minY;
        this.doc.activeBrush = brush;
        this.bus.emit('brush-changed');
        this.bus.emit('switch-tool', 'Brush');

        this._startX = null;
        this._startY = null;
    }
}
