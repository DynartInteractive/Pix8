import { TRANSPARENT } from '../constants.js';

export class Renderer {
    constructor(doc) {
        this.doc = doc;
        this._imageData = null;
    }

    composite() {
        const { width, height, palette, layers } = this.doc;

        if (!this._imageData || this._imageData.width !== width || this._imageData.height !== height) {
            this._imageData = new ImageData(width, height);
        }

        const buf = this._imageData.data;
        buf.fill(0);

        // Composite layers bottom-to-top, respecting per-layer offset and size
        for (const layer of layers) {
            if (!layer.visible) continue;

            // Intersection of layer rect and document rect
            const lx0 = Math.max(0, layer.offsetX);
            const ly0 = Math.max(0, layer.offsetY);
            const lx1 = Math.min(width, layer.offsetX + layer.width);
            const ly1 = Math.min(height, layer.offsetY + layer.height);

            const layerData = layer.data;
            const layerW = layer.width;
            const layerOx = layer.offsetX;
            const layerOy = layer.offsetY;

            for (let dy = ly0; dy < ly1; dy++) {
                const localY = dy - layerOy;
                const localRowStart = localY * layerW - layerOx;
                const docRowStart = dy * width;
                for (let dx = lx0; dx < lx1; dx++) {
                    const colorIndex = layerData[localRowStart + dx];
                    if (colorIndex === TRANSPARENT) continue;
                    const [r, g, b] = palette.getColor(colorIndex);
                    const off = (docRowStart + dx) * 4;
                    buf[off] = r;
                    buf[off + 1] = g;
                    buf[off + 2] = b;
                    buf[off + 3] = 255;
                }
            }
        }

        // Render floating selection on top
        const sel = this.doc.selection;
        if (sel && sel.hasFloating()) {
            const f = sel.floating;
            for (let fy = 0; fy < f.height; fy++) {
                for (let fx = 0; fx < f.width; fx++) {
                    if (!f.mask[fy * f.width + fx]) continue;
                    const colorIndex = f.data[fy * f.width + fx];
                    if (colorIndex === TRANSPARENT) continue;
                    const docX = f.originX + fx;
                    const docY = f.originY + fy;
                    if (docX < 0 || docX >= width || docY < 0 || docY >= height) continue;
                    const [r, g, b] = palette.getColor(colorIndex);
                    const off = (docY * width + docX) * 4;
                    buf[off] = r;
                    buf[off + 1] = g;
                    buf[off + 2] = b;
                    buf[off + 3] = 255;
                }
            }
        }

        return this._imageData;
    }
}
