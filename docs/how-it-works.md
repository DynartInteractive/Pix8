# How It Works

## Project structure

```
css/               CSS files (layout, dark theme, panel styles)
dist/              Webpack output (bundle.js)
docs/              Algorithm documentation, release notes, roadmap
images/            SVG icons (editable with Inkscape)
palettes/          Loadable .PAL palettes (Deluxe Paint II, xterm-256)
tools/             Command line (pix8.mjs) and the sprite sheet splitter
js/
  app.js           Application bootstrap and wiring
  EventBus.js      Simple pub/sub event system
  constants.js     Deluxe Paint II default palette, zoom levels, TRANSPARENT sentinel
  model/           Data model (ImageDocument, Layer, Palette, Brush, Selection)
  history/         Undo/redo manager
  render/          Compositing renderer and grid overlay
  tools/           All drawing and selection tools
  ui/              UI panels (CanvasView, Toolbar, LayersPanel, PalettePanel, etc.)
  util/            File I/O, quantization, GIF encoder, SPX exporter
index.html         Single-page entry point
webpack.config.js  Webpack configuration
```

## Technical notes

- All pixel data is stored as `Uint16Array` with values 0-255 for palette indices and 256 for transparent pixels
- Layers are independently sized and positioned -- drawing outside bounds auto-extends with 16px growth padding (unless the layer is fixed-size)
- Rendering composites layers bottom-to-top via palette lookup into RGBA `ImageData`, drawn with `imageSmoothingEnabled = false`
- GIF export uses a native LZW encoder -- no external encoding libraries
- SPX export uses skyline bin packing to minimize sprite sheet area within 320x200 VGA constraints
- JSZip is the only runtime dependency (for SPX ZIP export)
- All toolbar and panel icons are standalone SVG files in `images/`, for easy customization

## Algorithms

- [dithering.md](dithering.md) -- median cut quantization and the dither modes used on truecolor import
- [gif89a.md](gif89a.md) -- the GIF encoder
- [skyline-algorithm.md](skyline-algorithm.md) -- sprite sheet packing for SPX export

A longer, per-module description of the architecture is in [CLAUDE.md](../CLAUDE.md).
