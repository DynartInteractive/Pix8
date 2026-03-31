import { TRANSPARENT } from '../constants.js';
import { pointInPolygon } from '../util/math.js';

export class Selection {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.mask = new Uint8Array(width * height);
        this.active = false;
        this.floating = null; // { data, mask, width, height, originX, originY }
    }

    clear() {
        this.active = false;
        this.mask.fill(0);
        this.floating = null;
    }

    isSelected(docX, docY) {
        if (docX < 0 || docX >= this.width || docY < 0 || docY >= this.height) return false;
        return this.mask[docY * this.width + docX] === 1;
    }

    selectRect(x0, y0, x1, y1) {
        this.mask.fill(0);
        const minX = Math.max(0, Math.min(x0, x1));
        const minY = Math.max(0, Math.min(y0, y1));
        const maxX = Math.min(this.width - 1, Math.max(x0, x1));
        const maxY = Math.min(this.height - 1, Math.max(y0, y1));
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.mask[y * this.width + x] = 1;
            }
        }
        this.active = true;
    }

    selectCircle(cx, cy, r) {
        this.mask.fill(0);
        const minX = Math.max(0, cx - r);
        const minY = Math.max(0, cy - r);
        const maxX = Math.min(this.width - 1, cx + r);
        const maxY = Math.min(this.height - 1, cy + r);
        const rSq = r * r;
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= rSq) {
                    this.mask[y * this.width + x] = 1;
                }
            }
        }
        this.active = true;
    }

    selectPolygon(vertices) {
        this.mask.fill(0);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [vx, vy] of vertices) {
            if (vx < minX) minX = vx;
            if (vy < minY) minY = vy;
            if (vx > maxX) maxX = vx;
            if (vy > maxY) maxY = vy;
        }
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(this.width - 1, maxX);
        maxY = Math.min(this.height - 1, maxY);
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                if (pointInPolygon(x, y, vertices)) {
                    this.mask[y * this.width + x] = 1;
                }
            }
        }
        this.active = true;
    }

    selectAll() {
        this.mask.fill(1);
        this.active = true;
    }

    getBounds() {
        let minX = this.width, minY = this.height, maxX = -1, maxY = -1;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.mask[y * this.width + x]) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;
        return { minX, minY, maxX, maxY };
    }

    hasFloating() {
        return this.floating !== null;
    }

    liftPixels(layer) {
        if (this.floating) return; // already lifted
        const bounds = this.getBounds();
        if (!bounds) return;

        const { minX, minY, maxX, maxY } = bounds;
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const data = new Uint16Array(w * h);
        const fMask = new Uint8Array(w * h);
        data.fill(TRANSPARENT);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const docX = minX + x;
                const docY = minY + y;
                if (!this.mask[docY * this.width + docX]) continue;
                data[y * w + x] = layer.getPixelDoc(docX, docY);
                fMask[y * w + x] = 1;
                // Cut from layer
                const lx = docX - layer.offsetX;
                const ly = docY - layer.offsetY;
                if (lx >= 0 && lx < layer.width && ly >= 0 && ly < layer.height) {
                    layer.setPixel(lx, ly, TRANSPARENT);
                }
            }
        }

        this.floating = {
            data, mask: fMask, width: w, height: h,
            originX: minX, originY: minY
        };
    }

    moveFloating(newOriginX, newOriginY) {
        if (!this.floating) return;
        this.floating.originX = newOriginX;
        this.floating.originY = newOriginY;
    }

    commitFloating(layer) {
        if (!this.floating) return;
        const f = this.floating;
        const docW = this.width;
        const docH = this.height;

        for (let y = 0; y < f.height; y++) {
            for (let x = 0; x < f.width; x++) {
                if (!f.mask[y * f.width + x]) continue;
                const colorIndex = f.data[y * f.width + x];
                if (colorIndex === TRANSPARENT) continue;
                const docX = f.originX + x;
                const docY = f.originY + y;
                if (docX < 0 || docX >= docW || docY < 0 || docY >= docH) continue;
                layer.setPixelAutoExtend(docX, docY, colorIndex);
            }
        }

        // Update mask to reflect new position
        this.mask.fill(0);
        for (let y = 0; y < f.height; y++) {
            for (let x = 0; x < f.width; x++) {
                if (!f.mask[y * f.width + x]) continue;
                const docX = f.originX + x;
                const docY = f.originY + y;
                if (docX >= 0 && docX < docW && docY >= 0 && docY < docH) {
                    this.mask[docY * docW + docX] = 1;
                }
            }
        }

        this.floating = null;
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.mask = new Uint8Array(width * height);
        this.active = false;
        this.floating = null;
    }
}
