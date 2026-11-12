/**
 * Native bridge for the Capacitor (Android) build. Built as its own bundle
 * (dist/capacitor-bridge.js) and loaded by www/index.html only — the web and
 * Electron builds never see it. It plays the role electron-preload.js plays
 * on the desktop: window.capacitorAPI is the seam io.js and app.js check.
 */
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { App } from '@capacitor/app';

const SAVE_FOLDER = 'Pix8';

function toBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

async function ensurePermission() {
    let status = await Filesystem.checkPermissions();
    if (status.publicStorage !== 'granted') {
        status = await Filesystem.requestPermissions();
    }
    return status.publicStorage === 'granted';
}

/**
 * Write a file into the public Documents/Pix8 folder, visible to the Files
 * app and other programs. There is no system "Save as" dialog here; the
 * name the app chose is used and an existing file of that name is replaced
 * (Android lets us overwrite files this app created).
 * Resolves to the user-facing path for a toast.
 */
async function saveFile(filename, arrayBuffer) {
    if (!(await ensurePermission())) {
        throw new Error('Storage permission denied');
    }
    const path = `${SAVE_FOLDER}/${filename}`;
    await Filesystem.writeFile({
        path,
        data: toBase64(arrayBuffer),
        directory: Directory.Documents,
        recursive: true,
    });
    return `Documents/${path}`;
}

// Android back button: close an open dialog first; otherwise ask before
// quitting, since the default (finish the activity) would drop unsaved work.
App.addListener('backButton', () => {
    const dialog = document.querySelector('.palette-dialog-overlay');
    if (dialog) {
        const target = dialog.querySelector('.palette-dialog') || dialog;
        target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        return;
    }
    if (confirm('Exit Pix8? Unsaved changes will be lost.')) {
        App.exitApp();
    }
});

window.capacitorAPI = {
    platform: Capacitor.getPlatform(),
    saveFile,
};
