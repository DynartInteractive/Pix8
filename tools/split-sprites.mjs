#!/usr/bin/env node
//
// Split one layer-per-sprite .pix8 sheet into a per-character animated .pix8.
//
// The CoolFox sheet keeps every sprite as its own layer in one tall document:
// `player_idle_1`, `player_idle_2`, `player_run_1`, ... Each layer is a frame,
// and the name says which animation it belongs to. This turns a prefix's worth
// of those layers into a single animated document: one layer, one frame per
// source layer, grouped into tags by animation name.
//
//   node tools/split-sprites.mjs <sheet.pix8> <prefix> <out.pix8> [options]
//
//     --size=WxH        canvas size (default: the first frame's size)
//     --size=max        canvas big enough for every frame
//     --default-tag=X   tag for frames with no animation name (default: idle)
//
// Naming: <prefix>_<animation>_<n> becomes tag <animation>, frame n. Two
// shapes besides that one appear in practice and are handled:
//
//   player_pain        no frame number  -> a one-frame animation, own tag
//   enemy_crab_1       no animation name -> frames go under --default-tag
//
// The prefix is given explicitly rather than inferred because a character name
// can itself contain underscores: `enemy_blue_crab_1` could be enemy "blue"
// doing animation "crab", or enemy "blue_crab" with no animation name, and
// nothing in the name says which. Passing `enemy_blue_crab` settles it — and
// since matching requires a full `<prefix>_` segment, `enemy_crab` picks up
// the crab without also swallowing the blue one.
//
// Tags appear in the order their first frame appears in the sheet, so the
// output follows the artist's layout rather than alphabetical order.
//
// Frames are stored at offset 0,0 — the sheet positions each sprite across the
// sheet, which is meaningless once every frame is its own cel.

import { readFileSync, writeFileSync } from 'node:fs';
import { loadPix8, savePix8 } from '../js/util/io.js';
import { ImageDocument } from '../js/model/ImageDocument.js';

const FRAME_DELAY_MS = 100;
const DEFAULT_TAG = 'idle';

function parseArgs(argv) {
    const positional = argv.filter(a => !a.startsWith('--'));
    const sizeArg = argv.find(a => a.startsWith('--size='));
    const tagArg = argv.find(a => a.startsWith('--default-tag='));
    if (positional.length < 3) {
        console.error('usage: split-sprites.mjs <sheet.pix8> <prefix> <out.pix8> [--size=WxH|--size=max] [--default-tag=idle]');
        process.exit(2);
    }
    const [sheet, prefix, out] = positional;
    let width = null, height = null, maxSize = false;
    if (sizeArg === '--size=max') {
        maxSize = true;
    } else if (sizeArg) {
        const m = /^--size=(\d+)x(\d+)$/.exec(sizeArg);
        if (!m) { console.error('bad --size, expected --size=32x32 or --size=max'); process.exit(2); }
        width = Number(m[1]); height = Number(m[2]);
    }
    const defaultTag = tagArg ? tagArg.slice('--default-tag='.length) : DEFAULT_TAG;
    return { sheet, prefix, out, width, height, maxSize, defaultTag };
}

// `player_run_2`  -> { animation: 'run',  index: 2 }
// `player_pain`   -> { animation: 'pain', index: 1 }
// `enemy_crab_1`  -> { animation: <defaultTag>, index: 1 }   (no animation name)
function parseName(name, prefix, defaultTag) {
    const rest = name.slice(prefix.length).replace(/^_/, '');
    if (/^\d+$/.test(rest)) return { animation: defaultTag, index: Number(rest) };
    const m = /^(.*)_(\d+)$/.exec(rest);
    return m ? { animation: m[1], index: Number(m[2]) }
             : { animation: rest, index: 1 };
}

const { sheet, prefix, out, width, height, maxSize, defaultTag } = parseArgs(process.argv.slice(2));

const bytes = readFileSync(sheet);
const src = loadPix8(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));

const matched = src.layers.filter(l => l.name === prefix || l.name.startsWith(prefix + '_'));
if (!matched.length) {
    console.error(`no layers matching "${prefix}_*" in ${sheet}`);
    process.exit(1);
}

// Group by animation, keeping first-seen order; sort each group by its index so
// `_10` lands after `_9` rather than between `_1` and `_2`.
const groups = new Map();
for (const layer of matched) {
    const { animation, index } = parseName(layer.name, prefix, defaultTag);
    if (!groups.has(animation)) groups.set(animation, []);
    groups.get(animation).push({ layer, index });
}
for (const frames of groups.values()) frames.sort((a, b) => a.index - b.index);

// Frames in output order, which is also the order they are written below.
const ordered = [...groups.values()].flat().map(f => f.layer);

// Canvas size. Default is the first frame's size: a character's own frames are
// normally uniform, so frame one speaks for all of them. --size=max takes the
// bounding box of every frame instead, which is the escape hatch when a
// character's set includes an odd one out (a projectile, a rotated variant)
// that the first frame does not represent.
let docW, docH;
if (width !== null) {
    docW = width; docH = height;
} else if (maxSize) {
    docW = Math.max(...ordered.map(l => l.width));
    docH = Math.max(...ordered.map(l => l.height));
} else {
    docW = ordered[0].width; docH = ordered[0].height;
}

const doc = new ImageDocument(docW, docH);
doc.palette.import(src.palette.export());
doc.layers[0].name = prefix;

doc.enableAnimation();
// enableAnimation seeds a frame from the (empty) layer; the real frames are
// built below, so start from a clean cel table.
doc.frames = [];
doc.cels = new Map();
doc._nextCelId = 1;

let total = 0;
for (const [animation, frames] of groups) {
    frames.forEach(({ layer }, i) => {
        const celId = doc._createCel({
            data: layer.data.slice(),
            opacity: layer.opacity,
            textData: null,
            // Dropped: the sheet's position only says where the sprite sat in
            // the sheet. Every frame starts at the document origin.
            offsetX: 0,
            offsetY: 0,
            width: layer.width,
            height: layer.height,
        });
        // Only the first frame of a run carries the tag — that is how Pix8
        // marks a group, and how FramePanel finds which group a frame is in.
        doc.frames.push({ tag: i === 0 ? animation : '', delay: FRAME_DELAY_MS, celIds: [celId] });
        total++;
    });
}

doc.loadFrame(0);

const blob = savePix8(doc);
writeFileSync(out, Buffer.from(await blob.arrayBuffer()));

console.log(`${sheet} -> ${out}`);
console.log(`  ${docW}x${docH}, ${total} frames in ${groups.size} tags, 1 layer "${prefix}"`);
for (const [animation, frames] of groups) {
    const sizes = [...new Set(frames.map(f => `${f.layer.width}x${f.layer.height}`))];
    const odd = sizes.some(x => x !== `${docW}x${docH}`) ? `  <- ${sizes.join(',')}` : '';
    console.log(`    ${animation.padEnd(14)} ${String(frames.length).padStart(2)} frame(s)${odd}`);
}

// A frame bigger than the canvas keeps all its pixels in the file — cels carry
// their own size — but the document only renders and exports what fits, so say
// so rather than let it be discovered later.
const tooBig = ordered.filter(l => l.width > docW || l.height > docH);
if (tooBig.length) {
    console.log('');
    console.log(`  WARNING: ${tooBig.length} frame(s) are larger than the ${docW}x${docH} canvas and will`);
    console.log('           render clipped. Use --size=max, or give --size=WxH explicitly:');
    for (const l of tooBig.slice(0, 6)) {
        console.log(`             ${l.name.padEnd(30)} ${l.width}x${l.height}`);
    }
    if (tooBig.length > 6) console.log(`             ... and ${tooBig.length - 6} more`);
}
