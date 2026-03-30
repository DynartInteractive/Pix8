import { BaseTool } from './BaseTool.js';
import { Brush } from '../model/Brush.js';
import { pointInPolygon } from '../util/math.js';
import { TRANSPARENT } from '../constants.js';

export class PolyBrushSelector extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Poly Brush Sel';
        this.shortcut = '';
        this.icon = `<svg viewBox="0 0 20 20"><polygon points="4,16 2,8 10,2 18,8 16,16" fill="none" stroke-dasharray="2,2"/><circle cx="16" cy="4" r="2" fill="currentColor" stroke="none"/></svg>`;
        this._vertices = [];
        this._currentX = 0;
        this._currentY = 0;
    }

    onPointerDown(x, y, e) {
        // Close polygon if clicking near first vertex
        if (this._vertices.length >= 3) {
            const [fx, fy] = this._vertices[0];
            if (Math.abs(x - fx) <= 2 && Math.abs(y - fy) <= 2) {
                this._finalize();
                return;
            }
        }
        this._vertices.push([x, y]);
    }

    onPointerMove(x, y, e) {
        this._currentX = x;
        this._currentY = y;
        this._drawPreview();
    }

    onPointerUp(x, y, e) {
        // nothing — vertices placed on pointerDown
    }

    // Double-click closes the polygon (handled via rapid clicks)
    onDoubleClick() {
        if (this._vertices.length >= 3) {
            this._finalize();
        }
    }

    _drawPreview() {
        this.canvasView.clearOverlay();
        if (this._vertices.length === 0) return;

        const ctx = this.canvasView.overlayCtx;
        const zoom = this.canvasView.zoom;
        const px = this.canvasView.panX;
        const py = this.canvasView.panY;

        ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();

        const [sx, sy] = this._vertices[0];
        ctx.moveTo(px + (sx + 0.5) * zoom, py + (sy + 0.5) * zoom);

        for (let i = 1; i < this._vertices.length; i++) {
            const [vx, vy] = this._vertices[i];
            ctx.moveTo(px + (this._vertices[i - 1][0] + 0.5) * zoom, py + (this._vertices[i - 1][1] + 0.5) * zoom);
            ctx.lineTo(px + (vx + 0.5) * zoom, py + (vy + 0.5) * zoom);
        }

        // Line to current cursor
        const last = this._vertices[this._vertices.length - 1];
        ctx.moveTo(px + (last[0] + 0.5) * zoom, py + (last[1] + 0.5) * zoom);
        ctx.lineTo(px + (this._currentX + 0.5) * zoom, py + (this._currentY + 0.5) * zoom);

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw vertices as dots
        ctx.fillStyle = 'rgba(0, 200, 255, 0.9)';
        for (const [vx, vy] of this._vertices) {
            ctx.fillRect(px + vx * zoom - 1, py + vy * zoom - 1, 3, 3);
        }
    }

    _finalize() {
        this.canvasView.clearOverlay();

        const verts = this._vertices;
        this._vertices = [];

        if (verts.length < 3) return;

        const layer = this.doc.getActiveLayer();

        // Bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [vx, vy] of verts) {
            if (vx < minX) minX = vx;
            if (vy < minY) minY = vy;
            if (vx > maxX) maxX = vx;
            if (vy > maxY) maxY = vy;
        }
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(this.doc.width - 1, maxX);
        maxY = Math.min(this.doc.height - 1, maxY);

        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        if (w <= 0 || h <= 0) return;

        const data = new Uint16Array(w * h);
        data.fill(TRANSPARENT);
        for (let by = 0; by < h; by++) {
            for (let bx = 0; bx < w; bx++) {
                const px = minX + bx;
                const py = minY + by;
                if (pointInPolygon(px, py, verts)) {
                    data[by * w + bx] = layer.getPixel(px, py);
                }
            }
        }

        this.doc.activeBrush = new Brush(w, h, data, true);
        this.bus.emit('brush-changed');
        this.bus.emit('switch-tool', 'Brush');
    }

    // Reset state when switching away from this tool
    deactivate() {
        this._vertices = [];
        this.canvasView.clearOverlay();
    }
}
