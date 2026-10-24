// Minimal RGBA -> PNG encoder for the CLI.
//
// The browser side encodes through canvas.toBlob(), which Node has no answer
// for. Rather than pull in a native canvas build — JSZip is deliberately the
// project's only runtime dependency — this writes the four chunks a plain
// truecolour-with-alpha PNG needs, using the zlib that ships with Node.
//
// No filtering (every scanline gets filter type 0). Sprite frames are small and
// mostly transparent, so deflate already does the work; picking filters per row
// would buy a few percent for a good deal more code.

import { deflateSync } from 'node:zlib';

const CRC_TABLE = (() => {
    const table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[n] = c;
    }
    return table;
})();

function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const out = Buffer.alloc(data.length + 12);
    out.writeUInt32BE(data.length, 0);
    out.write(type, 4, 'ascii');
    data.copy(out, 8);
    // The CRC covers the type and the data, but not the length.
    out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
    return out;
}

/**
 * @param {Uint8ClampedArray|Uint8Array} rgba  width*height*4 bytes
 * @returns {Buffer} a complete PNG file
 */
export function encodePNG(rgba, width, height) {
    if (rgba.length !== width * height * 4) {
        throw new Error(`expected ${width * height * 4} bytes of RGBA, got ${rgba.length}`);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;    // bit depth
    ihdr[9] = 6;    // colour type 6 = truecolour with alpha
    ihdr[10] = 0;   // deflate
    ihdr[11] = 0;   // adaptive filtering
    ihdr[12] = 0;   // no interlacing

    // Raw data is each scanline prefixed with its filter byte.
    const stride = width * 4;
    const raw = Buffer.alloc((stride + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (stride + 1)] = 0;
        Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride)
            .copy(raw, y * (stride + 1) + 1);
    }

    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw, { level: 9 })),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}
