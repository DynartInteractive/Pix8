import { BaseTool } from './BaseTool.js';
import { bresenhamLine } from '../util/math.js';

export class BrushTool extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Brush';
        this.shortcut = 'B';
        this.icon = 'images/icon-brush.svg';
        this._startX = null;
        this._startY = null;
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
        this._color = undefined;
    }

    // Shift held with no button down previews the line from the anchor.
    onHover(x, y, e) {
        if (this.previewLineFromAnchor(x, y, e)) return;
        super.onHover(x, y, e);
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (layer.locked) return;
        this.canvasView.clearOverlay();
        this._lineMode = e.shiftKey;
        this._color = e.button === 2 ? this.doc.bgColorIndex : undefined;
        if (this._lineMode) {
            // Continue from the last pixel drawn when there is one; only fall
            // back to anchoring at the press point on a cold start.
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
            this.stampBrush(layer, x, y, this._color);
            this.setLineAnchor(x, y);
        }
    }

    _snapEnd(x, y, e) {
        return this.lineEndpoint(this._startX, this._startY, x, y, e);
    }

    onPointerMove(x, y, e) {
        if (this._lineMode) {
            if (this._startX === null) return;
            const end = this._snapEnd(x, y, e);
            this.canvasView.clearOverlay();
            bresenhamLine(this._startX, this._startY, end.x, end.y, (px, py) => {
                this.previewBrush(px, py);
            });
            return;
        }
        const layer = this.doc.getActiveLayer();
        if (layer.locked || this._lastX === null) return;

        // Interpolate from last position to current using Bresenham
        bresenhamLine(this._lastX, this._lastY, x, y, (px, py) => {
            this.stampBrush(layer, px, py, this._color);
        });

        this._lastX = x;
        this._lastY = y;
        // The anchor trails the stroke, so releasing mid-drag leaves it on the
        // last pixel actually painted.
        this.setLineAnchor(x, y);
    }

    onPointerUp(x, y, e) {
        if (this._lineMode && this._startX !== null) {
            const end = this._snapEnd(x, y, e);
            const layer = this.doc.getActiveLayer();
            if (!layer.locked) {
                bresenhamLine(this._startX, this._startY, end.x, end.y, (px, py) => {
                    this.stampBrush(layer, px, py, this._color);
                });
                // Chain: the end of this line anchors the next one.
                this.setLineAnchor(end.x, end.y);
            }
            this.canvasView.clearOverlay();
        }
        this._startX = null;
        this._startY = null;
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
    }
}
