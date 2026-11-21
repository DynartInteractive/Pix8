# Releasing

To force browsers to pick up new CSS/JS/image files on the production site, bump the version in **three** places on every release:

1. `package.json` -- `"version"` field
2. `js/constants.js` -- `ASSET_VERSION` constant (used by the About dialog and appended to tool/panel icon URLs via the `withVersion()` helper)
3. `index.html` -- find/replace every `?v=1.9.0` query string on stylesheet, script, and `<img>` tags

Then `npm run build` and deploy. The new query strings give browsers fresh URLs, bypassing any previously cached response.

Then, for a tagged release:

4. Add a section to `CHANGELOG.md`, and release notes in `docs/releases/vX.Y.Z.md`
5. `npm run dist:win` -- on Linux this needs Wine *and* 32-bit support, since electron-builder's NSIS tooling is 32-bit: `sudo dpkg --add-architecture i386 && sudo apt install wine wine32:i386`. If a Wine prefix was already created before `wine32` landed it has no `syswow64` and the build still fails -- delete `~/.wine` and let it rebuild. Run with `WINEDLLOVERRIDES="mscoree,mshtml="` so Wine doesn't block on Mono/Gecko install dialogs.
6. Fill the file sizes and SHA-256 hashes into the release notes, and point the README download links at the new tag
7. Tag (annotated, `git tag -a vX.Y.Z`) and upload both `.exe` files from `release/` **as built** -- GitHub turns the spaces in their filenames into the dots the download links use

For screenshots, `css/main.css` carries a commented-out `max-width`/`max-height` pair that pins the UI to 1280x720, so successive screenshots come out at a consistent size.
