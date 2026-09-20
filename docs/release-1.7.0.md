# Pix8 1.7.0

Linked cels. Several frames can now share one image, so a held pose, a static
background or a two-frame blink cycle only has to be drawn once — and editing
any one of those frames updates all of them, because there is only one image
behind them.

This is the animation release. If you don't use the frame timeline, the only
things you'll notice are two fixes and a pair of new shortcuts. The full
feature and keyboard list lives in the [README](../README.md).

## Linked cels

A **cel** is one layer's image on one frame. The timeline holds a grid of them:
every (layer × frame) pair has a cel. Until now each of those was its own
picture, and a background that never moved was stored — and redrawn — once per
frame.

Now two frames can hold the *same* cel:

- **Add linked frame**, next to *Add frame* in the frame panel, creates a frame
  sharing every cel of the current one.
- **Shift+click** the timeline to select a frame range, then **Link** to point
  them all at the active frame's image, or **Unlink** to break them apart
  again.
- Editing a linked cel — drawing on it, moving it, changing its layer opacity —
  shows up on every frame that shares it, immediately, including in the other
  frames' thumbnails.
- **Unlink** clones the cel. The frame keeps the pixels it was showing and
  stops following its siblings; nothing disappears.
- Both are undoable.

**Link discards image data.** Pointing three frames at one image means the two
images they were showing are gone. The confirmation says how many frames it
will overwrite, and undo brings them back, but it is not a reversible operation
the way Unlink is.

### A link belongs to a layer, not to a frame

This is the part worth internalising, because it isn't what the button
placement suggests. Link and Unlink act on the **active layer** across the
selected frames. There is no operation that links two frames outright — a cel
is (layer × frame), so "these frames are linked" isn't a statement the model
can hold.

That's a feature rather than a limitation: you can link a static background
across an entire tag while the character layer stays unique on every frame,
which is the normal way to build a walk cycle over a fixed scene. *Add linked
frame* is the whole-frame shortcut, and it works by linking every layer at
once.

### The run bar shows one layer at a time

Linked frames are marked by a bar under their thumbnails, bridging the gap
between neighbours so a run reads as one continuous span. Like the buttons, it
shows the **active layer** — switch layers and it redraws for that layer's
links.

The timeline is one-dimensional: a row of composited thumbnails, one per frame.
Showing every layer's links at once would need a layers × frames grid, which is
a different panel. Until then, the active layer is the honest thing to draw.

Links don't have to be contiguous, either — frames 1 and 5 can share a cel with
nothing between them. The bar only draws runs, so a gapped link is real but
invisible.

## Animated `.pix8` files changed

A `.pix8` file used to store a full copy of every layer on every frame. It now
writes a **cel table**, and gives each frame a list of cel ids pointing into
it. A frame linked to another costs a handful of bytes instead of a second copy
of the image — a ten-frame hold of one background drops from ten copies to one.
A file with nothing linked is the same size as before, give or take the ids.

**Animated `.pix8` files written before 1.7.0 will not open.** There is no
reader for the old layout. Non-animated files are unaffected — the loader only
enters the frame path when the file says animation is enabled, so everything
else opens exactly as before.

Breaking a file format normally argues for a major version. This went into a
minor one because no animated `.pix8` files existed in the wild to break, and
because 2.0.0 is reserved for 24-bit truecolor support (see
[`plan-24bit.md`](plan-24bit.md)). Noting the deviation here is the price of
taking it.

## Stepping frames

**`,`** and **`.`** move to the previous and next frame, and wrap at the ends.
They're only live when animation is enabled.

## Two fixes

**Undo after moving multiple layers restores all of them.** Move — and
arrow-key nudge — act on every layer in the multi-layer selection, but undo had
only ever snapshotted the *active* layer. Undoing a multi-layer move put one
layer back and left the rest displaced, with no way to return them. Tool undo
entries now carry a before/after record per layer.

**Layer borders no longer march.** With *Show Border* or *Show All Borders* on
and a selection active, the dashed layer outlines crawled along with the
selection's marching ants. The ants left their animated dash offset on the
overlay context they share with the borders, which are drawn first on the next
frame and inherited it.

## For contributors

The one rule the cel table imposes: **anything that transforms pixel data
across frames must iterate `doc.cels`, not `frames[].celIds`**. A cel
referenced by N frames would otherwise be rotated, resized or remapped N times.
Rotate and resize in `ImageOperations.js` and `remapColorIndices()` show the
shape.

Two design notes that are easy to undo by accident:

- Frames reference cels **by id, not by object reference**. Every undo snapshot
  and every `.pix8` round-trip deep-copies the document, and ids survive
  copying where shared references don't.
- `saveCurrentFrame()` mutates cel records **in place** and never replaces
  them. That in-place write is the entire mechanism by which an edit reaches
  every linked frame.

`getLinkRun()` derives runs from ids on demand rather than storing them, so
reordering or deleting frames needs no fix-up.

The architecture notes in [`CLAUDE.md`](../CLAUDE.md) cover the rest.
