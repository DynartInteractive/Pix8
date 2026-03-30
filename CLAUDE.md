# CLAUDE.md

## Project Overview

Pix8 is a 256-color indexed pixel art editor for the browser. It targets VGA-era workflows where all colors come from a shared 256-entry palette. Written in vanilla JS/HTML/CSS with ES modules, no bundler, served via `npx serve .`.

## Architecture

- **Data model** (`js/model/`): `ImageDocument` owns `Layer[]`, `Palette`, `Brush`, FG/BG color indices. Layers store pixel data as `Uint16Array` (0-255 = palette index, 256 = TRANSPARENT sentinel). One palette per document, shared by all layers.
- **Rendering** (`js/render/`): `Renderer.composite()` iterates visible layers bottom-to-top, resolves palette indices to RGBA `ImageData`. Drawn to an offscreen 1:1 canvas, then scaled to the visible canvas with `imageSmoothingEnabled = false`.
- **Tools** (`js/tools/`): All extend `BaseTool` which provides `stampBrush()`. Tools receive document-space coordinates from `CanvasView`. Brush selector tools capture regions as `Brush` objects and auto-switch to BrushTool.
- **UI** (`js/ui/`): `CanvasView` handles zoom/pan/pointer dispatch. `Toolbar`, `LayersPanel`, `PalettePanel`, `ColorSelector` manage their respective DOM sections.
- **Communication**: `EventBus` (simple pub/sub). Key events: `layer-changed`, `palette-changed`, `fg-color-changed`, `bg-color-changed`, `brush-changed`, `tool-changed`, `zoom-changed`, `document-changed`, `cursor-move`, `switch-tool`.
- **Undo** (`js/history/`): `UndoManager` snapshots the active layer's `Uint16Array` before each tool operation. Integrated by wrapping `CanvasView._onPointerDown/Up` in `app.js`.
- **File I/O** (`js/util/io.js`): `.pix8` (custom binary with JSON metadata), 8-bit BMP, 8-bit PCX (RLE), PNG export. BMP/PCX export maps TRANSPARENT to index 0.

## Key Conventions

- **TRANSPARENT = 256** (defined in `constants.js`). All 256 palette indices (0-255) are valid colors. Never use index 0 as transparency.
- **Uint16Array** for all pixel data (layer data, brush data) to accommodate the 256 sentinel.
- **No frameworks or bundler**. Plain ES modules with `<script type="module">`. Served by any static HTTP server.
- **Dark theme only**, desktop only (min 1200px), fixed layout.
- CSS uses custom properties defined in `css/main.css` (e.g. `--bg-primary`, `--accent`, `--border`).

## Running

```
npm install
npm start    # runs npx serve .
```

## Testing

No automated test suite. Manual testing: open in browser, verify tools, zoom, layers, palette editing, file import/export (especially 8-bit BMP and PCX files).

## Common Tasks

- **Adding a new tool**: Create a class extending `BaseTool` in `js/tools/`, import it in `app.js`, add to the `tools` array, and add the tool name to the appropriate group in `Toolbar.js`.
- **Adding a new file format**: Add import/export functions in `js/util/io.js`, wire them into the File menu in `app.js._showFileMenu()`.
- **Modifying the palette model**: The palette is shared document-wide. Changing a color entry instantly affects all pixels on all layers using that index (no pixel data changes, just the lookup table).
