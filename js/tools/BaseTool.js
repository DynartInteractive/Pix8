import { TRANSPARENT } from '../constants.js';

export class BaseTool {
    constructor(doc, bus, canvasView) {
        this.doc = doc;
        this.bus = bus;
        this.canvasView = canvasView;
        this.name = 'base';
        this.icon = '';
        this.shortcut = '';
    }

    onPointerDown(x, y, e) {}
    onPointerMove(x, y, e) {}
    onPointerUp(x, y, e) {}

    getCursor() {
        return 'crosshair';
    }

    stampBrush(layer, x, y) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;

        // Pre-extend layer to cover the full brush footprint
        layer.ensureRect(
            x - ox, y - oy,
            x - ox + brush.width - 1, y - oy + brush.height - 1
        );

        for (let by = 0; by < brush.height; by++) {
            for (let bx = 0; bx < brush.width; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === TRANSPARENT) continue;
                const colorIndex = brush.isCaptured ? idx : this.doc.fgColorIndex;
                layer.setPixelAutoExtend(x + bx - ox, y + by - oy, colorIndex);
            }
        }
    }
}
