export class Rulers {
    constructor() {
        this.hCanvas = document.getElementById('ruler-h');
        this.vCanvas = document.getElementById('ruler-v');
        this.hCtx = this.hCanvas.getContext('2d');
        this.vCtx = this.vCanvas.getContext('2d');
        this.canvasArea = document.getElementById('canvas-area');
        this.SIZE = 20;
    }

    setVisible(visible) {
        this.canvasArea.style.setProperty('--ruler-size', visible ? this.SIZE + 'px' : '0px');
        this.canvasArea.classList.toggle('rulers-visible', visible);
    }

    resize(w, h) {
        this.hCanvas.width = w;
        this.hCanvas.height = this.SIZE;
        this.vCanvas.width = this.SIZE;
        this.vCanvas.height = h;
    }

    draw(docWidth, docHeight, zoom, panX, panY) {
        this._drawH(docWidth, zoom, panX);
        this._drawV(docHeight, zoom, panY);
    }

    _tickStep(zoom) {
        if (zoom >= 16) return 1;
        if (zoom >= 8) return 2;
        if (zoom >= 4) return 4;
        if (zoom >= 2) return 8;
        return 16;
    }

    _drawH(docWidth, zoom, panX) {
        const ctx = this.hCtx;
        const w = this.hCanvas.width;
        const h = this.SIZE;
        ctx.clearRect(0, 0, w, h);

        const step = this._tickStep(zoom);
        const majorEvery = step * 8;
        const first = Math.floor(-panX / zoom / step) * step;
        const last = Math.ceil((w - panX) / zoom / step) * step;

        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#888';
        ctx.font = '9px sans-serif';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 1;

        for (let d = first; d <= last; d += step) {
            if (d < 0 || d > docWidth) continue;
            const sx = Math.round(panX + d * zoom) + 0.5;
            if (sx < 0 || sx > w) continue;
            const isMajor = d % majorEvery === 0;
            ctx.beginPath();
            ctx.moveTo(sx, isMajor ? 0 : h * 0.6);
            ctx.lineTo(sx, h);
            ctx.stroke();
            if (isMajor) {
                ctx.fillText(String(d), sx + 2, 1);
            }
        }
    }

    _drawV(docHeight, zoom, panY) {
        const ctx = this.vCtx;
        const w = this.SIZE;
        const h = this.vCanvas.height;
        ctx.clearRect(0, 0, w, h);

        const step = this._tickStep(zoom);
        const majorEvery = step * 8;
        const first = Math.floor(-panY / zoom / step) * step;
        const last = Math.ceil((h - panY) / zoom / step) * step;

        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#888';
        ctx.font = '9px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 1;

        for (let d = first; d <= last; d += step) {
            if (d < 0 || d > docHeight) continue;
            const sy = Math.round(panY + d * zoom) + 0.5;
            if (sy < 0 || sy > h) continue;
            const isMajor = d % majorEvery === 0;
            ctx.beginPath();
            ctx.moveTo(isMajor ? 0 : w * 0.6, sy);
            ctx.lineTo(w, sy);
            ctx.stroke();
            if (isMajor) {
                ctx.save();
                ctx.translate(2, sy + 2);
                ctx.rotate(-Math.PI / 2);
                ctx.textBaseline = 'top';
                ctx.fillText(String(d), 0, 0);
                ctx.restore();
            }
        }
    }
}
