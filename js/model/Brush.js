import { TRANSPARENT } from '../constants.js';

export class Brush {
    /**
     * @param {number} width
     * @param {number} height
     * @param {Uint16Array} data - palette indices (0-255) or TRANSPARENT (256) = don't paint
     * @param {boolean} isCaptured - if true, stamp with stored indices; if false, stamp with FG color
     */
    constructor(width, height, data, isCaptured = false) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.isCaptured = isCaptured;
        this.originX = Math.floor(width / 2);
        this.originY = Math.floor(height / 2);
    }

    static default() {
        // 1x1 pixel brush; value 1 means "paint here" (not TRANSPARENT)
        return new Brush(1, 1, new Uint16Array([1]), false);
    }
}
