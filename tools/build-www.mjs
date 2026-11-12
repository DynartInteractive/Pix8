#!/usr/bin/env node
// Assemble the static site Capacitor wraps (capacitor.config.json: webDir).
// Copies the same files the Electron build ships and injects the Capacitor
// bridge script ahead of the app bundle, so window.capacitorAPI exists by the
// time app.js runs — the native counterpart of electron-preload.js.
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'www');

rmSync(out, { recursive: true, force: true });
mkdirSync(out);

for (const dir of ['dist', 'css', 'images']) {
    cpSync(join(root, dir), join(out, dir), { recursive: true });
}
cpSync(join(root, 'manifest.webmanifest'), join(out, 'manifest.webmanifest'));

let html = readFileSync(join(root, 'index.html'), 'utf8');
const bundleTag = html.match(/<script[^>]*src="dist\/bundle\.js[^"]*"[^>]*>/);
if (!bundleTag) throw new Error('index.html: bundle script tag not found');
const version = (bundleTag[0].match(/\?v=([^"]+)/) || [, ''])[1];
const bridgeTag = `<script src="dist/capacitor-bridge.js${version ? '?v=' + version : ''}"></script>\n    `;
html = html.replace(bundleTag[0], bridgeTag + bundleTag[0]);
writeFileSync(join(out, 'index.html'), html);

console.log('www/ assembled');
