import { TRANSPARENT } from '../constants.js';
import { bresenhamLine, snapEndpoint } from '../util/math.js';

export class BaseTool {
    constructor(doc, bus, canvasView) {
        this.doc = doc;
        this.bus = bus;
        this.canvasView = canvasView;
        this.name = 'base';
        this.icon = '';
        this.shortcut = '';
        // Last position this tool painted. Unlike a stroke's _lastX/_lastY it
        // survives pointer-up — see the line-anchor block below.
        this._anchorX = null;
        this._anchorY = null;
    }

    onPointerDown(x, y, e) {}
    onPointerMove(x, y, e) {}
    onPointerUp(x, y, e) {}

    onHover(x, y, e) {
        this.canvasView.drawBrushPreview(x, y);
    }

    // ── Shift line anchor ───────────────────────────────────────────
    //
    // GIMP-style: the anchor is wherever this tool last drew, and it outlives
    // the stroke. So you can put a pixel down, release, *then* hold Shift and
    // get a live line preview running from that pixel to the cursor; clicking
    // commits it and moves the anchor to the new end point, ready to chain.
    //
    // With no anchor yet (first stroke after the tool was picked, or after a
    // document switch) Shift keeps the older behavior instead: the press point
    // starts the line and the drag sets its end.

    hasLineAnchor() {
        return this._anchorX !== null;
    }

    setLineAnchor(x, y) {
        this._anchorX = x;
        this._anchorY = y;
    }

    clearLineAnchor() {
        this._anchorX = null;
        this._anchorY = null;
    }

    // Where a line from (x0,y0) should end, honouring Ctrl snap-to-22.5deg.
    lineEndpoint(x0, y0, x, y, e) {
        return (e && e.ctrlKey) ? snapEndpoint(x0, y0, x, y) : { x, y };
    }

    // Preview the pending line while Shift is held with no button down.
    // Returns false when there's nothing to preview, so onHover can fall back
    // to the plain brush dab.
    previewLineFromAnchor(x, y, e) {
        if (!e || !e.shiftKey || !this.hasLineAnchor()) return false;
        const end = this.lineEndpoint(this._anchorX, this._anchorY, x, y, e);
        this.canvasView.clearOverlay();
        bresenhamLine(this._anchorX, this._anchorY, end.x, end.y, (px, py) => {
            this.previewBrush(px, py);
        });
        return true;
    }

    getCursor() {
        return 'crosshair';
    }

    previewBrush(x, y) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;
        const { zoom, panX, panY } = this.canvasView;
        const ctx = this.canvasView.overlayCtx;

        for (let by = 0; by < brush.height; by++) {
            for (let bx = 0; bx < brush.width; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (docX < 0 || docX >= docW || docY < 0 || docY >= docH) continue;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const colorIndex = brush.isCaptured ? idx : this.doc.fgColorIndex;
                const [r, g, b] = this.doc.palette.getColor(colorIndex);
                ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
                ctx.fillRect(panX + docX * zoom, panY + docY * zoom, zoom, zoom);
            }
        }
    }

    stampBrush(layer, x, y, colorOverride) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;

        // Clamp brush footprint to document bounds
        const startBx = Math.max(0, -x + ox);
        const startBy = Math.max(0, -y + oy);
        const endBx = Math.min(brush.width, docW - x + ox);
        const endBy = Math.min(brush.height, docH - y + oy);

        if (startBx >= endBx || startBy >= endBy) return;

        // Pre-extend layer to cover the clamped brush footprint
        layer.ensureRect(
            x - ox + startBx, y - oy + startBy,
            x - ox + endBx - 1, y - oy + endBy - 1
        );

        for (let by = startBy; by < endBy; by++) {
            for (let bx = startBx; bx < endBx; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const colorIndex = brush.isCaptured ? idx : (colorOverride !== undefined ? colorOverride : this.doc.fgColorIndex);
                layer.setPixelAutoExtend(docX, docY, colorIndex);
            }
        }
    }
}
