import { generateVGAPalette } from '../constants.js';

export class Palette {
    constructor() {
        this.colors = generateVGAPalette();
    }

    getColor(index) {
        return this.colors[index];
    }

    setColor(index, r, g, b) {
        this.colors[index] = [r, g, b];
    }

    toRGBA(index) {
        const [r, g, b] = this.colors[index];
        return [r, g, b, 255];
    }

    clone() {
        const p = new Palette();
        p.colors = this.colors.map(c => [...c]);
        return p;
    }

    export() {
        return this.colors.map(c => [...c]);
    }

    import(data) {
        for (let i = 0; i < 256 && i < data.length; i++) {
            this.colors[i] = [data[i][0], data[i][1], data[i][2]];
        }
    }
}
