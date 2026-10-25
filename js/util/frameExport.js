// Shared by the in-app "PNG frames (zip)" export and the `pix8 export:frames`
// CLI. Both need the same filenames and the same frame walk; only the encoding
// and the destination differ — the browser goes through canvas.toBlob() into a
// zip, the CLI through a zlib PNG encoder onto disk. Keeping the naming here
// means the two cannot drift apart.

export function sanitizeFilename(name, fallback = 'frame') {
    let n = (name || '').replace(/[\/\\:*?"<>|\x00-\x1f]+/g, '_').replace(/\s+/g, ' ').trim();
    // Strip trailing dots/spaces (illegal on Windows) and guard empty names.
    n = n.replace(/[. ]+$/, '');
    return n || fallback;
}

// One filename per frame, in frame order: <basename>_<tag>_<n>.png.
//
// A tag marks the start of a run and the frames after it belong to that run
// until the next tag, so the tag has to be carried forward rather than read off
// each frame. The _<n> is omitted when a run holds a single frame, so a
// one-frame `die` is fox_die.png and not fox_die_1.png. Frames ahead of the
// first tag belong to no run and fall back to <basename>_<n>.png.
//
// Underscores, not dashes: the sprite sheets these come from name their layers
// `player_idle_1`, and the exported files feed back into texture packing.
//
// `options` decouples the tag a document uses from the name it exports under,
// because the two answer to different readers: a tag is for whoever is editing
// the animation, while the filename has to be whatever the game already asks
// for. `noTags: true` drops the tag component from every name, and
// `tagNames: {rotate: '', bounce: 'bottom'}` renames or (empty string) drops
// individual tags. So a document can carry a `rotate` tag and still export the
// `circular_saw_1..3.png` a texture packer is expecting.
export function frameExportNames(doc, basename, options = {}) {
    const frames = doc.frames || [];
    if (!doc.animationEnabled || frames.length === 0) return [];

    const overrides = options.tagNames || null;
    const has = tag => overrides && Object.prototype.hasOwnProperty.call(overrides, tag);
    const rename = tag => {
        if (!tag) return '';
        if (has(tag)) return overrides[tag];
        return options.noTags ? '' : tag;
    };

    // Runs are delimited by the tags the document actually holds; the rename
    // happens after, so a tag dropped from the filename still ends the run
    // before it.
    const sourceTagOf = [];
    let current = '';
    for (const frame of frames) {
        if (frame.tag) current = frame.tag;
        sourceTagOf.push(current);
    }
    const tagOf = sourceTagOf.map(rename);

    // Two runs landing on one name would silently interleave into a single
    // numbered sequence, which for a texture packer means two animations fused
    // into one. That is never what was meant, so say so instead.
    const sources = new Map();
    for (let i = 0; i < frames.length; i++) {
        const set = sources.get(tagOf[i]) || new Set();
        set.add(sourceTagOf[i]);
        sources.set(tagOf[i], set);
    }
    for (const [tag, set] of sources) {
        if (set.size < 2) continue;
        const from = [...set].map(t => t || '(untagged)').join(', ');
        throw new Error(
            `tags ${from} would all export as ${basename}${tag ? '_' + tag : ''}_<n>.png`
            + ` -- rename them apart instead of dropping both`);
    }

    const runLength = new Map();
    for (const tag of tagOf) runLength.set(tag, (runLength.get(tag) || 0) + 1);

    const position = new Map();
    const used = new Set();
    return frames.map((_, i) => {
        const tag = tagOf[i];
        const n = (position.get(tag) || 0) + 1;
        position.set(tag, n);

        const parts = [basename];
        if (tag) parts.push(sanitizeFilename(tag));
        if (runLength.get(tag) > 1) parts.push(String(n));

        // Two runs can only collide through an unlucky tag name (a tag literally
        // called "2", say). Suffix rather than silently overwrite.
        const stem = parts.join('_');
        let name = stem;
        let bump = 2;
        while (used.has(name.toLowerCase())) name = `${stem}_${bump++}`;
        used.add(name.toLowerCase());

        return name + '.png';
    });
}

// Composite every frame in order, handing each one to `visit(imageData, index)`.
// Restores the document afterwards: this loads each frame into the live layers
// to render it, which would otherwise leave the document parked on the last
// frame with the user's onion-skin setting switched off.
export async function forEachFrameImage(doc, renderer, visit) {
    const frames = doc.frames || [];
    if (!doc.animationEnabled || frames.length === 0) return 0;

    doc.saveCurrentFrame();
    const savedActiveIndex = doc.activeFrameIndex;
    // Onion skinning is a working-view aid, and composite() honours it — without
    // this every exported frame carries the red/blue ghosts of its neighbours.
    const savedOnion = doc.onionSkinning;
    doc.onionSkinning = false;

    for (let i = 0; i < frames.length; i++) {
        doc._restoreLayersFromFrame(frames[i]);
        // floating:false for the same reason onion skinning is off above -- a
        // paste still held above the layer belongs to no frame, and would
        // otherwise be baked into every one of them.
        await visit(renderer.composite({ floating: false }), i);
    }

    doc._restoreLayersFromFrame(frames[savedActiveIndex]);
    doc.activeFrameIndex = savedActiveIndex;
    doc.onionSkinning = savedOnion;

    return frames.length;
}
