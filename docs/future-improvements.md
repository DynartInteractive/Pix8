# Future Improvements

Ideas for after 1.8.0. Not commitments and not ordered by priority — this is
the list so that nothing has to be remembered, with enough detail that picking
one up later doesn't mean re-deciding what it meant.

## Palette animation (color cycling)

Rotate the colors within a palette range on a timer, the Deluxe Paint trick:
waterfalls, fire, flowing lava, marquee lights — all animated by shifting
palette entries rather than by drawing frames. It fits Pix8's model
particularly well, because pixel data never changes; only the lookup table
does.

Defined in the palette editor, which already has what's needed to select the
range: `PaletteEditDialog` tracks `_rangeStart` / `_rangeEnd` from a drag
across the 16×16 grid, and that is exactly the span a cycle acts on.

Each cycle wants a range, a rate, and a direction, with several cycles active
at once over different ranges. Things to decide when this is built:

- **Where the cycles live.** On `ImageDocument` beside the palette, which means
  the `.pix8` format gains a cycles table — small, but a format change.
- **Preview vs. export.** Cycling in the canvas view is a render-time effect
  (rotate the palette before `Renderer.composite()` resolves indices). Baking
  it into a GIF is a different job: one output frame per cycle step.
- **Interaction with animation frames.** A document can have both. They're
  independent — frames change pixels, cycling changes the lookup — but the GIF
  exporter would have to compose the two.

## Tabbed docks

The right panel is currently a fixed stack: layers on top, palette below. With
brush management arriving as a third panel, and a frames timeline already
competing for space, a fixed stack runs out of room.

Tabs within a dock — Layers / Brushes sharing one pane — keep each panel at a
usable height instead of giving every panel a shrinking slice. `#right-panel`
is a flex column of `#layers-panel` and `#palette-panel`, so this is a
contained change, but note that 1.8.0 made the palette dock size itself to its
16 rows of swatches; a tabbed dock has to decide whether the palette stays
pinned below the tabs or joins them.

## Brush management

Named brushes in a list like the layers panel, each with a small thumbnail.

Today there is exactly one brush: `ImageDocument.activeBrush`, replaced
wholesale by *Edit > Set Brush*. Capturing a nice dither pattern or a custom
nib and then capturing a second one loses the first.

`Brush` already carries everything a stored brush needs — `width`, `height`,
`data`, `isCaptured`, `originX` / `originY` — so this is mostly a collection, a
panel, and persistence. Worth deciding whether brushes belong to the document
(saved in `.pix8`, travels with the art) or to the app (available across all
documents, saved separately). A brush library is more useful across documents;
a brush captured from the art is more natural to keep with it.

The layers panel is the model to copy, including the lesson it learned in
1.8.0: draw thumbnails only for rows actually on screen.

## Gradient fill

An indexed gradient that maps a range of palette indices across a line or a
shape — the long-standing item from the original list, and the natural partner
to a palette whose columns are now 16-step ramps. The gradient picks the range;
the palette makes the range meaningful.

Fills a selection or a shape, with the direction set by dragging a line.

## Dithering while drawing

Pix8 dithers today only when *importing* truecolor images — `quantizeImage()`
and `mapToPalette()` in `js/util/quantize.js`, with Floyd–Steinberg and an
ordered Bayer 4×4.

What's missing is dithering as a *drawing* tool: mixing two palette indices in
a pattern, at a controllable density, the way DPaint's dither slider worked.
Most valuable on the gradient fill above — a dithered indexed gradient is how
VGA-era art got smooth ramps out of a few colors — but it applies to the fill
tool and the shape tools too.

The `BAYER4` matrix in `quantize.js` is already there to build on, though
drawing-time dithering is a different operation from quantization: the two
indices are chosen, not searched for.

---

## Carried over from the original list

From `archive/future-improvements.md`, which predates most of what has since
shipped. Palette handling and the flood fill landed in 1.6.x; these did not:

- **Indexed opacity** — per-pixel opacity by palette index remapping rather
  than true alpha, staying faithful to the 256-color indexed model.
- **Fill tolerance** — flood fill with configurable tolerance for indexed
  workflows.
- **Mask effects** — layer mask effects driven by palette indices, for VGA-era
  compositing within the indexed paradigm. The original note calls this "the
  core vision of the project", which is worth not losing in an archive folder.
