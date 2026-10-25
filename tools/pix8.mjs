#!/usr/bin/env node
//
// Pix8 command line.
//
//   pix8 export:frames <source.pix8> <output-folder>
//
// Exports every animation frame as its own PNG, named exactly as the in-app
// "PNG frames (zip)" export names them — <basename>_<tag>_<n>.png, with the
// _<n> dropped for a single-frame tag — but written as loose files instead of
// zipped. Basename comes from the source filename unless --basename says
// otherwise.
//
// The naming and the frame walk come from js/util/frameExport.js, the same
// module the in-app export uses, so the two stay identical by construction.
// Rendering uses the real Renderer; it only touches the DOM for text layers,
// so an ImageData shim is enough to run it here.

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, unlinkSync } from 'node:fs';
import { basename as pathBasename, extname, join } from 'node:path';

// Must exist before anything that constructs one is imported.
if (typeof globalThis.ImageData === 'undefined') {
    globalThis.ImageData = class ImageData {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.data = new Uint8ClampedArray(width * height * 4);
        }
    };
}

const { loadPix8 } = await import('../js/util/io.js');
const { Renderer } = await import('../js/render/Renderer.js');
const { frameExportNames, forEachFrameImage } = await import('../js/util/frameExport.js');
const { encodePNG } = await import('./png.mjs');

function usage(code) {
    console.error(`pix8 - Pix8 command line

usage:
  pix8 export:frames <source.pix8> <output-folder> [options]

  export:frames   one PNG per animation frame, named <basename>_<tag>_<n>.png
                  (_<n> omitted when a tag holds a single frame)

options:
  --basename=NAME  override the name taken from the source file
  --no-tags        leave the tag out of every filename: <basename>_<n>.png.
                   For a document whose tag is there to label the animation in
                   the editor rather than to name the files.
  --tag=OLD:NEW    export the tag OLD as NEW; an empty NEW drops it. Repeatable.
                     --tag=bounce:bottom      springboard_bottom_1..4.png
                     --tag=float:             fireball_1..3.png
  --clean          delete <basename>_*.png left over from an earlier export
  --dry-run        list what would be written without writing it

Existing files are overwritten. Frames that no longer exist are not: renaming a
tag leaves its old PNGs behind, which a texture packer will happily pick up.
The run reports any it finds; --clean removes them.`);
    process.exit(code);
}

function readDocument(file) {
    if (!existsSync(file)) {
        console.error(`pix8: no such file: ${file}`);
        process.exit(1);
    }
    const bytes = readFileSync(file);
    const doc = loadPix8(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
    if (!doc) {
        console.error(`pix8: could not read ${file} as a .pix8 document`);
        process.exit(1);
    }
    return doc;
}

async function exportFrames(argv) {
    const positional = argv.filter(a => !a.startsWith('--'));
    const flag = name => argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3);
    const dryRun = argv.includes('--dry-run');
    const clean = argv.includes('--clean');
    const noTags = argv.includes('--no-tags');
    // --tag=OLD:NEW, repeatable. Split on the first colon only, so a NEW
    // containing one is still rejected later by the filename sanitiser rather
    // than silently truncated here.
    const tagNames = {};
    for (const arg of argv.filter(a => a.startsWith('--tag='))) {
        const spec = arg.slice('--tag='.length);
        const at = spec.indexOf(':');
        if (at < 1) {
            console.error(`pix8: --tag needs OLD:NEW, got "${spec}"`);
            process.exit(2);
        }
        tagNames[spec.slice(0, at)] = spec.slice(at + 1);
    }

    if (positional.length < 2) usage(2);
    const [source, outDir] = positional;

    const doc = readDocument(source);
    if (!doc.animationEnabled || !doc.frames.length) {
        console.error(`pix8: ${source} has no animation frames (enable animation in Pix8 first)`);
        process.exit(1);
    }
    // The Renderer rasterises text layers through the canvas API, which does not
    // exist here. Say so plainly rather than crash halfway through a folder.
    const textLayers = doc.layers.filter(l => l.type === 'text');
    if (textLayers.length) {
        console.error(`pix8: ${source} contains ${textLayers.length} text layer(s), which need a browser to render.`);
        console.error('      Convert them to bitmap in Pix8 (Layer > Convert to Bitmap) and retry.');
        process.exit(1);
    }

    const base = flag('basename') || pathBasename(source, extname(source));

    const tags = [...new Set(doc.frames.map(f => f.tag).filter(Boolean))];
    for (const t of Object.keys(tagNames)) {
        if (!tags.includes(t)) {
            console.error(`pix8: --tag=${t}:... but ${source} has no tag "${t}".`);
            console.error(`      tags present: ${tags.length ? tags.join(', ') : '(none)'}`);
            process.exit(1);
        }
    }

    let names;
    try {
        names = frameExportNames(doc, base, { noTags, tagNames });
    } catch (e) {
        console.error(`pix8: ${e.message}`);
        process.exit(1);
    }

    if (!dryRun) {
        mkdirSync(outDir, { recursive: true });
        if (!statSync(outDir).isDirectory()) {
            console.error(`pix8: ${outDir} is not a directory`);
            process.exit(1);
        }
    }

    const renderer = new Renderer(doc);
    let written = 0;
    let bytes = 0;
    await forEachFrameImage(doc, renderer, (imageData, i) => {
        const name = names[i];
        if (dryRun) {
            console.log(`  would write ${name}`);
            written++;
            return;
        }
        const png = encodePNG(imageData.data, imageData.width, imageData.height);
        writeFileSync(join(outDir, name), png);
        written++;
        bytes += png.length;
    });

    console.log(`${source} -> ${dryRun ? '(dry run)' : outDir}`);
    console.log(`  ${written} frame(s), ${tags.length} tag(s), ${doc.width}x${doc.height}` +
        (dryRun ? '' : `, ${(bytes / 1024).toFixed(1)} KB`));

    // Files this export did not write but that look like it did: the leftovers
    // of a tag that has since been renamed or removed. Harmless on disk, not
    // harmless once a texture packer sweeps the folder.
    const mine = new Set(names.map(n => n.toLowerCase()));
    const prefix = `${base.toLowerCase()}_`;
    const stale = existsSync(outDir)
        ? readdirSync(outDir).filter(f => {
            const lower = f.toLowerCase();
            return lower.startsWith(prefix) && lower.endsWith('.png') && !mine.has(lower);
        })
        : [];

    if (stale.length && clean && !dryRun) {
        for (const f of stale) unlinkSync(join(outDir, f));
        console.log(`  removed ${stale.length} stale file(s) from an earlier export`);
    } else if (stale.length) {
        console.log('');
        console.log(`  NOTE: ${stale.length} file(s) match ${base}_*.png but were not written by this`);
        console.log('        export — probably a tag that has been renamed since. Pass --clean to');
        console.log('        delete them:');
        for (const f of stale.slice(0, 6)) console.log(`          ${f}`);
        if (stale.length > 6) console.log(`          ... and ${stale.length - 6} more`);
    }
}

const [command, ...rest] = process.argv.slice(2);
switch (command) {
    case 'export:frames':
        await exportFrames(rest);
        break;
    case undefined:
    case '-h':
    case '--help':
        usage(0);
        break;
    default:
        console.error(`pix8: unknown command "${command}"`);
        usage(2);
}
