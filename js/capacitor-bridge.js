/**
 * Native bridge for the Capacitor (Android) build. Built as its own bundle
 * (dist/capacitor-bridge.js) and loaded by www/index.html only — the web and
 * Electron builds never see it. It plays the role electron-preload.js plays
 * on the desktop: window.capacitorAPI is the seam io.js and app.js check.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';

// Native Save As / Open dialogs: android/app/src/main/java/net/dynart/pix8/FilesPlugin.java
const Pix8Files = registerPlugin('Pix8Files');

function toBase64(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
}

function fromBase64(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

function isCancel(err) {
    return err && err.code === 'CANCELLED';
}

/**
 * System "Save as" dialog, opening in Documents/Pix8 with the suggested
 * name. Resolves to the name the user settled on. Rejects with
 * { cancelled: true } when they back out.
 */
async function saveFile(filename, arrayBuffer) {
    try {
        // Two steps: the bytes must not ride along on the call that opens the
        // dialog (see FilesPlugin.pendingData).
        await Pix8Files.stage({ data: toBase64(arrayBuffer) });
        const result = await Pix8Files.saveAs({ name: filename });
        return result.name;
    } catch (err) {
        if (isCancel(err)) {
            const e = new Error('Save cancelled');
            e.cancelled = true;
            throw e;
        }
        throw err;
    }
}

/** System "Open" dialog. Resolves to a File, or null when cancelled. */
async function pickFile() {
    try {
        const result = await Pix8Files.open();
        return new File([fromBase64(result.data)], result.name);
    } catch (err) {
        if (isCancel(err)) return null;
        throw err;
    }
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
    pickFile,
};
