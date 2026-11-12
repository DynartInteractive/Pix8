/**
 * Session autosave in IndexedDB. One record holds every open tab as a .pix8
 * byte buffer, so a crash, a browser refresh, or Android killing the app
 * in the background loses at most a couple of seconds of work. app.js
 * decides when to write (debounced on edits, immediately when the page is
 * hidden) and offers a restore on the next launch.
 *
 * Every function resolves quietly when IndexedDB is unavailable (private
 * mode, blocked storage): autosave is a safety net, never a blocker.
 */
const DB_NAME = 'pix8';
const STORE = 'session';
const KEY = 'tabs';

function openDb() {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB unavailable'));
            return;
        }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            if (!req.result.objectStoreNames.contains(STORE)) {
                req.result.createObjectStore(STORE);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        req.onblocked = () => reject(new Error('IndexedDB blocked'));
    });
}

function withStore(mode, fn) {
    return openDb().then((db) => new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        tx.oncomplete = () => { db.close(); resolve(req ? req.result : undefined); };
        tx.onerror = () => { db.close(); reject(tx.error); };
        tx.onabort = () => { db.close(); reject(tx.error); };
    }));
}

/**
 * @param {{ savedAt: number, activeIndex: number,
 *           tabs: { name: string, data: ArrayBuffer }[] }} session
 */
export function writeSession(session) {
    return withStore('readwrite', (store) => store.put(session, KEY)).catch(() => {});
}

/** Resolves to the stored session, or null. */
export function readSession() {
    return withStore('readonly', (store) => store.get(KEY))
        .then((v) => v || null)
        .catch(() => null);
}

export function clearSession() {
    return withStore('readwrite', (store) => store.delete(KEY)).catch(() => {});
}
