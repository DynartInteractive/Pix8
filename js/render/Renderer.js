import { TRANSPARENT } from '../constants.js';

export class Renderer {
    constructor(doc) {
        this.doc = doc;
        this._imageData = null;
    }

    composite() {
        const { width, height, palette, layers } = this.doc;
        const size = width * height;

        if (!this._imageData || this._imageData.width !== width || this._imageData.height !== height) {
            this._imageData = new ImageData(width, height);
        }

        const buf = this._imageData.data;

        // Fill with checkerboard-like transparency indicator (handled by CSS, so just set alpha=0)
        buf.fill(0);

        // Composite layers bottom-to-top
        for (const layer of layers) {
            if (!layer.visible) continue;
            const data = layer.data;
            for (let i = 0; i < size; i++) {
                const colorIndex = data[i];
                if (colorIndex === TRANSPARENT) continue;
                const [r, g, b] = palette.getColor(colorIndex);
                const off = i * 4;
                buf[off] = r;
                buf[off + 1] = g;
                buf[off + 2] = b;
                buf[off + 3] = 255;
            }
        }

        return this._imageData;
    }
}
