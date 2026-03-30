export class PalettePanel {
    constructor(doc, bus) {
        this.doc = doc;
        this.bus = bus;

        this.grid = document.getElementById('palette-grid');
        this.editor = document.getElementById('palette-editor');
        this.editorIndex = document.getElementById('palette-editor-index');
        this.editorPreview = document.getElementById('palette-editor-preview');

        this.rSlider = document.getElementById('pal-r');
        this.gSlider = document.getElementById('pal-g');
        this.bSlider = document.getElementById('pal-b');
        this.rNum = document.getElementById('pal-r-num');
        this.gNum = document.getElementById('pal-g-num');
        this.bNum = document.getElementById('pal-b-num');

        this._swatches = [];
        this._editIndex = -1;

        this._buildGrid();
        this._setupEditor();

        this.bus.on('fg-color-changed', () => this._updateSelection());
        this.bus.on('bg-color-changed', () => this._updateSelection());
        this.bus.on('palette-changed', () => this._updateAllSwatches());
    }

    _buildGrid() {
        this.grid.innerHTML = '';
        for (let i = 0; i < 256; i++) {
            const swatch = document.createElement('div');
            swatch.className = 'palette-swatch';
            swatch.dataset.index = i;

            const [r, g, b] = this.doc.palette.getColor(i);
            swatch.style.backgroundColor = `rgb(${r},${g},${b})`;

            swatch.addEventListener('click', (e) => {
                this.doc.fgColorIndex = i;
                this.bus.emit('fg-color-changed');
            });

            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.doc.bgColorIndex = i;
                this.bus.emit('bg-color-changed');
            });

            swatch.addEventListener('dblclick', (e) => {
                this._openEditor(i);
            });

            this.grid.appendChild(swatch);
            this._swatches.push(swatch);
        }
        this._updateSelection();
    }

    _updateSelection() {
        for (let i = 0; i < 256; i++) {
            const sw = this._swatches[i];
            sw.classList.toggle('fg-selected', i === this.doc.fgColorIndex);
            sw.classList.toggle('bg-selected', i === this.doc.bgColorIndex);
        }
    }

    _updateAllSwatches() {
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = this.doc.palette.getColor(i);
            this._swatches[i].style.backgroundColor = `rgb(${r},${g},${b})`;
        }
    }

    _openEditor(index) {
        this._editIndex = index;
        this.editor.classList.add('visible');
        this._syncEditorFromPalette();
    }

    _setupEditor() {
        const updateFromSlider = () => {
            if (this._editIndex < 0) return;
            const r = parseInt(this.rSlider.value);
            const g = parseInt(this.gSlider.value);
            const b = parseInt(this.bSlider.value);
            this.rNum.value = r;
            this.gNum.value = g;
            this.bNum.value = b;
            this._applyColor(r, g, b);
        };

        const updateFromNum = () => {
            if (this._editIndex < 0) return;
            const r = parseInt(this.rNum.value) || 0;
            const g = parseInt(this.gNum.value) || 0;
            const b = parseInt(this.bNum.value) || 0;
            this.rSlider.value = r;
            this.gSlider.value = g;
            this.bSlider.value = b;
            this._applyColor(r, g, b);
        };

        for (const slider of [this.rSlider, this.gSlider, this.bSlider]) {
            slider.addEventListener('input', updateFromSlider);
        }
        for (const num of [this.rNum, this.gNum, this.bNum]) {
            num.addEventListener('change', updateFromNum);
        }
    }

    _syncEditorFromPalette() {
        const [r, g, b] = this.doc.palette.getColor(this._editIndex);
        this.editorIndex.textContent = `Index: ${this._editIndex}`;
        this.editorPreview.style.backgroundColor = `rgb(${r},${g},${b})`;
        this.rSlider.value = r; this.rNum.value = r;
        this.gSlider.value = g; this.gNum.value = g;
        this.bSlider.value = b; this.bNum.value = b;
    }

    _applyColor(r, g, b) {
        this.doc.palette.setColor(this._editIndex, r, g, b);
        this.editorPreview.style.backgroundColor = `rgb(${r},${g},${b})`;
        this._swatches[this._editIndex].style.backgroundColor = `rgb(${r},${g},${b})`;
        this.bus.emit('palette-changed');
    }
}
