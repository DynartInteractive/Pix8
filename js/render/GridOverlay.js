import { GRID_MIN_ZOOM } from '../constants.js';

export class GridOverlay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(docWidth, docHeight, zoom, panX, panY) {
        const { canvas, ctx } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (zoom < GRID_MIN_ZOOM) return;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= docWidth; x++) {
            const sx = Math.round(panX + x * zoom) + 0.5;
            ctx.moveTo(sx, Math.round(panY) + 0.5);
            ctx.lineTo(sx, Math.round(panY + docHeight * zoom) + 0.5);
        }

        // Horizontal lines
        for (let y = 0; y <= docHeight; y++) {
            const sy = Math.round(panY + y * zoom) + 0.5;
            ctx.moveTo(Math.round(panX) + 0.5, sy);
            ctx.lineTo(Math.round(panX + docWidth * zoom) + 0.5, sy);
        }

        ctx.stroke();
    }
}
