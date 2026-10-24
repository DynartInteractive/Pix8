# Palettes

Loadable via the palette editor's **Load** button (JASC-PAL, 8-bit).

- `deluxepaint-ii.pal` — Deluxe Paint II's default palette, which is also what
  Pix8 now starts every new document with. Recovered from a screenshot of
  DPaint's own Palette requester; see the comment on `DELUXE_PAINT_PALETTE` in
  `js/constants.js` for how, and why every entry is exact rather than sampled.
- `xterm-256.pal` — what Pix8 used as its default before that: the 16 CGA
  colors, the 6x6x6 web-safe cube, and a 24-step gray ramp. This is the
  xterm-256 terminal layout; only its middle 216 are the web-safe palette.
