import { BaseTool } from './BaseTool.js';
import { TRANSPARENT } from '../constants.js';

export class FillTool extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Fill';
        this.shortcut = 'G';
        this.icon = `<svg viewBox="0 0 20 20"><path d="M6 14l-2 3h1l2-3zM5 13l6-6 3 3-6 6z" fill="none"/><path d="M12.5 5.5l-1-1 1.5-1.5 2 2-1.5 1.5z"/><path d="M15 10c1 2 2 3 2 4.5a2 2 0 01-4 0c0-1.5 1-2.5 2-4.5z"/></svg>`;
    }

    getCursor() {
        return 'crosshair';
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (!layer) return;
        const docW = this.doc.width;
        const docH = this.doc.height;
        if (x < 0 || x >= docW || y < 0 || y >= docH) return;

        const sel = this.doc.selection;
        if (sel.active && !sel.isSelected(x, y)) return;

        const fillColor = e.button === 2 ? this.doc.bgColorIndex : this.doc.fgColorIndex;
        const targetColor = layer.getPixelDoc(x, y);
        if (targetColor === fillColor) return;

        // Flood fill using a queue
        const visited = new Uint8Array(docW * docH);
        const queue = [x, y];
        visited[y * docW + x] = 1;

        while (queue.length > 0) {
            const py = queue.pop();
            const px = queue.pop();

            layer.setPixelAutoExtend(px, py, fillColor);

            const neighbors = [[px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]];
            for (const [nx, ny] of neighbors) {
                if (nx < 0 || nx >= docW || ny < 0 || ny >= docH) continue;
                if (visited[ny * docW + nx]) continue;
                if (sel.active && !sel.isSelected(nx, ny)) continue;
                if (layer.getPixelDoc(nx, ny) !== targetColor) continue;
                visited[ny * docW + nx] = 1;
                queue.push(nx, ny);
            }
        }
    }
}
