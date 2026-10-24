import { BaseTool } from './BaseTool.js';
import { TRANSPARENT } from '../constants.js';
import { bresenhamLine } from '../util/math.js';

export class EraserTool extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Eraser';
        this.shortcut = 'E';
        this.icon = 'images/icon-eraser.svg';
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
        this._startX = null;
        this._startY = null;
    }

    // Shift held with no button down previews the line from the anchor.
    onHover(x, y, e) {
        if (this.previewLineFromAnchor(x, y, e)) return;
        super.onHover(x, y, e);
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (layer.locked) return;
        this._lineMode = e.shiftKey;
        if (this._lineMode) {
            // Continue from the last erased pixel when there is one.
            if (this.hasLineAnchor()) {
                this._startX = this._anchorX;
                this._startY = this._anchorY;
            } else {
                this._startX = x;
                this._startY = y;
            }
        } else {
            this._lastX = x;
            this._lastY = y;
            this._eraseBrush(layer, x, y);
            this.setLineAnchor(x, y);
        }
    }

    onPointerMove(x, y, e) {
        if (this._lineMode) {
            if (this._startX === null) return;
            const end = this.lineEndpoint(this._startX, this._startY, x, y, e);
            this.canvasView.clearOverlay();
            bresenhamLine(this._startX, this._startY, end.x, end.y, (px, py) => {
                this.previewBrush(px, py);
            });
            return;
        }
        const layer = this.doc.getActiveLayer();
        if (layer.locked || this._lastX === null) return;

        bresenhamLine(this._lastX, this._lastY, x, y, (px, py) => {
            this._eraseBrush(layer, px, py);
        });

        this._lastX = x;
        this._lastY = y;
        this.setLineAnchor(x, y);
    }

    onPointerUp(x, y, e) {
        if (this._lineMode && this._startX !== null) {
            const layer = this.doc.getActiveLayer();
            if (!layer.locked) {
                const end = this.lineEndpoint(this._startX, this._startY, x, y, e);
                bresenhamLine(this._startX, this._startY, end.x, end.y, (px, py) => {
                    this._eraseBrush(layer, px, py);
                });
                // Chain: the end of this line anchors the next one.
                this.setLineAnchor(end.x, end.y);
            }
            this.canvasView.clearOverlay();
        }
        this._lastX = null;
        this._lastY = null;
        this._startX = null;
        this._startY = null;
        this._lineMode = false;
    }

    _eraseBrush(layer, x, y) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;

        const startBx = Math.max(0, -x + ox);
        const startBy = Math.max(0, -y + oy);
        const endBx = Math.min(brush.width, docW - x + ox);
        const endBy = Math.min(brush.height, docH - y + oy);

        for (let by = startBy; by < endBy; by++) {
            for (let bx = startBx; bx < endBx; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const lx = docX - layer.offsetX;
                const ly = docY - layer.offsetY;
                layer.setPixel(lx, ly, TRANSPARENT);
            }
        }
    }
}
