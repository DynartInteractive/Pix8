import { Renderer } from '../render/Renderer.js';
import { TRANSPARENT } from '../constants.js';

/**
 * GIF89a animation encoder for indexed-color documents.
 * Supports 256-color palette, per-frame delay, transparency, and infinite looping.
 */
export function exportGIF(doc, options = {}) {
    const scale = options.scale || 1;
    const loopCount = options.loopCount ?? 0; // 0 = infinite
    const outWidth = doc.width * scale;
    const outHeight = doc.height * scale;
    const { palette } = doc;
    const frames = doc.frames;
    const frameIndices = options.frameIndices || frames.map((_, i) => i);
    const numFrames = frameIndices.length;

    // Find a palette index to use as transparent color.
    // Scan all frames' layer data to find an unused index; fall back to 255.
    const usedIndices = new Uint8Array(256);
    for (const fi of frameIndices) {
        const frame = frames[fi];
        if (!frame || !frame.layerData) continue;
        for (const ld of frame.layerData) {
            for (let i = 0; i < ld.data.length; i++) {
                const v = ld.data[i];
                if (v !== TRANSPARENT && v < 256) usedIndices[v] = 1;
            }
        }
    }
    let transparentIndex = 255;
    for (let i = 255; i >= 0; i--) {
        if (!usedIndices[i]) { transparentIndex = i; break; }
    }

    // Build reverse lookup: "r,g,b" -> palette index
    const colorToIndex = new Map();
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        const key = (r << 16) | (g << 8) | b;
        if (!colorToIndex.has(key)) {
            colorToIndex.set(key, i);
        }
    }

    // Collect all output bytes
    const chunks = [];
    const write = (data) => chunks.push(data instanceof Uint8Array ? data : new Uint8Array(data));
    const writeStr = (s) => write(s.split('').map(c => c.charCodeAt(0)));

    // --- Header ---
    writeStr('GIF89a');

    // --- Logical Screen Descriptor ---
    write([
        outWidth & 0xFF, (outWidth >> 8) & 0xFF,
        outHeight & 0xFF, (outHeight >> 8) & 0xFF,
        0xF7, // GCT flag=1, color res=7 (8 bits), sort=0, GCT size=7 (256 colors)
        0,    // background color index
        0,    // pixel aspect ratio
    ]);

    // --- Global Color Table (256 × RGB) ---
    const gct = new Uint8Array(768);
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        gct[i * 3] = r;
        gct[i * 3 + 1] = g;
        gct[i * 3 + 2] = b;
    }
    write(gct);

    // --- Netscape Application Extension (infinite loop) ---
    write([
        0x21, 0xFF, // extension introducer, app extension label
        0x0B,       // block size
    ]);
    writeStr('NETSCAPE2.0');
    write([
        0x03, // sub-block size
        0x01, // sub-block ID
        loopCount & 0xFF, (loopCount >> 8) & 0xFF, // loop count (0 = infinite)
        0x00, // block terminator
    ]);

    // Save current state
    const savedActiveIndex = doc.activeFrameIndex;
    const savedLayers = doc.layers.map(l => ({
        data: l.data, opacity: l.opacity, textData: l.textData,
        offsetX: l.offsetX, offsetY: l.offsetY,
        width: l.width, height: l.height,
    }));

    // --- Frames ---
    const renderer = new Renderer(doc);
    for (let fi = 0; fi < numFrames; fi++) {
        const frameIdx = frameIndices[fi];
        // Load frame data into layers
        doc._restoreLayersFromFrame(frames[frameIdx]);

        // Composite to RGBA
        const imageData = renderer.composite();
        const rgba = imageData.data;

        // Map RGBA pixels back to palette indices, with optional scaling
        const indices = new Uint8Array(outWidth * outHeight);
        for (let oy = 0; oy < outHeight; oy++) {
            const sy = Math.floor(oy / scale);
            for (let ox = 0; ox < outWidth; ox++) {
                const sx = Math.floor(ox / scale);
                const srcOff = (sy * doc.width + sx) * 4;
                const a = rgba[srcOff + 3];
                const dstIdx = oy * outWidth + ox;
                if (a < 128) {
                    indices[dstIdx] = transparentIndex;
                } else {
                    const key = (rgba[srcOff] << 16) | (rgba[srcOff + 1] << 8) | rgba[srcOff + 2];
                    indices[dstIdx] = colorToIndex.get(key) ?? 0;
                }
            }
        }

        // Delay in centiseconds (GIF uses 1/100s units)
        const delayCs = Math.max(1, Math.round((frames[frameIdx].delay || 100) / 10));

        // --- Graphic Control Extension ---
        write([
            0x21, 0xF9, // extension introducer, GCE label
            0x04,       // block size
            0x09,       // packed: disposal=2 (restore to bg), no user input, transparency=1
            delayCs & 0xFF, (delayCs >> 8) & 0xFF, // delay
            transparentIndex, // transparent color index
            0x00,       // block terminator
        ]);

        // --- Image Descriptor ---
        write([
            0x2C, // image separator
            0, 0, // left
            0, 0, // top
            outWidth & 0xFF, (outWidth >> 8) & 0xFF,
            outHeight & 0xFF, (outHeight >> 8) & 0xFF,
            0x00, // no local color table, not interlaced
        ]);

        // --- LZW Image Data ---
        const minCodeSize = 8; // 256 colors
        write([minCodeSize]);
        const lzwData = lzwEncode(indices, minCodeSize);
        // Write as sub-blocks (max 255 bytes each)
        let pos = 0;
        while (pos < lzwData.length) {
            const blockSize = Math.min(255, lzwData.length - pos);
            write([blockSize]);
            write(lzwData.subarray(pos, pos + blockSize));
            pos += blockSize;
        }
        write([0x00]); // block terminator
    }

    // Restore original state
    for (let i = 0; i < doc.layers.length && i < savedLayers.length; i++) {
        const s = savedLayers[i];
        doc.layers[i].data = s.data;
        doc.layers[i].opacity = s.opacity;
        doc.layers[i].textData = s.textData;
        doc.layers[i].offsetX = s.offsetX;
        doc.layers[i].offsetY = s.offsetY;
        doc.layers[i].width = s.width;
        doc.layers[i].height = s.height;
    }
    doc.activeFrameIndex = savedActiveIndex;

    // --- GIF Trailer ---
    write([0x3B]);

    // Combine all chunks into a single blob
    const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return new Blob([result], { type: 'image/gif' });
}

/**
 * LZW encoder for GIF image data.
 * Takes an array of palette indices and the minimum code size.
 * Returns a Uint8Array of packed LZW codes.
 */
function lzwEncode(indices, minCodeSize) {
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    // Output bit stream
    const output = [];
    let curByte = 0;
    let curBits = 0;

    function writeBits(code, numBits) {
        curByte |= (code << curBits);
        curBits += numBits;
        while (curBits >= 8) {
            output.push(curByte & 0xFF);
            curByte >>= 8;
            curBits -= 8;
        }
    }

    // Initialize
    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const maxTableSize = 4096; // 12-bit max

    // Code table: use a trie for efficient prefix lookup
    // Each node: Map<index, childNode>
    // We represent nodes as objects with a .children map and a .code
    function initTable() {
        const table = [];
        for (let i = 0; i < clearCode; i++) {
            table[i] = { code: i, children: new Map() };
        }
        return table;
    }

    let table = initTable();

    // Emit clear code
    writeBits(clearCode, codeSize);

    if (indices.length === 0) {
        writeBits(eoiCode, codeSize);
        if (curBits > 0) output.push(curByte & 0xFF);
        return new Uint8Array(output);
    }

    let current = table[indices[0]];

    for (let i = 1; i < indices.length; i++) {
        const pixel = indices[i];
        const child = current.children.get(pixel);

        if (child) {
            // Extend the current string
            current = child;
        } else {
            // Output the code for current string
            writeBits(current.code, codeSize);

            // Add new string to table
            if (nextCode < maxTableSize) {
                current.children.set(pixel, { code: nextCode, children: new Map() });
                nextCode++;
                // Increase code size if needed
                if (nextCode > (1 << codeSize) && codeSize < 12) {
                    codeSize++;
                }
            } else {
                // Table full, emit clear code and reset
                writeBits(clearCode, codeSize);
                table = initTable();
                nextCode = eoiCode + 1;
                codeSize = minCodeSize + 1;
            }

            // Start new string with current pixel
            current = table[pixel];
        }
    }

    // Output the last string
    writeBits(current.code, codeSize);

    // End of information
    writeBits(eoiCode, codeSize);

    // Flush remaining bits
    if (curBits > 0) {
        output.push(curByte & 0xFF);
    }

    return new Uint8Array(output);
}
