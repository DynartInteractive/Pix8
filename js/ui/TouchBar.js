/**
 * Touch controls at the right end of the tab bar: sticky Shift/Ctrl/Alt
 * (a finger has no modifier keys), Undo/Redo (no keyboard either), and a
 * Pen switch that turns fingers into pan-only so a resting palm cannot draw.
 *
 * Shown automatically on a coarse-pointer device or the first time a touch
 * or pen pointer is seen; View > Touch Controls overrides that either way
 * and the choice is remembered in localStorage.
 */
const STORAGE_VISIBLE = 'pix8-touch-bar';
const STORAGE_PEN = 'pix8-pen-mode';

export class TouchBar {
    constructor(bus, canvasView) {
        this.bus = bus;
        this.cv = canvasView;
        this.container = document.getElementById('touch-bar');
        this.visible = false;
        this._modBtns = {};

        this._build();

        let stored = null;
        try { stored = localStorage.getItem(STORAGE_VISIBLE); } catch (e) { /* private mode */ }
        if (stored === 'yes') {
            this.setVisible(true);
        } else if (stored !== 'no') {
            const coarse = window.matchMedia && window.matchMedia('(any-pointer: coarse)').matches;
            if (coarse) this.setVisible(true);
            // Mouse-only desktops that later see a finger or pen get the bar too.
            const onFirstTouch = (e) => {
                if (e.pointerType === 'touch' || e.pointerType === 'pen') {
                    document.removeEventListener('pointerdown', onFirstTouch, true);
                    if (!this.visible && !this._userChoice) this.setVisible(true);
                }
            };
            document.addEventListener('pointerdown', onFirstTouch, true);
        }

        this.bus.on('sticky-modifiers-changed', (mods) => this._reflectModifiers(mods));
        this.bus.on('pen-mode-changed', (on) => {
            this._penBtn.classList.toggle('active', on);
            try { localStorage.setItem(STORAGE_PEN, on ? 'yes' : 'no'); } catch (e) { /* ignore */ }
        });

        let pen = null;
        try { pen = localStorage.getItem(STORAGE_PEN); } catch (e) { /* ignore */ }
        if (pen === 'yes') this.cv.setPenMode(true);
    }

    _build() {
        const c = this.container;
        c.innerHTML = '';

        for (const [key, label] of [['shiftKey', 'Shift'], ['ctrlKey', 'Ctrl'], ['altKey', 'Alt']]) {
            const btn = this._button(label, `Hold ${label} for the next strokes`);
            btn.addEventListener('click', () => {
                this.cv.setStickyModifier(key, !this.cv.stickyModifiers[key]);
            });
            this._modBtns[key] = btn;
            c.appendChild(btn);
        }

        c.appendChild(this._separator());

        const undo = this._button('↶', 'Undo (Ctrl+Z)');
        undo.classList.add('touch-btn-icon');
        undo.addEventListener('click', () => this.bus.emit('undo-request'));
        c.appendChild(undo);

        const redo = this._button('↷', 'Redo (Ctrl+Shift+Z)');
        redo.classList.add('touch-btn-icon');
        redo.addEventListener('click', () => this.bus.emit('redo-request'));
        c.appendChild(redo);

        c.appendChild(this._separator());

        this._penBtn = this._button('Pen', 'Pen mode: only the pen draws, one finger pans');
        this._penBtn.addEventListener('click', () => this.cv.setPenMode(!this.cv.penMode));
        c.appendChild(this._penBtn);

        // Full screen works over plain http, unlike an installed web app, so
        // it is the quick way to lose the browser chrome on a tablet.
        // The Android app already runs without a status bar (styles.xml).
        if (document.fullscreenEnabled && !window.capacitorAPI) {
            c.appendChild(this._separator());
            this._fsBtn = this._button('\u26F6', 'Toggle full screen');
            this._fsBtn.classList.add('touch-btn-icon');
            this._fsBtn.addEventListener('click', () => TouchBar.toggleFullscreen());
            document.addEventListener('fullscreenchange', () => {
                this._fsBtn.classList.toggle('active', !!document.fullscreenElement);
            });
            c.appendChild(this._fsBtn);
        }
    }

    static toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else if (document.fullscreenEnabled) {
            document.documentElement.requestFullscreen().catch(() => {});
        }
    }

    _button(text, title) {
        const btn = document.createElement('button');
        btn.className = 'touch-btn';
        btn.textContent = text;
        btn.title = title;
        return btn;
    }

    _separator() {
        const sep = document.createElement('span');
        sep.className = 'touch-sep';
        return sep;
    }

    _reflectModifiers(mods) {
        for (const key of Object.keys(this._modBtns)) {
            this._modBtns[key].classList.toggle('active', !!mods[key]);
        }
    }

    setVisible(on) {
        this.visible = on;
        this.container.hidden = !on;
        // Latched modifiers must not outlive the buttons that show them.
        if (!on) this.cv.clearStickyModifiers();
    }

    /** View menu toggle: an explicit choice, remembered across sessions. */
    toggle() {
        this._userChoice = true;
        this.setVisible(!this.visible);
        try { localStorage.setItem(STORAGE_VISIBLE, this.visible ? 'yes' : 'no'); } catch (e) { /* ignore */ }
    }
}
