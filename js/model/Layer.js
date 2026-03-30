import { TRANSPARENT } from '../constants.js';

export class Layer {
    constructor(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.locked = false;
        // Uint16Array so we can store 0-255 (valid palette) + 256 (transparent)
        this.data = new Uint16Array(width * height);
        this.data.fill(TRANSPARENT);
    }

    getPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return TRANSPARENT;
        return this.data[y * this.width + x];
    }

    setPixel(x, y, colorIndex) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.data[y * this.width + x] = colorIndex;
    }

    clear() {
        this.data.fill(TRANSPARENT);
    }

    clone() {
        const copy = new Layer(this.name + ' copy', this.width, this.height);
        copy.visible = this.visible;
        copy.locked = this.locked;
        copy.data.set(this.data);
        return copy;
    }

    snapshotData() {
        return this.data.slice();
    }

    restoreData(snapshot) {
        this.data.set(snapshot);
    }
}
