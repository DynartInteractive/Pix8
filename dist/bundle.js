/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./js/EventBus.js"
/*!************************!*\
  !*** ./js/EventBus.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EventBus: () => (/* binding */ EventBus)
/* harmony export */ });
class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, fn) {
        (this._listeners[event] ??= []).push(fn);
    }

    off(event, fn) {
        const list = this._listeners[event];
        if (list) {
            this._listeners[event] = list.filter(f => f !== fn);
        }
    }

    emit(event, data) {
        const list = this._listeners[event];
        if (list) {
            for (const fn of list) {
                fn(data);
            }
        }
    }
}


/***/ },

/***/ "./js/FileManager.js"
/*!***************************!*\
  !*** ./js/FileManager.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _clearTempFrame: () => (/* binding */ _clearTempFrame),
/* harmony export */   _convertZeroToTransparent: () => (/* binding */ _convertZeroToTransparent),
/* harmony export */   _ensureSingleFrame: () => (/* binding */ _ensureSingleFrame),
/* harmony export */   _importAsLayer: () => (/* binding */ _importAsLayer),
/* harmony export */   _importFile: () => (/* binding */ _importFile),
/* harmony export */   _importPalette: () => (/* binding */ _importPalette),
/* harmony export */   _openFile: () => (/* binding */ _openFile),
/* harmony export */   _openFileElectron: () => (/* binding */ _openFileElectron),
/* harmony export */   _openInNewTab: () => (/* binding */ _openInNewTab),
/* harmony export */   _openTruecolorFile: () => (/* binding */ _openTruecolorFile),
/* harmony export */   _parseImageFile: () => (/* binding */ _parseImageFile),
/* harmony export */   _replaceDocument: () => (/* binding */ _replaceDocument),
/* harmony export */   _saveProject: () => (/* binding */ _saveProject),
/* harmony export */   _showExportDialog: () => (/* binding */ _showExportDialog),
/* harmony export */   _showPasteDitherDialog: () => (/* binding */ _showPasteDitherDialog),
/* harmony export */   _showQuantizeDialog: () => (/* binding */ _showQuantizeDialog),
/* harmony export */   _showTransparencyDialog: () => (/* binding */ _showTransparencyDialog)
/* harmony export */ });
/* harmony import */ var _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./model/ImageDocument.js */ "./js/model/ImageDocument.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
/* harmony import */ var _util_io_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./util/io.js */ "./js/util/io.js");
/* harmony import */ var _util_gif_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./util/gif.js */ "./js/util/gif.js");
/* harmony import */ var _util_spx_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./util/spx.js */ "./js/util/spx.js");
/* harmony import */ var _util_quantize_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./util/quantize.js */ "./js/util/quantize.js");
/* harmony import */ var _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/dialogHelpers.js */ "./js/ui/dialogHelpers.js");
/* harmony import */ var _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ui/Dialog.js */ "./js/ui/Dialog.js");









/**
 * File I/O, import/export, and quantization dialogs.
 * Methods are mixed into App.prototype — `this` refers to the App instance.
 */

function _saveProject() {
    if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
    const tab = this._getActiveTab();
    const filename = (tab ? tab.name : 'untitled') + '.pix8';
    const blob = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.savePix8)(this.doc);
    (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, filename);
}

function _openFile() {
    if (window.electronAPI) {
        this._openFileElectron();
        return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pix8,.bmp,.pcx,.png,.jpg,.jpeg,.gif,.webp';
    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();

        // Truecolor image formats — decode via canvas, then quantize
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
            this._openTruecolorFile(file);
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                let newDoc;
                if (ext === 'pix8') {
                    newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.loadPix8)(reader.result);
                } else if (ext === 'bmp') {
                    newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importBMP)(reader.result);
                } else if (ext === 'pcx') {
                    newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importPCX)(reader.result);
                } else {
                    this._showToast('Unsupported file format');
                    return;
                }
                this._openInNewTab(file.name, newDoc);
            } catch (err) {
                this._showToast('Error loading file: ' + err.message, 3000);
            }
        };
        reader.readAsArrayBuffer(file);
    });
    input.click();
}

async function _openFileElectron() {
    const result = await window.electronAPI.showOpenDialog({
        filters: [
            { name: 'All Supported', extensions: ['pix8', 'bmp', 'pcx', 'png', 'jpg', 'jpeg', 'gif', 'webp'] },
            { name: 'Pix8 Projects', extensions: ['pix8'] },
            { name: 'Images', extensions: ['bmp', 'pcx', 'png', 'jpg', 'jpeg', 'gif', 'webp'] },
        ],
    });
    if (!result) return;
    const ext = result.fileName.split('.').pop().toLowerCase();

    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        // Truecolor — decode via Image + canvas
        const blob = new Blob([new Uint8Array(result.data)]);
        const bitmap = await createImageBitmap(blob);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._showQuantizeDialog(imageData.data, canvas.width, canvas.height, (newDoc) => {
            this._openInNewTab(result.fileName, newDoc);
        });
        return;
    }

    try {
        let newDoc;
        const arrayBuffer = result.data instanceof ArrayBuffer ? result.data : new Uint8Array(result.data).buffer;
        if (ext === 'pix8') {
            newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.loadPix8)(arrayBuffer);
        } else if (ext === 'bmp') {
            newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importBMP)(arrayBuffer);
        } else if (ext === 'pcx') {
            newDoc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importPCX)(arrayBuffer);
        } else {
            this._showToast('Unsupported file format');
            return;
        }
        this._openInNewTab(result.fileName, newDoc);
    } catch (err) {
        this._showToast('Error loading file: ' + err.message, 3000);
    }
}

function _openInNewTab(filename, newDoc) {
    this._saveTabState();
    this.doc = newDoc;
    this._setDocOnComponents(newDoc);
    this.undoManager.undoStack = [];
    this.undoManager.redoStack = [];
    this._clipboard = null;
    this.canvasView.offscreen.width = newDoc.width;
    this.canvasView.offscreen.height = newDoc.height;
    this.canvasView.renderer = new (this.canvasView.renderer.constructor)(this.doc);
    this.canvasView._centerDocument();
    const name = filename.replace(/\.[^.]+$/, '');
    this._createTab(name);
    if (newDoc.animationEnabled) {
        this.framePanel.show();
    } else {
        this.framePanel.hide();
    }
    this.bus.emit('palette-changed');
    this.bus.emit('fg-color-changed');
    this.bus.emit('bg-color-changed');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
    document.getElementById('status-size').textContent = `${newDoc.width} x ${newDoc.height}`;
}

async function _openTruecolorFile(file) {
    try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this._showQuantizeDialog(imageData.data, canvas.width, canvas.height, (doc) => {
            this._openInNewTab(file.name, doc);
        });
    } catch {
        this._showToast('Error loading image file', 3000);
    }
}

function _showQuantizeDialog(rgbaData, width, height, callback) {
    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_7__["default"].create({
        title: 'Import Image',
        buttons: [
            { label: 'Cancel' },
            { label: 'OK', primary: true, onClick: () => {
                const okBtn = dlg.getButton(1);
                const cancelBtn = dlg.getButton(0);
                okBtn.disabled = true;
                cancelBtn.disabled = true;
                info.textContent = 'Converting, please wait...';
                setTimeout(() => {
                    const numColors = Math.max(1, Math.min(256, parseInt(colorsInput.value) || 256));
                    const ditherMode = ditherSelect.value;
                    const result = (0,_util_quantize_js__WEBPACK_IMPORTED_MODULE_5__.quantizeImage)(rgbaData, width, height, numColors, ditherMode);

                    const doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__.ImageDocument(width, height);
                    for (let i = 0; i < 256; i++) {
                        if (i < result.palette.length) {
                            doc.palette.setColor(i, ...result.palette[i]);
                        } else {
                            doc.palette.setColor(i, 0, 0, 0);
                        }
                    }
                    const layer = doc.getActiveLayer();
                    layer.data.set(result.indices);
                    dlg.close();
                    callback(doc);
                }, 16);
            }},
        ],
    });

    const body = dlg.body;

    const info = document.createElement('div');
    info.style.cssText = 'font-size:12px;color:var(--text-dim);margin-bottom:8px;';
    info.textContent = `Image: ${width} \u00D7 ${height} pixels`;
    body.appendChild(info);

    const colorsRow = document.createElement('div');
    colorsRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;';
    const colorsLabel = document.createElement('label');
    colorsLabel.textContent = 'Colors:';
    const colorsInput = document.createElement('input');
    colorsInput.type = 'number';
    colorsInput.min = 1;
    colorsInput.max = 256;
    colorsInput.value = 256;
    colorsInput.style.cssText = 'width:50px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;color:var(--text);padding:2px 4px;text-align:center;font-size:12px;';
    colorsRow.appendChild(colorsLabel);
    colorsRow.appendChild(colorsInput);
    body.appendChild(colorsRow);

    const { row: ditherRow, select: ditherSelect } = (0,_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.createDitherRow)();
    body.appendChild(ditherRow);

    dlg.show();
}

function _showPasteDitherDialog(rgbaData, width, height, callback) {
    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_7__["default"].create({
        title: 'Paste Image',
        buttons: [
            { label: 'Cancel' },
            { label: 'OK', primary: true, onClick: () => {
                const okBtn = dlg.getButton(1);
                const cancelBtn = dlg.getButton(0);
                okBtn.disabled = true;
                cancelBtn.disabled = true;
                info.textContent = 'Converting, please wait...';
                setTimeout(() => {
                    const palette = this.doc.palette.export();
                    const indices = (0,_util_quantize_js__WEBPACK_IMPORTED_MODULE_5__.mapToPalette)(rgbaData, width, height, palette, ditherSelect.value);
                    dlg.close();
                    callback(indices, width, height);
                }, 16);
            }},
        ],
    });

    const body = dlg.body;

    const info = document.createElement('div');
    info.style.cssText = 'font-size:12px;color:var(--text-dim);margin-bottom:8px;';
    info.textContent = `Image: ${width} \u00D7 ${height} pixels \u2014 mapping to current palette`;
    body.appendChild(info);

    const { row: ditherRow, select: ditherSelect } = (0,_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.createDitherRow)();
    body.appendChild(ditherRow);

    dlg.show();
}

function _replaceDocument(newDoc) {
    this.doc.width = newDoc.width;
    this.doc.height = newDoc.height;
    this.doc.layers = newDoc.layers;
    this.doc.activeLayerIndex = newDoc.activeLayerIndex;
    this.doc.palette = newDoc.palette;
    this.doc.fgColorIndex = newDoc.fgColorIndex;
    this.doc.bgColorIndex = newDoc.bgColorIndex;

    // Reset selection and layer selection for new document dimensions
    this.doc.selectedLayerIndices.clear();
    this.doc.selectedLayerIndices.add(this.doc.activeLayerIndex);
    this.doc.selection.resize(newDoc.width, newDoc.height);
    this.canvasView.stopMarchingAnts();

    // Recreate offscreen canvas
    this.canvasView.offscreen.width = newDoc.width;
    this.canvasView.offscreen.height = newDoc.height;
    this.canvasView.renderer = new (this.canvasView.renderer.constructor)(this.doc);
    this.canvasView._centerDocument();

    document.getElementById('status-size').textContent = `${newDoc.width} x ${newDoc.height}`;

    this.undoManager.undoStack = [];
    this.undoManager.redoStack = [];

    this.bus.emit('palette-changed');
    this.bus.emit('fg-color-changed');
    this.bus.emit('bg-color-changed');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _parseImageFile(file, callback, { askTransparency = true } = {}) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'bmp' && ext !== 'pcx') {
        this._showToast('Unsupported format. Use BMP or PCX files.');
        return;
    }
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const doc = ext === 'bmp' ? (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importBMP)(reader.result) : (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.importPCX)(reader.result);
            if (askTransparency) {
                this._showTransparencyDialog((zeroIsTransparent) => {
                    if (zeroIsTransparent) {
                        this._convertZeroToTransparent(doc);
                    }
                    callback(doc, file);
                });
            } else {
                callback(doc, file);
            }
        } catch (err) {
            this._showToast('Error importing file: ' + err.message, 3000);
        }
    };
    reader.readAsArrayBuffer(file);
}

function _convertZeroToTransparent(doc) {
    for (const layer of doc.layers) {
        for (let i = 0; i < layer.data.length; i++) {
            if (layer.data[i] === 0) layer.data[i] = _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT;
        }
    }
}

function _showTransparencyDialog(callback) {
    const lastChoice = localStorage.getItem('pix8-zero-transparent') ?? 'no';
    let result = lastChoice === 'yes';

    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_7__["default"].create({
        title: 'Treat index 0 as transparent?',
        width: '300px',
        buttons: [
            { label: 'Yes', primary: lastChoice === 'yes', onClick: () => { result = true; dlg.close(); } },
            { label: 'No', primary: lastChoice === 'no', onClick: () => { result = false; dlg.close(); } },
        ],
        enterButton: lastChoice === 'yes' ? 0 : 1,
        onClose: () => {
            localStorage.setItem('pix8-zero-transparent', result ? 'yes' : 'no');
            callback(result);
        },
    });

    dlg.body.innerHTML = `
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
            If yes, all pixels with palette index 0 will become transparent.
        </div>
    `;

    dlg.show(dlg.getButton(lastChoice === 'yes' ? 0 : 1));
}

function _importFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bmp,.pcx';
    input.addEventListener('change', () => {
        if (!input.files[0]) return;
        this._parseImageFile(input.files[0], (newDoc) => {
            this._replaceDocument(newDoc);
        });
    });
    input.click();
}

function _importAsLayer() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bmp,.pcx';
    input.addEventListener('change', () => {
        if (!input.files[0]) return;
        this._parseImageFile(input.files[0], (tempDoc, file) => {
            const before = this._snapshotLayerMeta();
            if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
            const importedLayer = tempDoc.getActiveLayer();
            const layerName = file.name.replace(/\.[^.]+$/, '');
            const newLayer = this.doc.addLayer(layerName);
            newLayer.data = importedLayer.data;
            newLayer.width = importedLayer.width;
            newLayer.height = importedLayer.height;
            newLayer.offsetX = importedLayer.offsetX;
            newLayer.offsetY = importedLayer.offsetY;
            if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
            const after = this._snapshotLayerMeta();
            this._pushLayerAddEntry(newLayer, this.doc.activeLayerIndex, before, after);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        });
    });
    input.click();
}

function _importPalette() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bmp,.pcx';
    input.addEventListener('change', () => {
        if (!input.files[0]) return;
        this._parseImageFile(input.files[0], (tempDoc) => {
            this.doc.palette.import(tempDoc.palette.export());
            this.bus.emit('palette-changed');
            this.bus.emit('fg-color-changed');
            this.bus.emit('bg-color-changed');
            this.bus.emit('document-changed');
        }, { askTransparency: false });
    });
    input.click();
}

function _showExportDialog() {
    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_7__["default"].create({
        title: 'Export as...',
        width: '320px',
        buttons: [
            { label: 'Cancel' },
            { label: 'Export', primary: true, onClick: async () => {
                const format = formatSelect.value;
                dlg.close();
                switch (format) {
                    case 'bmp': {
                        const blob = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.exportBMP)(this.doc);
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, 'export.bmp');
                        break;
                    }
                    case 'pcx': {
                        const blob = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.exportPCX)(this.doc);
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, 'export.pcx');
                        break;
                    }
                    case 'png': {
                        const blob = await (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.exportPNG)(this.doc, this.canvasView.renderer);
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, 'export.png');
                        break;
                    }
                    case 'gif': {
                        const wasAnimated = this.doc.animationEnabled;
                        if (!wasAnimated) this._ensureSingleFrame();
                        else this.doc.saveCurrentFrame();
                        const scale = parseInt(scaleSelect.value) || 1;
                        const loopCount = parseInt(loopSelect.value) || 0;
                        const sel = framesSelect.value;
                        const frameIndices = sel === 'all' ? null : tagGroups.find(g => g.tag === sel)?.indices;
                        const filename = sel === 'all' ? 'export.gif' : `${sel}.gif`;
                        const blob = (0,_util_gif_js__WEBPACK_IMPORTED_MODULE_3__.exportGIF)(this.doc, { scale, loopCount, frameIndices });
                        if (!wasAnimated) this._clearTempFrame();
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, filename);
                        break;
                    }
                    case 'spx': {
                        const wasAnimated = this.doc.animationEnabled;
                        if (!wasAnimated) this._ensureSingleFrame();
                        else this.doc.saveCurrentFrame();
                        const spriteName = nameInput.value.trim() || defaultName;
                        const zipBlob = await (0,_util_spx_js__WEBPACK_IMPORTED_MODULE_4__.exportSPXZip)(this.doc, { name: spriteName });
                        if (!wasAnimated) this._clearTempFrame();
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(zipBlob, spriteName + '.zip');
                        break;
                    }
                    case 'ico': {
                        const selected = [];
                        for (const cb of icoOptions.querySelectorAll('input[type="checkbox"]')) {
                            if (cb.checked) selected.push(parseInt(cb.dataset.layerIndex));
                        }
                        if (selected.length === 0) break;
                        const blob = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.exportICO)(this.doc, selected);
                        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.downloadBlob)(blob, 'export.ico');
                        break;
                    }
                }
            }},
        ],
        enterButton: 1,
    });

    const body = dlg.body;
    body.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 0;';

    const labelStyle = 'font-size:13px;color:var(--text);width:60px;';
    const selectStyle = 'flex:1;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;';

    // Format selector
    const formatRow = document.createElement('div');
    formatRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.ROW_STYLE;
    const formatLabel = document.createElement('label');
    formatLabel.textContent = 'Format:';
    formatLabel.style.cssText = labelStyle;
    const formatSelect = document.createElement('select');
    formatSelect.style.cssText = selectStyle;
    const icoLayers = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_2__.getValidICOLayers)(this.doc);
    const formats = [
        { value: 'png', label: 'PNG' },
        { value: 'bmp', label: 'BMP (8-bit indexed)' },
        { value: 'pcx', label: 'PCX (8-bit indexed)' },
        { value: 'gif', label: 'GIF' },
        { value: 'spx', label: 'SPX (sprite sheet)' },
        { value: 'ico', label: 'ICO (Windows icon)' },
    ];
    for (const f of formats) {
        const opt = document.createElement('option');
        opt.value = f.value;
        opt.textContent = f.label;
        formatSelect.appendChild(opt);
    }
    formatRow.appendChild(formatLabel);
    formatRow.appendChild(formatSelect);
    body.appendChild(formatRow);

    // ── GIF options ──────────────────────────────────────────────
    const gifOptions = document.createElement('div');
    gifOptions.style.cssText = 'display:none;flex-direction:column;gap:8px;';

    // Collect tag groups
    const frames = this.doc.frames || [];
    const tagGroups = [];
    for (let i = 0; i < frames.length; i++) {
        if (frames[i].tag) tagGroups.push({ tag: frames[i].tag, start: i });
    }
    for (let g = 0; g < tagGroups.length; g++) {
        const nextStart = g + 1 < tagGroups.length ? tagGroups[g + 1].start : frames.length;
        const indices = [];
        for (let i = tagGroups[g].start; i < nextStart; i++) indices.push(i);
        tagGroups[g].indices = indices;
    }

    // Frames selector (only shown when animation is enabled)
    const framesRow = document.createElement('div');
    framesRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.ROW_STYLE + (this.doc.animationEnabled ? '' : 'display:none;');
    const framesLabel = document.createElement('label');
    framesLabel.textContent = 'Frames:';
    framesLabel.style.cssText = labelStyle;
    const framesSelect = document.createElement('select');
    framesSelect.style.cssText = selectStyle;
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = `All frames (${frames.length})`;
    framesSelect.appendChild(allOpt);
    for (const g of tagGroups) {
        const opt = document.createElement('option');
        opt.value = g.tag;
        opt.textContent = `${g.tag} (${g.indices.length} frames)`;
        framesSelect.appendChild(opt);
    }
    framesRow.appendChild(framesLabel);
    framesRow.appendChild(framesSelect);
    gifOptions.appendChild(framesRow);

    // Scale
    const scaleRow = document.createElement('div');
    scaleRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.ROW_STYLE;
    const scaleLabel = document.createElement('label');
    scaleLabel.textContent = 'Scale:';
    scaleLabel.style.cssText = labelStyle;
    const scaleSelect = document.createElement('select');
    scaleSelect.style.cssText = selectStyle;
    for (const s of [1, 2, 3, 4, 5, 8, 10]) {
        const opt = document.createElement('option');
        opt.value = s;
        opt.textContent = `${s}x (${this.doc.width * s} \u00D7 ${this.doc.height * s})`;
        scaleSelect.appendChild(opt);
    }
    scaleRow.appendChild(scaleLabel);
    scaleRow.appendChild(scaleSelect);
    gifOptions.appendChild(scaleRow);

    // Loop (only shown when animation is enabled)
    const loopRow = document.createElement('div');
    loopRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.ROW_STYLE + (this.doc.animationEnabled ? '' : 'display:none;');
    const loopLabel = document.createElement('label');
    loopLabel.textContent = 'Loop:';
    loopLabel.style.cssText = labelStyle;
    const loopSelect = document.createElement('select');
    loopSelect.style.cssText = selectStyle;
    for (const [val, label] of [[0, 'Infinite'], [1, 'Once'], [2, '2 times'], [3, '3 times'], [5, '5 times']]) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        loopSelect.appendChild(opt);
    }
    loopRow.appendChild(loopLabel);
    loopRow.appendChild(loopSelect);
    gifOptions.appendChild(loopRow);

    // GIF info (only shown when animation is enabled)
    const gifInfo = document.createElement('div');
    gifInfo.style.cssText = 'font-size:11px;color:var(--text-dim);' + (this.doc.animationEnabled ? '' : 'display:none;');
    const updateGifInfo = () => {
        const sel = framesSelect.value;
        const count = sel === 'all' ? frames.length : tagGroups.find(g => g.tag === sel)?.indices.length || 0;
        gifInfo.textContent = `${count} frame${count !== 1 ? 's' : ''} will be exported`;
    };
    updateGifInfo();
    framesSelect.addEventListener('change', updateGifInfo);
    gifOptions.appendChild(gifInfo);

    body.appendChild(gifOptions);

    // ── SPX options ──────────────────────────────────────────────
    const spxOptions = document.createElement('div');
    spxOptions.style.cssText = 'display:none;flex-direction:column;gap:8px;';

    const tab = this._tabs.find(t => t.id === this._activeTabId);
    const defaultName = tab ? tab.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase() : 'sprite';

    const nameRow = document.createElement('div');
    nameRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_6__.ROW_STYLE;
    const nameLabel = document.createElement('label');
    nameLabel.textContent = 'Name:';
    nameLabel.style.cssText = labelStyle;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = defaultName;
    nameInput.style.cssText = selectStyle;
    nameRow.appendChild(nameLabel);
    nameRow.appendChild(nameInput);
    spxOptions.appendChild(nameRow);

    const spxInfo = document.createElement('div');
    spxInfo.style.cssText = 'font-size:11px;color:var(--text-dim);';
    const groups = new Set();
    for (const f of frames) { if (f.tag) groups.add(f.tag); }
    spxInfo.textContent = `${frames.length} frames, ${groups.size || 1} sprite${groups.size > 1 ? 's' : ''} \u2022 ${this.doc.width}\u00D7${this.doc.height}px`;
    spxOptions.appendChild(spxInfo);

    body.appendChild(spxOptions);

    // ── ICO options ─────────────────────────────────────────────
    const icoOptions = document.createElement('div');
    icoOptions.style.cssText = 'display:none;flex-direction:column;gap:4px;';

    if (icoLayers.length === 0) {
        const noLayers = document.createElement('div');
        noLayers.style.cssText = 'font-size:12px;color:var(--text-dim);padding:4px 0;';
        noLayers.textContent = 'No valid ICO layers. Use Layer \u203A Set Fixed Size to create square layers at standard icon sizes (16, 24, 32, 48, 64, 128, 256).';
        icoOptions.appendChild(noLayers);
    } else {
        const icoLabel = document.createElement('div');
        icoLabel.style.cssText = 'font-size:12px;color:var(--text-dim);';
        icoLabel.textContent = 'Include layers:';
        icoOptions.appendChild(icoLabel);
        for (const entry of icoLayers) {
            const row = document.createElement('label');
            row.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:13px;color:var(--text);cursor:pointer;padding:2px 0;';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.dataset.layerIndex = entry.index;
            cb.style.cssText = 'accent-color:var(--accent);';
            row.appendChild(cb);
            const label = document.createElement('span');
            label.textContent = `${entry.layer.name} \u2014 ${entry.size}\u00D7${entry.size}`;
            row.appendChild(label);
            icoOptions.appendChild(row);
        }
    }

    body.appendChild(icoOptions);

    // Format change handler
    formatSelect.addEventListener('change', () => {
        gifOptions.style.display = formatSelect.value === 'gif' ? 'flex' : 'none';
        spxOptions.style.display = formatSelect.value === 'spx' ? 'flex' : 'none';
        icoOptions.style.display = formatSelect.value === 'ico' ? 'flex' : 'none';
    });

    dlg.show();
}

function _ensureSingleFrame() {
    this.doc.animationEnabled = true;
    this.doc.activeFrameIndex = 0;
    this.doc.frames = [{
        tag: '',
        delay: 100,
        layerData: this.doc.layers.map(l => ({
            data: l.data.slice(),
            opacity: l.opacity,
            textData: l.textData ? { ...l.textData } : null,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            width: l.width,
            height: l.height,
        })),
    }];
}

function _clearTempFrame() {
    this.doc.animationEnabled = false;
    this.doc.frames = [];
    this.doc.activeFrameIndex = 0;
}


/***/ },

/***/ "./js/ImageOperations.js"
/*!*******************************!*\
  !*** ./js/ImageOperations.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _applyExpandShrink: () => (/* binding */ _applyExpandShrink),
/* harmony export */   _applyResize: () => (/* binding */ _applyResize),
/* harmony export */   _cropLayerToCanvas: () => (/* binding */ _cropLayerToCanvas),
/* harmony export */   _expandShrinkSelection: () => (/* binding */ _expandShrinkSelection),
/* harmony export */   _invertSelection: () => (/* binding */ _invertSelection),
/* harmony export */   _mergeSelectedLayers: () => (/* binding */ _mergeSelectedLayers),
/* harmony export */   _removeFixedSize: () => (/* binding */ _removeFixedSize),
/* harmony export */   _rotateImage: () => (/* binding */ _rotateImage),
/* harmony export */   _selectByAlpha: () => (/* binding */ _selectByAlpha),
/* harmony export */   _setFixedSize: () => (/* binding */ _setFixedSize),
/* harmony export */   _showResizeDialog: () => (/* binding */ _showResizeDialog),
/* harmony export */   _trimLayerToContent: () => (/* binding */ _trimLayerToContent)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
/* harmony import */ var _model_Layer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/Layer.js */ "./js/model/Layer.js");
/* harmony import */ var _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ui/dialogHelpers.js */ "./js/ui/dialogHelpers.js");
/* harmony import */ var _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ui/Dialog.js */ "./js/ui/Dialog.js");





/**
 * Image and layer manipulation operations (rotate, resize, crop, trim, merge, selection ops).
 * Methods are mixed into App.prototype — `this` refers to the App instance.
 */

function _rotateImage(clockwise) {
    const doc = this.doc;
    const oldW = doc.width;
    const oldH = doc.height;

    // Snapshot all layers before rotation
    const beforeLayers = doc.layers.map(l => ({
        data: l.snapshotData(),
        geometry: l.snapshotGeometry(),
    }));
    const beforeSelection = doc.selection.snapshot();

    for (const layer of doc.layers) {
        const { width: lw, height: lh, data, offsetX, offsetY } = layer;
        const newLW = lh;
        const newLH = lw;
        const newData = new Uint16Array(newLW * newLH);
        newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

        for (let row = 0; row < lh; row++) {
            for (let col = 0; col < lw; col++) {
                const px = data[row * lw + col];
                let newCol, newRow;
                if (clockwise) {
                    newCol = lh - 1 - row;
                    newRow = col;
                } else {
                    newCol = row;
                    newRow = lw - 1 - col;
                }
                newData[newRow * newLW + newCol] = px;
            }
        }

        let newOffX, newOffY;
        if (clockwise) {
            newOffX = oldH - 1 - (offsetY + lh - 1);
            newOffY = offsetX;
        } else {
            newOffX = offsetY;
            newOffY = oldW - 1 - (offsetX + lw - 1);
        }

        layer.data = newData;
        layer.width = newLW;
        layer.height = newLH;
        layer.offsetX = newOffX;
        layer.offsetY = newOffY;
    }

    doc.width = oldH;
    doc.height = oldW;

    // Apply same rotation to all animation frames
    if (doc.animationEnabled) {
        doc.saveCurrentFrame();
        for (const frame of doc.frames) {
            if (!frame.layerData) continue;
            for (const ld of frame.layerData) {
                const { width: lw, height: lh, data, offsetX, offsetY } = ld;
                const newLW = lh;
                const newLH = lw;
                const newData = new Uint16Array(newLW * newLH);
                newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
                for (let row = 0; row < lh; row++) {
                    for (let col = 0; col < lw; col++) {
                        const px = data[row * lw + col];
                        let newCol, newRow;
                        if (clockwise) {
                            newCol = lh - 1 - row;
                            newRow = col;
                        } else {
                            newCol = row;
                            newRow = lw - 1 - col;
                        }
                        newData[newRow * newLW + newCol] = px;
                    }
                }
                ld.data = newData;
                ld.width = newLW;
                ld.height = newLH;
                if (clockwise) {
                    ld.offsetX = oldH - 1 - (offsetY + lh - 1);
                    ld.offsetY = offsetX;
                } else {
                    ld.offsetX = offsetY;
                    ld.offsetY = oldW - 1 - (offsetX + lw - 1);
                }
            }
        }
        doc.loadFrame(doc.activeFrameIndex);
    }

    doc.selection.resize(oldH, oldW);

    // Snapshot all layers after rotation
    const afterLayers = doc.layers.map(l => ({
        data: l.snapshotData(),
        geometry: l.snapshotGeometry(),
    }));
    const afterSelection = doc.selection.snapshot();

    this.undoManager.undoStack.push({
        type: 'resize',
        beforeDocSize: { width: oldW, height: oldH },
        afterDocSize: { width: oldH, height: oldW },
        beforeLayers,
        afterLayers,
        beforeSelection,
        afterSelection,
    });
    this.undoManager.redoStack = [];

    document.getElementById('status-size').textContent = `${doc.width} x ${doc.height}`;
    this.bus.emit('selection-changed');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _showResizeDialog() {
    const origW = this.doc.width;
    const origH = this.doc.height;
    const aspect = origW / origH;

    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_3__["default"].create({
        title: 'Resize Image',
        width: '300px',
        buttons: [
            { label: 'Cancel' },
            { label: 'Resize', primary: true, onClick: () => {
                const newW = Math.max(1, Math.min(4096, parseInt(wInput.value) || origW));
                const newH = Math.max(1, Math.min(4096, parseInt(hInput.value) || origH));
                if (newW === origW && newH === origH) { dlg.close(); return; }
                const contentCheck = dlg.body.querySelector('#resize-content');
                const anchor = dlg.body.querySelector('input[name="resize-anchor"]:checked').value;
                dlg.close();
                this._applyResize(newW, newH, contentCheck.checked, anchor);
            }},
        ],
        enterButton: 1,
    });

    const checkStyle = 'margin-right:8px;accent-color:var(--accent);';

    dlg.body.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:8px 0;';
    dlg.body.innerHTML = `
        <div>
            <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Width (px)</label>
            <input id="resize-w" type="number" value="${origW}" min="1" max="4096" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.INPUT_STYLE}">
        </div>
        <div>
            <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Height (px)</label>
            <input id="resize-h" type="number" value="${origH}" min="1" max="4096" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.INPUT_STYLE}">
        </div>
        <div>
            <label style="font-size:13px;color:var(--text);cursor:pointer;">
                <input id="resize-aspect" type="checkbox" style="${checkStyle}">Keep aspect ratio
            </label>
        </div>
        <div>
            <label style="font-size:13px;color:var(--text);cursor:pointer;">
                <input id="resize-content" type="checkbox" style="${checkStyle}">Resize content
            </label>
        </div>
        <div id="resize-anchor-group">
            <label style="display:block;font-size:12px;margin-bottom:6px;color:var(--text-dim);">Anchor</label>
            <div style="display:inline-grid;grid-template-columns:repeat(3,24px);gap:2px;">
                ${['nw','n','ne','w','c','e','sw','s','se'].map(id =>
                    `<label style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;
                        background:var(--bg-input);border:1px solid var(--border);border-radius:3px;cursor:pointer;">
                        <input type="radio" name="resize-anchor" value="${id}"${id === 'nw' ? ' checked' : ''}
                            style="margin:0;accent-color:var(--accent);">
                    </label>`
                ).join('')}
            </div>
        </div>
    `;

    const wInput = dlg.body.querySelector('#resize-w');
    const hInput = dlg.body.querySelector('#resize-h');
    const aspectCheck = dlg.body.querySelector('#resize-aspect');
    const contentCheck = dlg.body.querySelector('#resize-content');
    const anchorGroup = dlg.body.querySelector('#resize-anchor-group');

    // Show/hide anchor based on "resize content" toggle
    const updateAnchorVisibility = () => {
        anchorGroup.style.display = contentCheck.checked ? 'none' : '';
    };
    contentCheck.addEventListener('change', updateAnchorVisibility);
    updateAnchorVisibility();

    wInput.addEventListener('input', () => {
        if (aspectCheck.checked) {
            hInput.value = Math.round(parseInt(wInput.value) / aspect) || 1;
        }
    });
    hInput.addEventListener('input', () => {
        if (aspectCheck.checked) {
            wInput.value = Math.round(parseInt(hInput.value) * aspect) || 1;
        }
    });

    dlg.show(wInput);
}

function _applyResize(newW, newH, resizeContent, anchor = 'nw') {
    const doc = this.doc;
    const oldW = doc.width;
    const oldH = doc.height;

    // Snapshot all layers for undo
    const beforeLayers = doc.layers.map(l => ({
        data: l.snapshotData(),
        geometry: l.snapshotGeometry(),
    }));
    const beforeSelection = doc.selection.snapshot();
    const beforeDocSize = { width: oldW, height: oldH };

    // Clear selection
    if (doc.selection.active) {
        if (doc.selection.hasFloating()) {
            doc.selection.commitFloating(doc.getActiveLayer());
        }
        doc.selection.clear();
    }

    // Resize document dimensions
    doc.width = newW;
    doc.height = newH;

    if (resizeContent) {
        // Scale each layer's pixel data
        const sx = newW / oldW;
        const sy = newH / oldH;
        for (const layer of doc.layers) {
            const newLayerW = Math.max(1, Math.round(layer.width * sx));
            const newLayerH = Math.max(1, Math.round(layer.height * sy));
            const newData = new Uint16Array(newLayerW * newLayerH);
            newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
            for (let y = 0; y < newLayerH; y++) {
                for (let x = 0; x < newLayerW; x++) {
                    const srcX = Math.floor(x / sx);
                    const srcY = Math.floor(y / sy);
                    if (srcX < layer.width && srcY < layer.height) {
                        newData[y * newLayerW + x] = layer.data[srcY * layer.width + srcX];
                    }
                }
            }
            layer.data = newData;
            layer.width = newLayerW;
            layer.height = newLayerH;
            layer.offsetX = Math.round(layer.offsetX * sx);
            layer.offsetY = Math.round(layer.offsetY * sy);
        }
    } else {
        // Shift layers based on anchor point
        const dx = anchor.includes('w') ? 0 : anchor.includes('e') ? newW - oldW : Math.round((newW - oldW) / 2);
        const dy = anchor.includes('n') ? 0 : anchor.includes('s') ? newH - oldH : Math.round((newH - oldH) / 2);
        if (dx !== 0 || dy !== 0) {
            for (const layer of doc.layers) {
                layer.offsetX += dx;
                layer.offsetY += dy;
            }
        }
    }

    // Apply same resize to all animation frames
    if (doc.animationEnabled) {
        doc.saveCurrentFrame();
        for (const frame of doc.frames) {
            if (!frame.layerData) continue;
            for (const ld of frame.layerData) {
                if (resizeContent) {
                    const sx = newW / oldW;
                    const sy = newH / oldH;
                    const newLayerW = Math.max(1, Math.round(ld.width * sx));
                    const newLayerH = Math.max(1, Math.round(ld.height * sy));
                    const newData = new Uint16Array(newLayerW * newLayerH);
                    newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
                    for (let y = 0; y < newLayerH; y++) {
                        for (let x = 0; x < newLayerW; x++) {
                            const srcX = Math.floor(x / sx);
                            const srcY = Math.floor(y / sy);
                            if (srcX < ld.width && srcY < ld.height) {
                                newData[y * newLayerW + x] = ld.data[srcY * ld.width + srcX];
                            }
                        }
                    }
                    ld.data = newData;
                    ld.width = newLayerW;
                    ld.height = newLayerH;
                    ld.offsetX = Math.round(ld.offsetX * sx);
                    ld.offsetY = Math.round(ld.offsetY * sy);
                } else {
                    const dx = anchor.includes('w') ? 0 : anchor.includes('e') ? newW - oldW : Math.round((newW - oldW) / 2);
                    const dy = anchor.includes('n') ? 0 : anchor.includes('s') ? newH - oldH : Math.round((newH - oldH) / 2);
                    ld.offsetX += dx;
                    ld.offsetY += dy;
                }
            }
        }
        doc.loadFrame(doc.activeFrameIndex);
    }

    // Resize selection mask
    doc.selection.resize(newW, newH);

    // Snapshot after for undo
    const afterLayers = doc.layers.map(l => ({
        data: l.snapshotData(),
        geometry: l.snapshotGeometry(),
    }));
    const afterSelection = doc.selection.snapshot();

    // Push a custom undo entry for the full resize
    this.undoManager.undoStack.push({
        type: 'resize',
        beforeDocSize,
        afterDocSize: { width: newW, height: newH },
        beforeLayers,
        afterLayers,
        beforeSelection,
        afterSelection,
    });
    this.undoManager.redoStack = [];

    // Update status bar and re-render
    document.getElementById('status-size').textContent = `${newW} x ${newH}`;
    this.bus.emit('selection-changed');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _trimLayerToContent() {
    const layer = this.doc.getActiveLayer();
    if (!layer || layer.type === 'text') return;
    const bounds = layer.getContentBounds();
    if (!bounds) {
        this._showStatus('Layer is empty');
        return;
    }
    // Convert doc-space bounds to layer-local
    const lx = bounds.left - layer.offsetX;
    const ly = bounds.top - layer.offsetY;
    const lw = bounds.right - bounds.left;
    const lh = bounds.bottom - bounds.top;
    // Skip if already trimmed
    if (lx === 0 && ly === 0 && lw === layer.width && lh === layer.height) {
        this._showStatus('Layer already trimmed');
        return;
    }
    this.undoManager.beginOperation();
    const newData = new Uint16Array(lw * lh);
    for (let y = 0; y < lh; y++) {
        for (let x = 0; x < lw; x++) {
            newData[y * lw + x] = layer.data[(ly + y) * layer.width + (lx + x)];
        }
    }
    layer.data = newData;
    layer.offsetX = bounds.left;
    layer.offsetY = bounds.top;
    layer.width = lw;
    layer.height = lh;
    this.undoManager.endOperation();
    this._showToast('Trimmed');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _cropLayerToCanvas() {
    const layer = this.doc.getActiveLayer();
    if (!layer || layer.type === 'text') return;
    const docW = this.doc.width;
    const docH = this.doc.height;
    // Intersection of layer rect with document rect
    const cx0 = Math.max(0, layer.offsetX);
    const cy0 = Math.max(0, layer.offsetY);
    const cx1 = Math.min(docW, layer.offsetX + layer.width);
    const cy1 = Math.min(docH, layer.offsetY + layer.height);
    const cw = cx1 - cx0;
    const ch = cy1 - cy0;
    if (cw <= 0 || ch <= 0) {
        this._showToast('Layer is outside canvas');
        return;
    }
    if (cx0 === layer.offsetX && cy0 === layer.offsetY && cw === layer.width && ch === layer.height) {
        this._showToast('Layer already fits canvas');
        return;
    }
    this.undoManager.beginOperation();
    const newData = new Uint16Array(cw * ch);
    for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
            const lx = (cx0 - layer.offsetX) + x;
            const ly = (cy0 - layer.offsetY) + y;
            newData[y * cw + x] = layer.data[ly * layer.width + lx];
        }
    }
    layer.data = newData;
    layer.offsetX = cx0;
    layer.offsetY = cy0;
    layer.width = cw;
    layer.height = ch;
    this.undoManager.endOperation();
    this._showToast('Cropped to canvas');
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _mergeSelectedLayers() {
    const doc = this.doc;
    const sel = doc.selectedLayerIndices;
    if (sel.size < 2) return;

    // Snapshot before state for undo
    if (doc.animationEnabled) doc.saveCurrentFrame();
    const beforeLayers = doc.layers.map(l => l.clone(true));
    const beforeActiveIndex = doc.activeLayerIndex;
    const beforeSelected = new Set(sel);
    const beforeFrames = doc.animationEnabled ? doc.frames.map(f => ({
        ...f,
        layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
    })) : null;

    const indices = [...sel].sort((a, b) => a - b);

    // Helper: composite layer data entries into a single pixel buffer
    const compositeLayers = (layerEntries) => {
        const data = new Uint16Array(doc.width * doc.height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
        for (const ld of layerEntries) {
            if (!ld) continue;
            const lx0 = Math.max(0, ld.offsetX);
            const ly0 = Math.max(0, ld.offsetY);
            const lx1 = Math.min(doc.width, ld.offsetX + ld.width);
            const ly1 = Math.min(doc.height, ld.offsetY + ld.height);
            for (let dy = ly0; dy < ly1; dy++) {
                for (let dx = lx0; dx < lx1; dx++) {
                    const val = ld.data[(dy - ld.offsetY) * ld.width + (dx - ld.offsetX)];
                    if (val !== _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) {
                        data[dy * doc.width + dx] = val;
                    }
                }
            }
        }
        return data;
    };

    // Composite current (live) layers for the merged result
    const merged = new _model_Layer_js__WEBPACK_IMPORTED_MODULE_1__.Layer('Merged', doc.width, doc.height);
    const liveEntries = indices.filter(i => doc.layers[i].visible).map(i => doc.layers[i]);
    merged.data = compositeLayers(liveEntries);

    // For animation: composite per-frame before removing layers
    let perFrameMerged = null;
    if (doc.animationEnabled) {
        perFrameMerged = doc.frames.map(frame => {
            if (!frame.layerData) return null;
            const entries = indices.filter(i => doc.layers[i].visible).map(i => frame.layerData[i]);
            return compositeLayers(entries);
        });
    }

    // Remove selected layers (from highest index first) and insert merged
    const lowestIdx = indices[0];
    for (let i = indices.length - 1; i >= 0; i--) {
        doc.layers.splice(indices[i], 1);
        if (doc.animationEnabled) {
            for (const frame of doc.frames) {
                if (frame.layerData) frame.layerData.splice(indices[i], 1);
            }
        }
    }
    doc.layers.splice(lowestIdx, 0, merged);
    if (doc.animationEnabled) {
        for (let fi = 0; fi < doc.frames.length; fi++) {
            const frame = doc.frames[fi];
            if (frame.layerData) {
                frame.layerData.splice(lowestIdx, 0, {
                    data: perFrameMerged[fi] || new Uint16Array(doc.width * doc.height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT),
                    opacity: 1.0,
                    textData: null,
                    offsetX: 0,
                    offsetY: 0,
                    width: doc.width,
                    height: doc.height,
                });
            }
        }
        doc.saveCurrentFrame();
    }
    doc.activeLayerIndex = lowestIdx;
    sel.clear();
    sel.add(lowestIdx);

    // Snapshot after state and push undo entry
    const afterLayers = doc.layers.map(l => l.clone(true));
    const afterFrames = doc.animationEnabled ? doc.frames.map(f => ({
        ...f,
        layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
    })) : null;

    this.undoManager.pushEntry({
        type: 'merge-layers',
        beforeLayers,
        afterLayers,
        beforeActiveIndex,
        afterActiveIndex: lowestIdx,
        beforeSelected,
        afterSelected: new Set([lowestIdx]),
        beforeFrames,
        afterFrames,
    });

    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}

function _expandShrinkSelection(direction) {
    const label = direction > 0 ? 'Expand' : 'Shrink';
    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_3__["default"].create({
        title: `${label} Selection`,
        width: '250px',
        buttons: [
            { label: 'Cancel' },
            { label: 'OK', primary: true, onClick: () => {
                const amount = Math.max(1, parseInt(pxInput.value) || 1);
                dlg.close();
                this._applyExpandShrink(direction, amount);
            }},
        ],
        enterButton: 1,
    });
    dlg.body.style.cssText = 'padding:8px 0;';
    dlg.body.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;">
            <label>${label} by (px):</label>
            <input type="number" value="1" min="1" max="256" style="width:60px;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;text-align:center;">
        </div>
    `;
    const pxInput = dlg.body.querySelector('input');
    dlg.show(pxInput);
}

function _applyExpandShrink(direction, amount) {
    const sel = this.doc.selection;
    const { width, height, mask } = sel;
    const newMask = new Uint8Array(mask);

    for (let iter = 0; iter < amount; iter++) {
        const src = new Uint8Array(newMask);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = y * width + x;
                if (direction > 0) {
                    // Expand: if any neighbor is selected, select this pixel
                    if (src[i]) continue;
                    if ((x > 0 && src[i - 1]) || (x < width - 1 && src[i + 1]) ||
                        (y > 0 && src[i - width]) || (y < height - 1 && src[i + width])) {
                        newMask[i] = 1;
                    }
                } else {
                    // Shrink: if any neighbor is not selected, deselect this pixel
                    if (!src[i]) continue;
                    if (x === 0 || x === width - 1 || y === 0 || y === height - 1 ||
                        !src[i - 1] || !src[i + 1] || !src[i - width] || !src[i + width]) {
                        newMask[i] = 0;
                    }
                }
            }
        }
    }

    mask.set(newMask);
    sel._pureShape = null;
    this.bus.emit('selection-changed');
}

function _invertSelection() {
    const sel = this.doc.selection;
    if (!sel.active) {
        this._showToast('No selection');
        return;
    }
    if (sel.hasFloating()) {
        this.undoManager.beginOperation();
        sel.commitFloating(this.doc.getActiveLayer());
        this.undoManager.endOperation();
    }
    let anySelected = false;
    for (let i = 0; i < sel.mask.length; i++) {
        sel.mask[i] = sel.mask[i] ? 0 : 1;
        if (sel.mask[i]) anySelected = true;
    }
    sel._pureShape = null;
    sel._resizeSource = null;
    sel.active = anySelected;
    this.bus.emit('selection-changed');
}

function _selectByAlpha() {
    const layer = this.doc.getActiveLayer();
    const sel = this.doc.selection;
    if (sel.hasFloating()) sel.commitFloating(layer);
    sel.mask.fill(0);
    const { width, height } = sel;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const px = layer.getPixelDoc(x, y);
            if (px !== _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) {
                sel.mask[y * width + x] = 1;
            }
        }
    }
    sel.active = true;
    sel._pureShape = null;
    this.bus.emit('selection-changed');
}

function _setFixedSize() {
    const layer = this.doc.getActiveLayer();
    if (!layer || layer.type === 'text') return;

    const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_3__["default"].create({
        title: 'Set Fixed Size',
        width: '260px',
        buttons: [
            { label: 'Cancel' },
            { label: 'OK', primary: true, onClick: () => {
                const newW = Math.max(1, Math.min(4096, parseInt(wInput.value) || layer.width));
                const newH = Math.max(1, Math.min(4096, parseInt(hInput.value) || layer.height));
                dlg.close();
                this.undoManager.beginOperation();
                // Crop/extend layer to new size (top-left aligned)
                const newData = new Uint16Array(newW * newH);
                newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
                const copyW = Math.min(layer.width, newW);
                const copyH = Math.min(layer.height, newH);
                for (let y = 0; y < copyH; y++) {
                    for (let x = 0; x < copyW; x++) {
                        newData[y * newW + x] = layer.data[y * layer.width + x];
                    }
                }
                layer.data = newData;
                layer.width = newW;
                layer.height = newH;
                layer.isFixedSize = true;
                this.undoManager.endOperation();
                this.bus.emit('layer-changed');
                this.bus.emit('document-changed');
            }},
        ],
        enterButton: 1,
    });

    const body = dlg.body;
    body.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 0;';

    const wRow = document.createElement('div');
    wRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.ROW_STYLE;
    const wLabel = document.createElement('label');
    wLabel.textContent = 'Width:';
    wLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
    const wInput = document.createElement('input');
    wInput.type = 'number';
    wInput.value = layer.width;
    wInput.min = 1;
    wInput.max = 4096;
    wInput.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.INPUT_STYLE + 'width:80px;';
    wRow.appendChild(wLabel);
    wRow.appendChild(wInput);
    body.appendChild(wRow);

    const hRow = document.createElement('div');
    hRow.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.ROW_STYLE;
    const hLabel = document.createElement('label');
    hLabel.textContent = 'Height:';
    hLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
    const hInput = document.createElement('input');
    hInput.type = 'number';
    hInput.value = layer.height;
    hInput.min = 1;
    hInput.max = 4096;
    hInput.style.cssText = _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.INPUT_STYLE + 'width:80px;';
    hRow.appendChild(hLabel);
    hRow.appendChild(hInput);
    body.appendChild(hRow);

    dlg.show(wInput);
}

function _removeFixedSize() {
    const layer = this.doc.getActiveLayer();
    if (!layer || !layer.isFixedSize) return;
    this.undoManager.beginOperation();
    layer.isFixedSize = false;
    this.undoManager.endOperation();
    this.bus.emit('layer-changed');
    this.bus.emit('document-changed');
}


/***/ },

/***/ "./js/KeyboardManager.js"
/*!*******************************!*\
  !*** ./js/KeyboardManager.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _endNudge: () => (/* binding */ _endNudge),
/* harmony export */   _nudgeMove: () => (/* binding */ _nudgeMove),
/* harmony export */   _setupKeyboardShortcuts: () => (/* binding */ _setupKeyboardShortcuts),
/* harmony export */   _zoomStep: () => (/* binding */ _zoomStep)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
/* harmony import */ var _model_Brush_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/Brush.js */ "./js/model/Brush.js");



/**
 * Keyboard shortcut setup and zoom stepping.
 * Methods are mixed into App.prototype — `this` refers to the App instance.
 */

function _setupKeyboardShortcuts(tools) {
    const shortcutMap = {};
    const shiftShortcutMap = {};
    const ctrlShortcutMap = {};
    for (const tool of tools) {
        if (tool.shortcut && tool.shortcut.length === 1) {
            shortcutMap[tool.shortcut.toLowerCase()] = tool.name;
        } else if (tool.shortcut && tool.shortcut.startsWith('Shift+')) {
            shiftShortcutMap[tool.shortcut.slice(6).toLowerCase()] = tool.name;
        } else if (tool.shortcut && tool.shortcut.startsWith('Ctrl+')) {
            ctrlShortcutMap[tool.shortcut.slice(5).toLowerCase()] = tool.name;
        }
    }

    document.addEventListener('keydown', (e) => {
        // Don't handle if typing in an input or a dialog is open
        const tag = e.target.tagName;
        const aeTag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (aeTag === 'INPUT' || aeTag === 'TEXTAREA' || aeTag === 'SELECT') return;
        if (e.target.closest('.palette-dialog-overlay')) return;

        // Arrow keys nudge layer/selection by 1px when Move tool is active.
        // Any other key flushes the pending nudge undo bracket so it doesn't
        // bleed into the next operation's snapshot.
        const isArrow = e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
                        e.key === 'ArrowLeft' || e.key === 'ArrowRight';
        if (isArrow && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
            const tool = this.canvasView._activeTool;
            if (tool && tool.name === 'Move') {
                e.preventDefault();
                let dx = 0, dy = 0;
                if (e.key === 'ArrowLeft') dx = -1;
                else if (e.key === 'ArrowRight') dx = 1;
                else if (e.key === 'ArrowUp') dy = -1;
                else if (e.key === 'ArrowDown') dy = 1;
                this._nudgeMove(dx, dy);
                return;
            }
        }
        if (!isArrow) this._endNudge();

        // Tool shortcuts
        if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            if (e.shiftKey) {
                const toolName = shiftShortcutMap[e.key.toLowerCase()];
                if (toolName && !this.toolbar._disabledTools.has(toolName)) {
                    this.bus.emit('switch-tool', toolName);
                    return;
                }
            }
            const toolName = shortcutMap[e.key.toLowerCase()];
            if (toolName && !this.toolbar._disabledTools.has(toolName)) {
                this.bus.emit('switch-tool', toolName);
                return;
            }

            // X = swap colors
            if (e.key.toLowerCase() === 'x') {
                this.doc.swapColors();
                this.bus.emit('fg-color-changed');
                this.bus.emit('bg-color-changed');
                return;
            }

            // +/= zoom in, - zoom out
            if (e.key === '=' || e.key === '+') {
                this._zoomStep(1);
                return;
            }
            if (e.key === '-') {
                this._zoomStep(-1);
                return;
            }

            // Escape / Enter during Free Transform
            if (this._freeTransformTool && this._freeTransformTool.isTransformActive) {
                if (e.key === 'Escape') {
                    this.toolbar.setLocked(false);
                    this._freeTransformTool.cancel();
                    return;
                }
                if (e.key === 'Enter') {
                    this.toolbar.setLocked(false);
                    this._freeTransformTool.commit();
                    return;
                }
            }

            // Escape = deselect
            if (e.key === 'Escape') {
                const sel = this.doc.selection;
                if (sel.active) {
                    if (sel.hasFloating()) {
                        this.undoManager.beginOperation();
                        sel.commitFloating(this.doc.getActiveLayer());
                        this.undoManager.endOperation();
                    }
                    sel.clear();
                    this.bus.emit('selection-changed');
                }
                return;
            }

            // Delete = clear selection
            if (e.key === 'Delete') {
                this._clearSelection();
                return;
            }

            // 1 = reset brush to default
            if (e.key === '1') {
                this.doc.activeBrush = _model_Brush_js__WEBPACK_IMPORTED_MODULE_1__.Brush.default();
                this.bus.emit('brush-changed');
                return;
            }
        }

        // Ctrl+key tool shortcuts
        if (e.ctrlKey && !e.shiftKey && !e.altKey) {
            const ctrlTool = ctrlShortcutMap[e.key.toLowerCase()];
            if (ctrlTool && !this.toolbar._disabledTools.has(ctrlTool)) {
                e.preventDefault();
                this.bus.emit('switch-tool', ctrlTool);
                return;
            }
        }

        // Ctrl+A = select all
        if (e.ctrlKey && !e.shiftKey && e.key === 'a') {
            e.preventDefault();
            const sel = this.doc.selection;
            if (sel.hasFloating()) {
                sel.commitFloating(this.doc.getActiveLayer());
            }
            sel.selectAll();
            this.bus.emit('selection-changed');
            return;
        }

        // Ctrl+D = deselect
        if (e.ctrlKey && !e.shiftKey && e.key === 'd') {
            e.preventDefault();
            const sel = this.doc.selection;
            if (sel.active) {
                if (sel.hasFloating()) {
                    this.undoManager.beginOperation();
                    sel.commitFloating(this.doc.getActiveLayer());
                    this.undoManager.endOperation();
                }
                sel.clear();
                this.bus.emit('selection-changed');
            }
            return;
        }

        // Ctrl+Shift+C = copy merged
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            this._copyMerged();
            return;
        }

        // Ctrl+Shift+V = paste in place
        if (e.ctrlKey && e.shiftKey && (e.key === 'V' || e.key === 'v')) {
            e.preventDefault();
            this._pasteInPlace();
            return;
        }

        // Ctrl+C = copy
        if (e.ctrlKey && !e.shiftKey && e.key === 'c') {
            e.preventDefault();
            this._copy();
            return;
        }

        // Ctrl+X = cut
        if (e.ctrlKey && !e.shiftKey && e.key === 'x') {
            e.preventDefault();
            this._cut();
            return;
        }

        // Ctrl+V = paste
        if (e.ctrlKey && !e.shiftKey && e.key === 'v') {
            e.preventDefault();
            if (this._clipboard) {
                this._paste();
            } else {
                this._pasteFromClipboard();
            }
            return;
        }

        // Ctrl+Z = undo (blocked during free transform)
        if (e.ctrlKey && !e.shiftKey && e.key === 'z') {
            if (this._freeTransformTool && this._freeTransformTool.isTransformActive) return;
            this.undoManager.undo();
            e.preventDefault();
            return;
        }

        // Ctrl+Shift+Z or Ctrl+Y = redo (blocked during free transform)
        if ((e.ctrlKey && e.shiftKey && e.key === 'Z') ||
            (e.ctrlKey && e.key === 'y')) {
            if (this._freeTransformTool && this._freeTransformTool.isTransformActive) return;
            this.undoManager.redo();
            e.preventDefault();
            return;
        }


        // Ctrl+B = set brush from selection
        if (e.ctrlKey && !e.shiftKey && e.key === 'b') {
            e.preventDefault();
            this._setBrushFromSelection();
            return;
        }

        // Ctrl+S = save project
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this._saveProject();
            return;
        }

        // Ctrl+O = open file
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this._openFile();
            return;
        }

        // Ctrl+Shift+E = export
        if (e.ctrlKey && e.shiftKey && e.key === 'E') {
            e.preventDefault();
            this._showExportDialog();
            return;
        }

        // Ctrl+' = toggle grid
        if (e.ctrlKey && !e.shiftKey && e.key === "'") {
            e.preventDefault();
            this.canvasView.gridVisible = !this.canvasView.gridVisible;
            this.canvasView.render();
            return;
        }

        // Ctrl+Shift+' = toggle snap
        if (e.ctrlKey && e.shiftKey && e.key === "'") {
            e.preventDefault();
            this.canvasView.snapToGrid = !this.canvasView.snapToGrid;
            return;
        }

        // Alt+R = toggle rulers
        if (e.altKey && e.key === 'r') {
            e.preventDefault();
            this.canvasView.setRulersVisible(!this.canvasView.rulersVisible);
            return;
        }

        // Ctrl+; = toggle guides
        if (e.ctrlKey && e.key === ';') {
            e.preventDefault();
            this.canvasView.guides.visible = !this.canvasView.guides.visible;
            this.canvasView.render();
            return;
        }
    });
}

function _nudgeMove(dx, dy) {
    const sel = this.doc.selection;
    const layer = this.doc.getActiveLayer();
    if (!layer) return;

    if (!this._nudgeActive) {
        this.undoManager.beginOperation();
        this._nudgeActive = true;
    }
    if (this._nudgeTimer) clearTimeout(this._nudgeTimer);
    this._nudgeTimer = setTimeout(() => this._endNudge(), 500);

    if (sel.active && this.doc.selectedLayerIndices.size < 2) {
        if (!sel.hasFloating()) {
            sel.liftPixels(layer);
            this.bus.emit('selection-changed');
        }
        if (sel.floating) {
            sel.moveFloating(sel.floating.originX + dx, sel.floating.originY + dy);
            this.canvasView.invalidateSelectionEdges();
            this.canvasView.render();
        }
        return;
    }

    let moved = false;
    for (const idx of this.doc.selectedLayerIndices) {
        const l = this.doc.layers[idx];
        if (l && !l.locked) {
            l.offsetX += dx;
            l.offsetY += dy;
            moved = true;
        }
    }
    if (moved) this.bus.emit('layer-changed');
}

function _endNudge() {
    if (this._nudgeTimer) {
        clearTimeout(this._nudgeTimer);
        this._nudgeTimer = null;
    }
    if (this._nudgeActive) {
        this.undoManager.endOperation();
        this._nudgeActive = false;
    }
}

function _zoomStep(dir) {
    const cv = this.canvasView;
    const cw = cv.container.clientWidth;
    const ch = cv.container.clientHeight;
    const centerDocX = (cw / 2 - cv.panX) / cv.zoom;
    const centerDocY = (ch / 2 - cv.panY) / cv.zoom;

    cv.zoomIndex = Math.max(0, Math.min(_constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS.length - 1, cv.zoomIndex + dir));
    cv.zoom = _constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS[cv.zoomIndex];

    cv.panX = Math.round(cw / 2 - centerDocX * cv.zoom);
    cv.panY = Math.round(ch / 2 - centerDocY * cv.zoom);

    this.bus.emit('zoom-changed', cv.zoom);
    cv.render();
}


/***/ },

/***/ "./js/constants.js"
/*!*************************!*\
  !*** ./js/constants.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ASSET_VERSION: () => (/* binding */ ASSET_VERSION),
/* harmony export */   DEFAULT_DOC_HEIGHT: () => (/* binding */ DEFAULT_DOC_HEIGHT),
/* harmony export */   DEFAULT_DOC_WIDTH: () => (/* binding */ DEFAULT_DOC_WIDTH),
/* harmony export */   GRID_MIN_ZOOM: () => (/* binding */ GRID_MIN_ZOOM),
/* harmony export */   TRANSPARENT: () => (/* binding */ TRANSPARENT),
/* harmony export */   ZOOM_LEVELS: () => (/* binding */ ZOOM_LEVELS),
/* harmony export */   generateVGAPalette: () => (/* binding */ generateVGAPalette),
/* harmony export */   withVersion: () => (/* binding */ withVersion)
/* harmony export */ });
// Bump this on each release to force cache reload of CSS/JS/images in production.
const ASSET_VERSION = '1.6.0';

// Appends ?v=ASSET_VERSION to an asset path for cache-busting.
function withVersion(path) {
    return `${path}?v=${ASSET_VERSION}`;
}

// VGA Mode 13h default 256-color palette
// First 16: CGA colors, then 216 color cube (6x6x6), then 24 grays
function generateVGAPalette() {
    const palette = new Array(256);

    // First 16 — standard CGA colors
    const cga = [
        [0, 0, 0],       // 0  black
        [0, 0, 170],     // 1  blue
        [0, 170, 0],     // 2  green
        [0, 170, 170],   // 3  cyan
        [170, 0, 0],     // 4  red
        [170, 0, 170],   // 5  magenta
        [170, 85, 0],    // 6  brown
        [170, 170, 170], // 7  light gray
        [85, 85, 85],    // 8  dark gray
        [85, 85, 255],   // 9  light blue
        [85, 255, 85],   // 10 light green
        [85, 255, 255],  // 11 light cyan
        [255, 85, 85],   // 12 light red
        [255, 85, 255],  // 13 light magenta
        [255, 255, 85],  // 14 yellow
        [255, 255, 255], // 15 white
    ];
    for (let i = 0; i < 16; i++) {
        palette[i] = cga[i];
    }

    // 16-231: 6x6x6 color cube
    const levels = [0, 51, 102, 153, 204, 255];
    let idx = 16;
    for (let r = 0; r < 6; r++) {
        for (let g = 0; g < 6; g++) {
            for (let b = 0; b < 6; b++) {
                palette[idx++] = [levels[r], levels[g], levels[b]];
            }
        }
    }

    // 232-255: grayscale ramp
    for (let i = 0; i < 24; i++) {
        const v = Math.round(8 + i * (247 - 8) / 23);
        palette[idx++] = [v, v, v];
    }

    return palette;
}

const DEFAULT_DOC_WIDTH = 320;
const DEFAULT_DOC_HEIGHT = 200;

const TRANSPARENT = 256; // sentinel value — not a valid palette index
const ZOOM_LEVELS = [1, 2, 3, 4, 6, 8, 12, 16, 32];
const GRID_MIN_ZOOM = 12;


/***/ },

/***/ "./js/history/UndoManager.js"
/*!***********************************!*\
  !*** ./js/history/UndoManager.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UndoManager: () => (/* binding */ UndoManager)
/* harmony export */ });
class UndoManager {
    constructor(doc, bus, maxEntries = 50) {
        this.doc = doc;
        this.bus = bus;
        this.maxEntries = maxEntries;
        this.undoStack = [];
        this.redoStack = [];
        this._snapshot = null;
        this._snapshotGeometry = null;
        this._snapshotLayer = -1;
        this._selectionSnapshot = null;
    }

    /** Call before a tool operation begins (on pointer down). */
    beginOperation() {
        const idx = this.doc.activeLayerIndex;
        const layer = this.doc.layers[idx];
        this._snapshotLayer = idx;
        this._snapshot = layer.snapshotData();
        this._snapshotGeometry = layer.snapshotGeometry();
        this._selectionSnapshot = this.doc.selection.snapshot();
    }

    /** Call after a tool operation ends (on pointer up). */
    endOperation() {
        if (this._snapshot === null) return;

        const idx = this._snapshotLayer;
        const layer = this.doc.layers[idx];
        const afterData = layer.snapshotData();
        const afterGeometry = layer.snapshotGeometry();
        const afterSelection = this.doc.selection.snapshot();

        // Check if layer changed (data or geometry)
        let layerChanged = false;
        const bg = this._snapshotGeometry;
        if (bg.width !== afterGeometry.width || bg.height !== afterGeometry.height ||
            bg.offsetX !== afterGeometry.offsetX || bg.offsetY !== afterGeometry.offsetY) {
            layerChanged = true;
        } else {
            const afterArr = afterData.data || afterData;
            const beforeArr = this._snapshot.data || this._snapshot;
            for (let i = 0; i < afterArr.length; i++) {
                if (afterArr[i] !== beforeArr[i]) {
                    layerChanged = true;
                    break;
                }
            }
        }

        // Check if selection changed
        let selectionChanged = false;
        const bs = this._selectionSnapshot;
        if (bs.active !== afterSelection.active) {
            selectionChanged = true;
        } else if (bs.active) {
            for (let i = 0; i < bs.mask.length; i++) {
                if (bs.mask[i] !== afterSelection.mask[i]) {
                    selectionChanged = true;
                    break;
                }
            }
            if (!selectionChanged) {
                const bf = bs.floating;
                const af = afterSelection.floating;
                if ((!bf) !== (!af)) {
                    selectionChanged = true;
                } else if (bf && af) {
                    if (bf.originX !== af.originX || bf.originY !== af.originY) {
                        selectionChanged = true;
                    }
                }
            }
        }

        if (layerChanged || selectionChanged) {
            this.undoStack.push({
                layerIndex: idx,
                beforeData: this._snapshot,
                afterData: afterData,
                beforeGeometry: this._snapshotGeometry,
                afterGeometry: afterGeometry,
                beforeSelection: this._selectionSnapshot,
                afterSelection: afterSelection,
            });

            if (this.undoStack.length > this.maxEntries) {
                this.undoStack.shift();
            }

            this.redoStack = [];
        }

        this._snapshot = null;
        this._snapshotGeometry = null;
        this._snapshotLayer = -1;
        this._selectionSnapshot = null;
    }

    pushEntry(entry) {
        this.undoStack.push(entry);
        if (this.undoStack.length > this.maxEntries) {
            this.undoStack.shift();
        }
        this.redoStack = [];
    }

    _restoreLayerState(entry, side) {
        this.doc.activeLayerIndex = entry[side + 'ActiveIndex'];
        this.doc.selectedLayerIndices = new Set(entry[side + 'Selected']);
        if (entry[side + 'Frames']) {
            this.doc.frames = entry[side + 'Frames'];
        }
    }

    _restoreResize(entry, key) {
        const size = entry[key + 'DocSize'];
        const layers = entry[key + 'Layers'];
        const sel = entry[key + 'Selection'];
        this.doc.width = size.width;
        this.doc.height = size.height;
        for (let i = 0; i < this.doc.layers.length; i++) {
            if (layers[i]) {
                this.doc.layers[i].restoreSnapshot(layers[i].data, layers[i].geometry);
            }
        }
        this.doc.selection.resize(size.width, size.height);
        this.doc.selection.restoreSnapshot(sel);
        document.getElementById('status-size').textContent = `${size.width} x ${size.height}`;
    }

    undo() {
        const entry = this.undoStack.pop();
        if (!entry) return;

        if (entry.type === 'palette') {
            this.doc.palette.import(entry.beforePalette);
            this.doc.layers = entry.beforeLayers;
            if (entry.beforeFrames) {
                this.doc.frames = entry.beforeFrames.map(f => ({
                    ...f,
                    layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
                }));
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.redoStack.push(entry);
            this.bus.emit('palette-changed');
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'resize') {
            this._restoreResize(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'merge-layers') {
            this.doc.layers = entry.beforeLayers.map(l => l.clone(true));
            this.doc.activeLayerIndex = entry.beforeActiveIndex;
            this.doc.selectedLayerIndices = new Set(entry.beforeSelected);
            if (entry.beforeFrames) {
                this.doc.frames = entry.beforeFrames.map(f => ({
                    ...f,
                    layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
                }));
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-add') {
            this.doc.layers.splice(entry.insertIndex, 1);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-delete') {
            this.doc.layers.splice(entry.removedIndex, 0, entry.layer);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-move') {
            const [layer] = this.doc.layers.splice(entry.toIndex, 1);
            this.doc.layers.splice(entry.fromIndex, 0, layer);
            this._restoreLayerState(entry, 'before');
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-rename') {
            this.doc.layers[entry.layerIndex].name = entry.beforeName;
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            return;
        }

        if (entry.type === 'layer-visibility') {
            for (let i = 0; i < entry.beforeStates.length; i++) {
                this.doc.layers[i].visible = entry.beforeStates[i];
            }
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-opacity') {
            this.doc.layers[entry.layerIndex].opacity = entry.beforeOpacity;
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-add' || entry.type === 'frame-delete') {
            this.doc.frames = entry.beforeFrames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
            }));
            this.doc.activeFrameIndex = entry.beforeActiveFrame;
            this.doc.loadFrame(this.doc.activeFrameIndex);
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-move') {
            const [frame] = this.doc.frames.splice(entry.toIndex, 1);
            this.doc.frames.splice(entry.fromIndex, 0, frame);
            this.doc.activeFrameIndex = entry.fromIndex;
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        if (entry.type === 'frame-edit') {
            const frame = this.doc.frames[entry.frameIndex];
            frame.tag = entry.beforeTag;
            frame.delay = entry.beforeDelay;
            this.redoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        const layer = this.doc.layers[entry.layerIndex];
        if (layer) {
            layer.restoreSnapshot(entry.beforeData, entry.beforeGeometry);
            this.doc.selection.restoreSnapshot(entry.beforeSelection);
            this.redoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
    }

    redo() {
        const entry = this.redoStack.pop();
        if (!entry) return;

        if (entry.type === 'palette') {
            this.doc.palette.import(entry.afterPalette);
            this.doc.layers = entry.afterLayers;
            if (entry.afterFrames) {
                this.doc.frames = entry.afterFrames.map(f => ({
                    ...f,
                    layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
                }));
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.undoStack.push(entry);
            this.bus.emit('palette-changed');
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'resize') {
            this._restoreResize(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'merge-layers') {
            this.doc.layers = entry.afterLayers.map(l => l.clone(true));
            this.doc.activeLayerIndex = entry.afterActiveIndex;
            this.doc.selectedLayerIndices = new Set(entry.afterSelected);
            if (entry.afterFrames) {
                this.doc.frames = entry.afterFrames.map(f => ({
                    ...f,
                    layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
                }));
                this.doc.loadFrame(this.doc.activeFrameIndex);
            }
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-add') {
            this.doc.layers.splice(entry.insertIndex, 0, entry.layer);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-delete') {
            this.doc.layers.splice(entry.removedIndex, 1);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-move') {
            const [layer] = this.doc.layers.splice(entry.fromIndex, 1);
            this.doc.layers.splice(entry.toIndex, 0, layer);
            this._restoreLayerState(entry, 'after');
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-rename') {
            this.doc.layers[entry.layerIndex].name = entry.afterName;
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            return;
        }

        if (entry.type === 'layer-visibility') {
            for (let i = 0; i < entry.afterStates.length; i++) {
                this.doc.layers[i].visible = entry.afterStates[i];
            }
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'layer-opacity') {
            this.doc.layers[entry.layerIndex].opacity = entry.afterOpacity;
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-add' || entry.type === 'frame-delete') {
            this.doc.frames = entry.afterFrames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
            }));
            this.doc.activeFrameIndex = entry.afterActiveFrame;
            this.doc.loadFrame(this.doc.activeFrameIndex);
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
            return;
        }

        if (entry.type === 'frame-move') {
            const [frame] = this.doc.frames.splice(entry.fromIndex, 1);
            this.doc.frames.splice(entry.toIndex, 0, frame);
            this.doc.activeFrameIndex = entry.toIndex;
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        if (entry.type === 'frame-edit') {
            const frame = this.doc.frames[entry.frameIndex];
            frame.tag = entry.afterTag;
            frame.delay = entry.afterDelay;
            this.undoStack.push(entry);
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            return;
        }

        const layer = this.doc.layers[entry.layerIndex];
        if (layer) {
            layer.restoreSnapshot(entry.afterData, entry.afterGeometry);
            this.doc.selection.restoreSnapshot(entry.afterSelection);
            this.undoStack.push(entry);
            this.bus.emit('selection-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
    }
}


/***/ },

/***/ "./js/model/Brush.js"
/*!***************************!*\
  !*** ./js/model/Brush.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Brush: () => (/* binding */ Brush)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class Brush {
    /**
     * @param {number} width
     * @param {number} height
     * @param {Uint16Array} data - palette indices (0-255) or TRANSPARENT (256) = don't paint
     * @param {boolean} isCaptured - if true, stamp with stored indices; if false, stamp with FG color
     */
    constructor(width, height, data, isCaptured = false) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.isCaptured = isCaptured;
        this.originX = Math.floor(width / 2);
        this.originY = Math.floor(height / 2);
    }

    static default() {
        // 1x1 pixel brush; value 1 means "paint here" (not TRANSPARENT)
        return new Brush(1, 1, new Uint16Array([1]), false);
    }
}


/***/ },

/***/ "./js/model/ImageDocument.js"
/*!***********************************!*\
  !*** ./js/model/ImageDocument.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageDocument: () => (/* binding */ ImageDocument)
/* harmony export */ });
/* harmony import */ var _Layer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Layer.js */ "./js/model/Layer.js");
/* harmony import */ var _Palette_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Palette.js */ "./js/model/Palette.js");
/* harmony import */ var _Brush_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Brush.js */ "./js/model/Brush.js");
/* harmony import */ var _Selection_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Selection.js */ "./js/model/Selection.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");






class ImageDocument {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.palette = new _Palette_js__WEBPACK_IMPORTED_MODULE_1__.Palette();
        this.layers = [];
        this.activeLayerIndex = 0;
        this.fgColorIndex = 15; // white in VGA palette
        this.bgColorIndex = 0;  // black
        this.activeBrush = _Brush_js__WEBPACK_IMPORTED_MODULE_2__.Brush.default();
        this.selection = new _Selection_js__WEBPACK_IMPORTED_MODULE_3__.Selection(width, height);
        this.selectedLayerIndices = new Set([0]);

        // Animation
        this.animationEnabled = false;
        this.onionSkinning = false;
        this.onionOpacity = 50;
        this.onionExtended = false;
        this.frames = [];
        this.activeFrameIndex = 0;

        // Start with one empty layer
        this.addLayer('Background');
    }

    getActiveLayer() {
        return this.layers[this.activeLayerIndex];
    }

    addLayer(name) {
        if (!name) {
            name = `Layer ${this.layers.length + 1}`;
        }
        const layer = new _Layer_js__WEBPACK_IMPORTED_MODULE_0__.Layer(name, this.width, this.height);
        // Insert above active layer (or at 0 if empty)
        const insertIdx = this.layers.length === 0 ? 0 : this.activeLayerIndex + 1;
        this.layers.splice(insertIdx, 0, layer);
        this.activeLayerIndex = insertIdx;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(insertIdx);
        // Insert transparent entry for the new layer in all frames
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.layerData) {
                    frame.layerData.splice(insertIdx, 0, {
                        data: new Uint16Array(layer.width * layer.height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT),
                        opacity: 1.0,
                        textData: null,
                        offsetX: layer.offsetX,
                        offsetY: layer.offsetY,
                        width: layer.width,
                        height: layer.height,
                    });
                }
            }
        }
        return layer;
    }

    removeLayer(index) {
        if (this.layers.length <= 1) return false;
        this.layers.splice(index, 1);
        this.selectedLayerIndices.delete(index);
        // Shift down indices above the removed one
        const shifted = new Set();
        for (const idx of this.selectedLayerIndices) {
            shifted.add(idx > index ? idx - 1 : idx);
        }
        if (this.activeLayerIndex >= this.layers.length) {
            this.activeLayerIndex = this.layers.length - 1;
        }
        shifted.add(this.activeLayerIndex);
        this.selectedLayerIndices = shifted;
        // Remove layer entry from all frames
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.layerData) frame.layerData.splice(index, 1);
            }
        }
        return true;
    }

    moveLayer(from, to) {
        if (to < 0 || to >= this.layers.length) return false;
        const [layer] = this.layers.splice(from, 1);
        this.layers.splice(to, 0, layer);
        this.activeLayerIndex = to;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(to);
        // Reorder layer entry in all frames
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.layerData) {
                    const [entry] = frame.layerData.splice(from, 1);
                    frame.layerData.splice(to, 0, entry);
                }
            }
        }
        return true;
    }

    duplicateLayer(index) {
        const original = this.layers[index];
        const copy = original.clone();
        this.layers.splice(index + 1, 0, copy);
        this.activeLayerIndex = index + 1;
        this.selectedLayerIndices.clear();
        this.selectedLayerIndices.add(index + 1);
        // Duplicate layer entry in all frames (as transparent)
        if (this.animationEnabled) {
            for (const frame of this.frames) {
                if (frame.layerData) {
                    frame.layerData.splice(index + 1, 0, {
                        data: new Uint16Array(copy.width * copy.height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT),
                        opacity: copy.opacity,
                        textData: copy.textData ? { ...copy.textData } : null,
                        offsetX: copy.offsetX,
                        offsetY: copy.offsetY,
                        width: copy.width,
                        height: copy.height,
                    });
                }
            }
        }
        return copy;
    }

    swapColors() {
        const tmp = this.fgColorIndex;
        this.fgColorIndex = this.bgColorIndex;
        this.bgColorIndex = tmp;
    }

    flattenToLayer() {
        const flat = new _Layer_js__WEBPACK_IMPORTED_MODULE_0__.Layer('Flattened', this.width, this.height);
        // Bottom-to-top: topmost non-transparent wins, respecting layer offsets
        for (const layer of this.layers) {
            if (!layer.visible) continue;
            const lx0 = Math.max(0, layer.offsetX);
            const ly0 = Math.max(0, layer.offsetY);
            const lx1 = Math.min(this.width, layer.offsetX + layer.width);
            const ly1 = Math.min(this.height, layer.offsetY + layer.height);
            for (let dy = ly0; dy < ly1; dy++) {
                for (let dx = lx0; dx < lx1; dx++) {
                    const val = layer.data[(dy - layer.offsetY) * layer.width + (dx - layer.offsetX)];
                    if (val !== _constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT) {
                        flat.data[dy * this.width + dx] = val;
                    }
                }
            }
        }
        return flat;
    }

    getUsedColorIndices() {
        const used = new Set();
        const processLayerData = (data, textData) => {
            if (textData) {
                used.add(textData.colorIndex);
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== _constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT) used.add(v);
            }
        };
        for (const layer of this.layers) {
            processLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            for (let f = 0; f < this.frames.length; f++) {
                if (f === this.activeFrameIndex) continue;
                const frame = this.frames[f];
                if (!frame.layerData) continue;
                for (const ld of frame.layerData) {
                    processLayerData(ld.data, ld.textData);
                }
            }
        }
        return used;
    }

    getColorHistogram() {
        const counts = new Uint32Array(256);
        const processLayerData = (data, textData) => {
            if (textData) {
                counts[textData.colorIndex]++;
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== _constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT) counts[v]++;
            }
        };
        for (const layer of this.layers) {
            processLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            for (let f = 0; f < this.frames.length; f++) {
                if (f === this.activeFrameIndex) continue;
                const frame = this.frames[f];
                if (!frame.layerData) continue;
                for (const ld of frame.layerData) {
                    processLayerData(ld.data, ld.textData);
                }
            }
        }
        return counts;
    }

    remapColorIndices(mapping) {
        const remapLayerData = (data, textData) => {
            if (textData) {
                const v = textData.colorIndex;
                if (mapping[v] !== undefined) {
                    textData.colorIndex = mapping[v];
                }
                return;
            }
            for (let i = 0; i < data.length; i++) {
                const v = data[i];
                if (v !== _constants_js__WEBPACK_IMPORTED_MODULE_4__.TRANSPARENT && mapping[v] !== undefined) {
                    data[i] = mapping[v];
                }
            }
        };
        for (const layer of this.layers) {
            remapLayerData(layer.data, layer.type === 'text' ? layer.textData : null);
        }
        if (this.animationEnabled) {
            for (let f = 0; f < this.frames.length; f++) {
                if (f === this.activeFrameIndex) continue;
                const frame = this.frames[f];
                if (!frame.layerData) continue;
                for (const ld of frame.layerData) {
                    remapLayerData(ld.data, ld.textData);
                }
            }
        }
    }

    // ── Frame Animation ──────────────────────────────────────────────

    _snapshotLayers() {
        return this.layers.map(l => ({
            data: l.data.slice(),
            opacity: l.opacity,
            textData: l.textData ? { ...l.textData } : null,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
        }));
    }

    _restoreLayersFromFrame(frame) {
        for (let i = 0; i < this.layers.length && i < frame.layerData.length; i++) {
            const ld = frame.layerData[i];
            const layer = this.layers[i];
            layer.data = ld.data.slice();
            layer.opacity = ld.opacity;
            layer.textData = ld.textData ? { ...ld.textData } : null;
            layer.offsetX = ld.offsetX;
            layer.offsetY = ld.offsetY;
            if (ld.width !== undefined) layer.width = ld.width;
            if (ld.height !== undefined) layer.height = ld.height;
        }
    }

    saveCurrentFrame() {
        if (!this.animationEnabled || this.frames.length === 0) return;
        const frame = this.frames[this.activeFrameIndex];
        frame.layerData = this.layers.map(l => ({
            data: l.data.slice(),
            opacity: l.opacity,
            textData: l.textData ? { ...l.textData } : null,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            width: l.width,
            height: l.height,
        }));
    }

    loadFrame(index) {
        if (index < 0 || index >= this.frames.length) return;
        this.activeFrameIndex = index;
        this._restoreLayersFromFrame(this.frames[index]);
    }

    addFrame() {
        this.saveCurrentFrame();
        const frame = {
            tag: '',
            delay: 100,
            layerData: this._snapshotLayers().map((ld, i) => ({
                ...ld,
                width: this.layers[i].width,
                height: this.layers[i].height,
            })),
        };
        this.frames.splice(this.activeFrameIndex + 1, 0, frame);
        this.activeFrameIndex++;
    }

    deleteFrame(index) {
        if (this.frames.length <= 1) return false;
        this.frames.splice(index, 1);
        if (this.activeFrameIndex >= this.frames.length) {
            this.activeFrameIndex = this.frames.length - 1;
        }
        this.loadFrame(this.activeFrameIndex);
        return true;
    }

    moveFrame(from, dir) {
        const to = from + dir;
        if (to < 0 || to >= this.frames.length) return false;
        const [frame] = this.frames.splice(from, 1);
        this.frames.splice(to, 0, frame);
        this.activeFrameIndex = to;
        return true;
    }

    enableAnimation() {
        if (this.animationEnabled) return;
        this.animationEnabled = true;
        this.frames = [{
            tag: '',
            delay: 100,
            layerData: this.layers.map(l => ({
                data: l.data.slice(),
                opacity: l.opacity,
                textData: l.textData ? { ...l.textData } : null,
                offsetX: l.offsetX,
                offsetY: l.offsetY,
                width: l.width,
                height: l.height,
            })),
        }];
        this.activeFrameIndex = 0;
    }

    disableAnimation() {
        if (!this.animationEnabled) return;
        // Keep frame 0's data
        if (this.frames.length > 0) {
            this.loadFrame(0);
        }
        this.animationEnabled = false;
        this.frames = [];
        this.activeFrameIndex = 0;
    }
}


/***/ },

/***/ "./js/model/Layer.js"
/*!***************************!*\
  !*** ./js/model/Layer.js ***!
  \***************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Layer: () => (/* binding */ Layer)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


const GROWTH_PADDING = 16;

class Layer {
    constructor(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.offsetX = 0;
        this.offsetY = 0;
        this.visible = true;
        this.locked = false;
        this.opacity = 1.0;      // 0.0 - 1.0
        this.type = 'raster';    // 'raster' or 'text'
        this.textData = null;    // { text, fontFamily, fontSize, bold, italic, underline, colorIndex }
        this.isFixedSize = false;
        // Uint16Array so we can store 0-255 (valid palette) + 256 (transparent)
        this.data = new Uint16Array(width * height);
        this.data.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
    }

    getContentBounds() {
        // Text layers use the full layer rect as content bounds
        if (this.type === 'text') {
            return {
                left: this.offsetX,
                top: this.offsetY,
                right: this.offsetX + this.width,
                bottom: this.offsetY + this.height,
            };
        }
        let minX = this.width, minY = this.height, maxX = -1, maxY = -1;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.data[y * this.width + x] !== _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;
        return {
            left: minX + this.offsetX,
            top: minY + this.offsetY,
            right: maxX + 1 + this.offsetX,
            bottom: maxY + 1 + this.offsetY,
        };
    }

    // --- Layer-local coordinate access ---

    getPixel(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT;
        return this.data[y * this.width + x];
    }

    setPixel(x, y, colorIndex) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        this.data[y * this.width + x] = colorIndex;
    }

    // --- Document-coordinate access ---

    getPixelDoc(docX, docY) {
        return this.getPixel(docX - this.offsetX, docY - this.offsetY);
    }

    setPixelAutoExtend(docX, docY, colorIndex) {
        const lx = docX - this.offsetX;
        const ly = docY - this.offsetY;
        if (lx >= 0 && lx < this.width && ly >= 0 && ly < this.height) {
            // Fast path: inside current bounds
            this.data[ly * this.width + lx] = colorIndex;
            return;
        }
        if (this.isFixedSize) return; // Do not grow fixed-size layers
        // Need to grow
        this._grow(docX, docY);
        const lx2 = docX - this.offsetX;
        const ly2 = docY - this.offsetY;
        this.data[ly2 * this.width + lx2] = colorIndex;
    }

    /**
     * Ensure the layer covers the given document-space rectangle.
     * Call before a batch of setPixelAutoExtend calls to avoid multiple reallocations.
     */
    ensureRect(docX0, docY0, docX1, docY1) {
        if (this.isFixedSize) return;
        const curLeft = this.offsetX;
        const curTop = this.offsetY;
        const curRight = this.offsetX + this.width;
        const curBottom = this.offsetY + this.height;

        if (docX0 >= curLeft && docY0 >= curTop && docX1 < curRight && docY1 < curBottom) {
            return; // already covered
        }

        const newLeft = Math.min(curLeft, docX0 - GROWTH_PADDING);
        const newTop = Math.min(curTop, docY0 - GROWTH_PADDING);
        const newRight = Math.max(curRight, docX1 + 1 + GROWTH_PADDING);
        const newBottom = Math.max(curBottom, docY1 + 1 + GROWTH_PADDING);

        this._resize(newLeft, newTop, newRight - newLeft, newBottom - newTop);
    }

    // --- Internal growth ---

    _grow(docX, docY) {
        const curLeft = this.offsetX;
        const curTop = this.offsetY;
        const curRight = this.offsetX + this.width;
        const curBottom = this.offsetY + this.height;

        const newLeft = Math.min(curLeft, docX - GROWTH_PADDING);
        const newTop = Math.min(curTop, docY - GROWTH_PADDING);
        const newRight = Math.max(curRight, docX + 1 + GROWTH_PADDING);
        const newBottom = Math.max(curBottom, docY + 1 + GROWTH_PADDING);

        this._resize(newLeft, newTop, newRight - newLeft, newBottom - newTop);
    }

    _resize(newOffsetX, newOffsetY, newWidth, newHeight) {
        const newData = new Uint16Array(newWidth * newHeight);
        newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

        // Blit old data into new buffer
        const srcOffX = this.offsetX - newOffsetX;
        const srcOffY = this.offsetY - newOffsetY;
        for (let y = 0; y < this.height; y++) {
            const srcStart = y * this.width;
            const dstStart = (y + srcOffY) * newWidth + srcOffX;
            newData.set(this.data.subarray(srcStart, srcStart + this.width), dstStart);
        }

        this.data = newData;
        this.width = newWidth;
        this.height = newHeight;
        this.offsetX = newOffsetX;
        this.offsetY = newOffsetY;
    }

    // --- Utility ---

    clear() {
        this.data.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
    }

    clone(preserveName = false) {
        const copy = new Layer(preserveName ? this.name : this.name + ' copy', this.width, this.height);
        copy.offsetX = this.offsetX;
        copy.offsetY = this.offsetY;
        copy.visible = this.visible;
        copy.locked = this.locked;
        copy.opacity = this.opacity;
        copy.type = this.type;
        copy.textData = this.textData ? { ...this.textData } : null;
        copy.isFixedSize = this.isFixedSize;
        copy.data = this.data.slice();
        return copy;
    }

    snapshotData() {
        return {
            data: this.data.slice(),
            type: this.type,
            textData: this.textData ? { ...this.textData } : null,
            isFixedSize: this.isFixedSize,
        };
    }

    snapshotGeometry() {
        return {
            width: this.width,
            height: this.height,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
        };
    }

    restoreSnapshot(snapshot, geometry) {
        this.width = geometry.width;
        this.height = geometry.height;
        this.offsetX = geometry.offsetX;
        this.offsetY = geometry.offsetY;
        if (snapshot instanceof Uint16Array || ArrayBuffer.isView(snapshot)) {
            // Legacy format: raw data array
            this.data = snapshot.slice();
        } else {
            // New format: { data, type, textData }
            this.data = snapshot.data.slice();
            this.type = snapshot.type || 'raster';
            this.textData = snapshot.textData ? { ...snapshot.textData } : null;
            this.isFixedSize = !!snapshot.isFixedSize;
        }
    }

    static createText(name, textData, docWidth, docHeight) {
        const layer = new Layer(name, docWidth, docHeight);
        layer.type = 'text';
        layer.textData = { ...textData };
        return layer;
    }
}


/***/ },

/***/ "./js/model/Palette.js"
/*!*****************************!*\
  !*** ./js/model/Palette.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Palette: () => (/* binding */ Palette)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class Palette {
    constructor() {
        this.colors = (0,_constants_js__WEBPACK_IMPORTED_MODULE_0__.generateVGAPalette)();
    }

    getColor(index) {
        return this.colors[index];
    }

    setColor(index, r, g, b) {
        this.colors[index] = [r, g, b];
    }

    toRGBA(index) {
        const [r, g, b] = this.colors[index];
        return [r, g, b, 255];
    }

    clone() {
        const p = new Palette();
        p.colors = this.colors.map(c => [...c]);
        return p;
    }

    export() {
        return this.colors.map(c => [...c]);
    }

    import(data) {
        for (let i = 0; i < 256 && i < data.length; i++) {
            this.colors[i] = [data[i][0], data[i][1], data[i][2]];
        }
    }
}


/***/ },

/***/ "./js/model/Selection.js"
/*!*******************************!*\
  !*** ./js/model/Selection.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Selection: () => (/* binding */ Selection)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class Selection {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.mask = new Uint8Array(width * height);
        this.active = false;
        this.floating = null; // { data, mask, width, height, originX, originY }
        this.floatingTransform = null; // set by FreeTransformTool
        this._resizeSource = null; // { mask, minX, minY, w, h }
        this._pureShape = null; // 'rect' or 'ellipse' if unmodified
    }

    clear() {
        this.active = false;
        this.mask.fill(0);
        this.floating = null;
        this.floatingTransform = null;
        this._resizeSource = null;
        this._pureShape = null;
    }

    isSelected(docX, docY) {
        if (docX < 0 || docX >= this.width || docY < 0 || docY >= this.height) return false;
        return this.mask[docY * this.width + docX] === 1;
    }

    _clampBounds(x0, y0, x1, y1) {
        return {
            minX: Math.max(0, Math.min(x0, x1)),
            minY: Math.max(0, Math.min(y0, y1)),
            maxX: Math.min(this.width - 1, Math.max(x0, x1)),
            maxY: Math.min(this.height - 1, Math.max(y0, y1)),
        };
    }

    _forEachEllipsePixel(minX, minY, maxX, maxY, callback) {
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const rx = (maxX - minX) / 2;
        const ry = (maxY - minY) / 2;
        if (rx <= 0 || ry <= 0) return;
        // +0.5 ensures edge pixels at the exact boundary are included
        const erx = rx + 0.5;
        const ery = ry + 0.5;
        // Clamp iteration to document bounds (ellipse may extend off-canvas)
        const iterMinX = Math.max(0, minX);
        const iterMinY = Math.max(0, minY);
        const iterMaxX = Math.min(this.width - 1, maxX);
        const iterMaxY = Math.min(this.height - 1, maxY);
        for (let y = iterMinY; y <= iterMaxY; y++) {
            for (let x = iterMinX; x <= iterMaxX; x++) {
                const dx = (x - cx) / erx;
                const dy = (y - cy) / ery;
                if (dx * dx + dy * dy <= 1) {
                    callback(x, y);
                }
            }
        }
    }

    _setMaskRect(minX, minY, maxX, maxY, value) {
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.mask[y * this.width + x] = value;
            }
        }
    }

    selectRect(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = 'rect';
        this.mask.fill(0);
        const { minX, minY, maxX, maxY } = this._clampBounds(x0, y0, x1, y1);
        this._setMaskRect(minX, minY, maxX, maxY, 1);
        this.active = true;
    }

    selectEllipse(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = 'ellipse';
        this.mask.fill(0);
        const minX = Math.min(x0, x1), minY = Math.min(y0, y1);
        const maxX = Math.max(x0, x1), maxY = Math.max(y0, y1);
        this._forEachEllipsePixel(minX, minY, maxX, maxY, (x, y) => {
            this.mask[y * this.width + x] = 1;
        });
        this.active = true;
    }

    addRect(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = null;
        const { minX, minY, maxX, maxY } = this._clampBounds(x0, y0, x1, y1);
        this._setMaskRect(minX, minY, maxX, maxY, 1);
        this.active = true;
    }

    subtractRect(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = null;
        const { minX, minY, maxX, maxY } = this._clampBounds(x0, y0, x1, y1);
        this._setMaskRect(minX, minY, maxX, maxY, 0);
        if (!this.mask.includes(1)) {
            this.active = false;
        }
    }

    addEllipse(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = null;
        const minX = Math.min(x0, x1), minY = Math.min(y0, y1);
        const maxX = Math.max(x0, x1), maxY = Math.max(y0, y1);
        this._forEachEllipsePixel(minX, minY, maxX, maxY, (x, y) => {
            this.mask[y * this.width + x] = 1;
        });
        this.active = true;
    }

    subtractEllipse(x0, y0, x1, y1) {
        this._resizeSource = null;
        this._pureShape = null;
        const minX = Math.min(x0, x1), minY = Math.min(y0, y1);
        const maxX = Math.max(x0, x1), maxY = Math.max(y0, y1);
        this._forEachEllipsePixel(minX, minY, maxX, maxY, (x, y) => {
            this.mask[y * this.width + x] = 0;
        });
        if (!this.mask.includes(1)) {
            this.active = false;
        }
    }

    selectAll() {
        this._resizeSource = null;
        this._pureShape = null;
        this.mask.fill(1);
        this.active = true;
    }

    getBounds() {
        let minX = this.width, minY = this.height, maxX = -1, maxY = -1;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.mask[y * this.width + x]) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;
        return { minX, minY, maxX, maxY };
    }

    hasFloating() {
        return this.floating !== null;
    }

    liftPixels(layer) {
        if (this.floating) return; // already lifted
        const bounds = this.getBounds();
        if (!bounds) return;

        const { minX, minY, maxX, maxY } = bounds;
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const data = new Uint16Array(w * h);
        const fMask = new Uint8Array(w * h);
        data.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const docX = minX + x;
                const docY = minY + y;
                if (!this.mask[docY * this.width + docX]) continue;
                data[y * w + x] = layer.getPixelDoc(docX, docY);
                fMask[y * w + x] = 1;
                // Cut from layer
                const lx = docX - layer.offsetX;
                const ly = docY - layer.offsetY;
                if (lx >= 0 && lx < layer.width && ly >= 0 && ly < layer.height) {
                    layer.setPixel(lx, ly, _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
                }
            }
        }

        this.floating = {
            data, mask: fMask, width: w, height: h,
            originX: minX, originY: minY
        };
    }

    copyPixels(layer) {
        const source = this.hasFloating() ? this.floating : null;
        if (source) {
            return {
                data: new Uint16Array(source.data),
                mask: new Uint8Array(source.mask),
                width: source.width,
                height: source.height,
                originX: source.originX,
                originY: source.originY
            };
        }
        const bounds = this.getBounds();
        if (!bounds) return null;

        const { minX, minY, maxX, maxY } = bounds;
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const data = new Uint16Array(w * h);
        const fMask = new Uint8Array(w * h);
        data.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const docX = minX + x;
                const docY = minY + y;
                if (!this.mask[docY * this.width + docX]) continue;
                data[y * w + x] = layer.getPixelDoc(docX, docY);
                fMask[y * w + x] = 1;
            }
        }
        return { data, mask: fMask, width: w, height: h, originX: minX, originY: minY };
    }

    copyPixelsMerged(layers) {
        const bounds = this.hasFloating() ? this._floatingBounds() : this.getBounds();
        if (!bounds) return null;

        const { minX, minY, maxX, maxY } = bounds;
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const data = new Uint16Array(w * h);
        const fMask = new Uint8Array(w * h);
        data.fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const docX = minX + x;
                const docY = minY + y;
                const inSelection = this.hasFloating()
                    ? this._floatingHit(x, y)
                    : this.mask[docY * this.width + docX];
                if (!inSelection) continue;
                // Composite visible layers bottom-to-top
                let color = _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT;
                for (const layer of layers) {
                    if (!layer.visible) continue;
                    const px = layer.getPixelDoc(docX, docY);
                    if (px !== _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) color = px;
                }
                data[y * w + x] = color;
                fMask[y * w + x] = 1;
            }
        }
        return { data, mask: fMask, width: w, height: h, originX: minX, originY: minY };
    }

    _floatingBounds() {
        if (!this.floating) return null;
        const f = this.floating;
        return { minX: f.originX, minY: f.originY, maxX: f.originX + f.width - 1, maxY: f.originY + f.height - 1 };
    }

    _floatingHit(localX, localY) {
        const f = this.floating;
        return f && localX >= 0 && localX < f.width && localY >= 0 && localY < f.height && f.mask[localY * f.width + localX];
    }

    saveResizeSource() {
        if (this._resizeSource) return; // keep original across multiple resizes
        const bounds = this.getBounds();
        if (!bounds) { this._resizeSource = null; return; }
        const { minX, minY, maxX, maxY } = bounds;
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;
        const mask = new Uint8Array(w * h);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                mask[y * w + x] = this.mask[(minY + y) * this.width + (minX + x)];
            }
        }
        this._resizeSource = { mask, minX, minY, w, h };
    }

    applyResize(newMinX, newMinY, newMaxX, newMaxY) {
        if (this._pureShape === 'rect') {
            this.mask.fill(0);
            this._pureShape = 'rect'; // preserve through the fill(0)
            const { minX, minY, maxX, maxY } = this._clampBounds(newMinX, newMinY, newMaxX, newMaxY);
            this._setMaskRect(minX, minY, maxX, maxY, 1);
            this.active = maxX >= minX && maxY >= minY;
            return;
        }

        if (this._pureShape === 'ellipse') {
            this.mask.fill(0);
            this._pureShape = 'ellipse';
            // Pass unclamped bounds — _forEachEllipsePixel clamps iteration internally
            this._forEachEllipsePixel(newMinX, newMinY, newMaxX, newMaxY, (x, y) => {
                this.mask[y * this.width + x] = 1;
            });
            this.active = true;
            return;
        }

        // Complex shape: scale source mask via nearest-neighbor
        const src = this._resizeSource;
        if (!src) return;
        const nw = newMaxX - newMinX + 1;
        const nh = newMaxY - newMinY + 1;
        if (nw <= 0 || nh <= 0) return;

        this.mask.fill(0);
        for (let y = 0; y < nh; y++) {
            for (let x = 0; x < nw; x++) {
                const docX = newMinX + x;
                const docY = newMinY + y;
                if (docX < 0 || docX >= this.width || docY < 0 || docY >= this.height) continue;
                const sx = Math.floor(x * src.w / nw);
                const sy = Math.floor(y * src.h / nh);
                if (src.mask[sy * src.w + sx]) {
                    this.mask[docY * this.width + docX] = 1;
                }
            }
        }
        this.active = this.mask.includes(1);
    }

    moveMask(dx, dy) {
        this._resizeSource = null;
        this._pureShape = null;
        if (dx === 0 && dy === 0) return;
        const { width, height, mask } = this;
        const newMask = new Uint8Array(width * height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!mask[y * width + x]) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    newMask[ny * width + nx] = 1;
                }
            }
        }
        this.mask = newMask;
    }

    moveFloating(newOriginX, newOriginY) {
        if (!this.floating) return;
        this.floating.originX = newOriginX;
        this.floating.originY = newOriginY;
    }

    commitFloating(layer) {
        if (!this.floating) return;
        const f = this.floating;
        const docW = this.width;
        const docH = this.height;

        for (let y = 0; y < f.height; y++) {
            for (let x = 0; x < f.width; x++) {
                if (!f.mask[y * f.width + x]) continue;
                const colorIndex = f.data[y * f.width + x];
                if (colorIndex === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                const docX = f.originX + x;
                const docY = f.originY + y;
                if (docX < 0 || docX >= docW || docY < 0 || docY >= docH) continue;
                layer.setPixelAutoExtend(docX, docY, colorIndex);
            }
        }

        // Update mask to reflect new position
        this.mask.fill(0);
        for (let y = 0; y < f.height; y++) {
            for (let x = 0; x < f.width; x++) {
                if (!f.mask[y * f.width + x]) continue;
                const docX = f.originX + x;
                const docY = f.originY + y;
                if (docX >= 0 && docX < docW && docY >= 0 && docY < docH) {
                    this.mask[docY * docW + docX] = 1;
                }
            }
        }

        this.floating = null;
        this._resizeSource = null;
        this._pureShape = null;
    }

    snapshot() {
        const snap = {
            mask: new Uint8Array(this.mask),
            active: this.active,
            pureShape: this._pureShape,
            floating: null,
        };
        if (this.floating) {
            const f = this.floating;
            snap.floating = {
                data: new Uint16Array(f.data),
                mask: new Uint8Array(f.mask),
                width: f.width, height: f.height,
                originX: f.originX, originY: f.originY,
            };
        }
        return snap;
    }

    restoreSnapshot(snap) {
        this.mask = new Uint8Array(snap.mask);
        this.active = snap.active;
        this._pureShape = snap.pureShape;
        this._resizeSource = null;
        if (snap.floating) {
            const f = snap.floating;
            this.floating = {
                data: new Uint16Array(f.data),
                mask: new Uint8Array(f.mask),
                width: f.width, height: f.height,
                originX: f.originX, originY: f.originY,
            };
        } else {
            this.floating = null;
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.mask = new Uint8Array(width * height);
        this.active = false;
        this.floating = null;
    }
}


/***/ },

/***/ "./js/render/GridOverlay.js"
/*!**********************************!*\
  !*** ./js/render/GridOverlay.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridOverlay: () => (/* binding */ GridOverlay)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class GridOverlay {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    draw(docWidth, docHeight, zoom, panX, panY) {
        const { canvas, ctx } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (zoom < _constants_js__WEBPACK_IMPORTED_MODULE_0__.GRID_MIN_ZOOM) return;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        ctx.beginPath();

        // Vertical lines
        for (let x = 0; x <= docWidth; x++) {
            const sx = Math.round(panX + x * zoom) + 0.5;
            ctx.moveTo(sx, Math.round(panY) + 0.5);
            ctx.lineTo(sx, Math.round(panY + docHeight * zoom) + 0.5);
        }

        // Horizontal lines
        for (let y = 0; y <= docHeight; y++) {
            const sy = Math.round(panY + y * zoom) + 0.5;
            ctx.moveTo(Math.round(panX) + 0.5, sy);
            ctx.lineTo(Math.round(panX + docWidth * zoom) + 0.5, sy);
        }

        ctx.stroke();
    }
}


/***/ },

/***/ "./js/render/Renderer.js"
/*!*******************************!*\
  !*** ./js/render/Renderer.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Renderer: () => (/* binding */ Renderer)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class Renderer {
    constructor(doc) {
        this.doc = doc;
        this._imageData = null;
    }

    composite() {
        const { width, height, palette, layers } = this.doc;

        if (!this._imageData || this._imageData.width !== width || this._imageData.height !== height) {
            this._imageData = new ImageData(width, height);
        }

        const buf = this._imageData.data;
        buf.fill(0);

        // Onion skinning: render adjacent frames first at reduced opacity
        if (this.doc.animationEnabled && this.doc.onionSkinning && this.doc.frames.length > 1) {
            this._renderOnionFrames(buf, width, height, palette);
        }

        // Composite layers bottom-to-top, respecting per-layer offset and size
        for (const layer of layers) {
            if (!layer.visible) continue;

            // Text layer: render via canvas API
            if (layer.type === 'text' && layer.textData) {
                this._compositeTextLayer(layer, palette, buf, width, height);
                continue;
            }

            // Intersection of layer rect and document rect
            const lx0 = Math.max(0, layer.offsetX);
            const ly0 = Math.max(0, layer.offsetY);
            const lx1 = Math.min(width, layer.offsetX + layer.width);
            const ly1 = Math.min(height, layer.offsetY + layer.height);

            const layerData = layer.data;
            const layerW = layer.width;
            const layerOx = layer.offsetX;
            const layerOy = layer.offsetY;

            const opacity = layer.opacity !== undefined ? layer.opacity : 1;

            for (let dy = ly0; dy < ly1; dy++) {
                const localY = dy - layerOy;
                const localRowStart = localY * layerW - layerOx;
                const docRowStart = dy * width;
                for (let dx = lx0; dx < lx1; dx++) {
                    const colorIndex = layerData[localRowStart + dx];
                    if (colorIndex === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                    const [r, g, b] = palette.getColor(colorIndex);
                    const off = (docRowStart + dx) * 4;
                    if (opacity >= 1) {
                        buf[off] = r;
                        buf[off + 1] = g;
                        buf[off + 2] = b;
                        buf[off + 3] = 255;
                    } else {
                        // Blend with background using palette
                        const br = buf[off + 3] ? buf[off] : 0;
                        const bg = buf[off + 3] ? buf[off + 1] : 0;
                        const bb = buf[off + 3] ? buf[off + 2] : 0;
                        const mr = Math.round(r * opacity + br * (1 - opacity));
                        const mg = Math.round(g * opacity + bg * (1 - opacity));
                        const mb = Math.round(b * opacity + bb * (1 - opacity));
                        // Find nearest palette color
                        let bestDist = Infinity, bestIdx = 0;
                        const colors = palette.colors;
                        for (let j = 0; j < 256; j++) {
                            const [pr, pg, pb] = colors[j];
                            const dist = (mr - pr) ** 2 + (mg - pg) ** 2 + (mb - pb) ** 2;
                            if (dist < bestDist) { bestDist = dist; bestIdx = j; }
                            if (dist === 0) break;
                        }
                        const [fr, fg, fb] = colors[bestIdx];
                        buf[off] = fr;
                        buf[off + 1] = fg;
                        buf[off + 2] = fb;
                        buf[off + 3] = 255;
                    }
                }
            }
        }

        // Render floating selection on top
        const sel = this.doc.selection;
        if (sel && sel.hasFloating()) {
            const f = sel.floating;
            const t = sel.floatingTransform;

            if (t) {
                // Transform-aware rendering (Free Transform mode)
                const cos = Math.cos(t.rotation);
                const sin = Math.sin(t.rotation);
                const invCos = Math.cos(-t.rotation);
                const invSin = Math.sin(-t.rotation);
                const invSx = 1 / t.sx;
                const invSy = 1 / t.sy;

                // Compute AABB of transformed floating rect
                const corners = [
                    [f.originX, f.originY],
                    [f.originX + f.width, f.originY],
                    [f.originX + f.width, f.originY + f.height],
                    [f.originX, f.originY + f.height],
                ];
                let aMinX = Infinity, aMinY = Infinity, aMaxX = -Infinity, aMaxY = -Infinity;
                for (const [cx, cy] of corners) {
                    const dx = (cx - t.cx) * t.sx;
                    const dy = (cy - t.cy) * t.sy;
                    const rx = t.cx + t.tx + dx * cos - dy * sin;
                    const ry = t.cy + t.ty + dx * sin + dy * cos;
                    if (rx < aMinX) aMinX = rx;
                    if (rx > aMaxX) aMaxX = rx;
                    if (ry < aMinY) aMinY = ry;
                    if (ry > aMaxY) aMaxY = ry;
                }
                const x0 = Math.max(0, Math.floor(aMinX));
                const y0 = Math.max(0, Math.floor(aMinY));
                const x1 = Math.min(width - 1, Math.ceil(aMaxX));
                const y1 = Math.min(height - 1, Math.ceil(aMaxY));

                for (let docY = y0; docY <= y1; docY++) {
                    for (let docX = x0; docX <= x1; docX++) {
                        const rx = docX - t.cx - t.tx;
                        const ry = docY - t.cy - t.ty;
                        const urx = rx * invCos - ry * invSin;
                        const ury = rx * invSin + ry * invCos;
                        const srcX = Math.round(urx * invSx + t.cx) - f.originX;
                        const srcY = Math.round(ury * invSy + t.cy) - f.originY;
                        if (srcX < 0 || srcX >= f.width || srcY < 0 || srcY >= f.height) continue;
                        if (!f.mask[srcY * f.width + srcX]) continue;
                        const colorIndex = f.data[srcY * f.width + srcX];
                        if (colorIndex === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                        const [r, g, b] = palette.getColor(colorIndex);
                        const off = (docY * width + docX) * 4;
                        buf[off] = r;
                        buf[off + 1] = g;
                        buf[off + 2] = b;
                        buf[off + 3] = 255;
                    }
                }
            } else {
                // Fast path: no transform
                for (let fy = 0; fy < f.height; fy++) {
                    for (let fx = 0; fx < f.width; fx++) {
                        if (!f.mask[fy * f.width + fx]) continue;
                        const colorIndex = f.data[fy * f.width + fx];
                        if (colorIndex === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                        const docX = f.originX + fx;
                        const docY = f.originY + fy;
                        if (docX < 0 || docX >= width || docY < 0 || docY >= height) continue;
                        const [r, g, b] = palette.getColor(colorIndex);
                        const off = (docY * width + docX) * 4;
                        buf[off] = r;
                        buf[off + 1] = g;
                        buf[off + 2] = b;
                        buf[off + 3] = 255;
                    }
                }
            }
        }

        return this._imageData;
    }

    _renderOnionFrames(buf, width, height, palette) {
        const doc = this.doc;
        const activeIdx = doc.activeFrameIndex;
        const frames = doc.frames;
        const baseOpacity = (doc.onionOpacity ?? 50) / 100;
        const range = doc.onionExtended ? 2 : 1;

        // Collect frames to render: { index, step } where step is distance from active
        const onionFrames = [];
        for (let d = 1; d <= range; d++) {
            if (activeIdx - d >= 0) onionFrames.push({ index: activeIdx - d, step: d, dir: -1 });
            if (activeIdx + d < frames.length) onionFrames.push({ index: activeIdx + d, step: d, dir: 1 });
        }

        if (onionFrames.length === 0) return;

        // Save current layer state
        const saved = doc.layers.map(l => ({
            data: l.data, opacity: l.opacity, textData: l.textData,
            offsetX: l.offsetX, offsetY: l.offsetY,
            width: l.width, height: l.height,
        }));

        for (const { index, step, dir } of onionFrames) {
            const frame = frames[index];
            if (!frame.layerData) continue;

            // Opacity decreases with distance
            const opacity = baseOpacity / step;

            // Tint: red for previous frames, blue for next frames
            const tintR = dir < 0 ? 255 : 0;
            const tintG = 0;
            const tintB = dir > 0 ? 255 : 0;

            doc._restoreLayersFromFrame(frame);

            for (const layer of doc.layers) {
                if (!layer.visible) continue;
                if (layer.type === 'text' && layer.textData) continue;

                const lx0 = Math.max(0, layer.offsetX);
                const ly0 = Math.max(0, layer.offsetY);
                const lx1 = Math.min(width, layer.offsetX + layer.width);
                const ly1 = Math.min(height, layer.offsetY + layer.height);

                const layerData = layer.data;
                const layerW = layer.width;
                const layerOx = layer.offsetX;
                const layerOy = layer.offsetY;

                for (let dy = ly0; dy < ly1; dy++) {
                    const localY = dy - layerOy;
                    const localRowStart = localY * layerW - layerOx;
                    const docRowStart = dy * width;
                    for (let dx = lx0; dx < lx1; dx++) {
                        const colorIndex = layerData[localRowStart + dx];
                        if (colorIndex === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                        const [r, g, b] = palette.getColor(colorIndex);
                        // Mix pixel color with tint (50/50), then blend onto canvas
                        const tr = (r + tintR) >> 1;
                        const tg = (g + tintG) >> 1;
                        const tb = (b + tintB) >> 1;
                        const off = (docRowStart + dx) * 4;
                        const bgr = buf[off + 3] ? buf[off] : 0;
                        const bgg = buf[off + 3] ? buf[off + 1] : 0;
                        const bgb = buf[off + 3] ? buf[off + 2] : 0;
                        buf[off] = Math.round(tr * opacity + bgr * (1 - opacity));
                        buf[off + 1] = Math.round(tg * opacity + bgg * (1 - opacity));
                        buf[off + 2] = Math.round(tb * opacity + bgb * (1 - opacity));
                        buf[off + 3] = 255;
                    }
                }
            }
        }

        // Restore current layer state
        for (let i = 0; i < doc.layers.length && i < saved.length; i++) {
            const s = saved[i];
            doc.layers[i].data = s.data;
            doc.layers[i].opacity = s.opacity;
            doc.layers[i].textData = s.textData;
            doc.layers[i].offsetX = s.offsetX;
            doc.layers[i].offsetY = s.offsetY;
            doc.layers[i].width = s.width;
            doc.layers[i].height = s.height;
        }
    }

    _compositeTextLayer(layer, palette, buf, docW, docH) {
        const td = layer.textData;
        const [r, g, b] = palette.getColor(td.colorIndex);

        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = docW;
        tmpCanvas.height = docH;
        const ctx = tmpCanvas.getContext('2d');

        const style = (td.italic ? 'italic ' : '') + (td.bold ? 'bold ' : '');
        ctx.font = `${style}${td.fontSize}px ${td.fontFamily}`;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.textBaseline = 'top';

        const lines = td.text.split('\n');
        const lineHeight = Math.round(td.fontSize * 1.2);
        for (let li = 0; li < lines.length; li++) {
            const ty = layer.offsetY + li * lineHeight;
            ctx.fillText(lines[li], layer.offsetX, ty);
            if (td.underline) {
                const metrics = ctx.measureText(lines[li]);
                ctx.fillRect(layer.offsetX, ty + td.fontSize, metrics.width, 1);
            }
        }

        const tmpData = ctx.getImageData(0, 0, docW, docH).data;
        const layerOpacity = layer.opacity !== undefined ? layer.opacity : 1;
        if (td.antialiased) {
            // Map anti-aliased pixels to nearest palette color
            const colors = palette.colors;
            for (let i = 0; i < docW * docH; i++) {
                const off = i * 4;
                const a = tmpData[off + 3];
                if (a < 8) continue;
                // Blend text color with existing background, factoring in layer opacity
                const alpha = (a / 255) * layerOpacity;
                const br = buf[off + 3] ? buf[off] : 0;
                const bg = buf[off + 3] ? buf[off + 1] : 0;
                const bb = buf[off + 3] ? buf[off + 2] : 0;
                const mr = Math.round(r * alpha + br * (1 - alpha));
                const mg = Math.round(g * alpha + bg * (1 - alpha));
                const mb = Math.round(b * alpha + bb * (1 - alpha));
                // Find nearest palette color
                let bestDist = Infinity, bestIdx = 0;
                for (let j = 0; j < 256; j++) {
                    const [pr, pg, pb] = colors[j];
                    const dist = (mr - pr) ** 2 + (mg - pg) ** 2 + (mb - pb) ** 2;
                    if (dist < bestDist) { bestDist = dist; bestIdx = j; }
                    if (dist === 0) break;
                }
                const [fr, fg, fb] = colors[bestIdx];
                buf[off] = fr;
                buf[off + 1] = fg;
                buf[off + 2] = fb;
                buf[off + 3] = 255;
            }
        } else {
            const colors = palette.colors;
            for (let i = 0; i < docW * docH; i++) {
                const off = i * 4;
                if (tmpData[off + 3] < 128) continue;
                if (layerOpacity >= 1) {
                    buf[off] = r;
                    buf[off + 1] = g;
                    buf[off + 2] = b;
                    buf[off + 3] = 255;
                } else {
                    const br = buf[off + 3] ? buf[off] : 0;
                    const bg = buf[off + 3] ? buf[off + 1] : 0;
                    const bb = buf[off + 3] ? buf[off + 2] : 0;
                    const mr = Math.round(r * layerOpacity + br * (1 - layerOpacity));
                    const mg = Math.round(g * layerOpacity + bg * (1 - layerOpacity));
                    const mb = Math.round(b * layerOpacity + bb * (1 - layerOpacity));
                    let bestDist = Infinity, bestIdx = 0;
                    for (let j = 0; j < 256; j++) {
                        const [pr, pg, pb] = colors[j];
                        const dist = (mr - pr) ** 2 + (mg - pg) ** 2 + (mb - pb) ** 2;
                        if (dist < bestDist) { bestDist = dist; bestIdx = j; }
                        if (dist === 0) break;
                    }
                    const [fr, fg, fb] = colors[bestIdx];
                    buf[off] = fr;
                    buf[off + 1] = fg;
                    buf[off + 2] = fb;
                    buf[off + 3] = 255;
                }
            }
        }
    }
}


/***/ },

/***/ "./js/tools/BaseSelector.js"
/*!**********************************!*\
  !*** ./js/tools/BaseSelector.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseSelector: () => (/* binding */ BaseSelector)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");


const HANDLE_CURSORS = {
    'nw': 'nwse-resize', 'se': 'nwse-resize',
    'ne': 'nesw-resize', 'sw': 'nesw-resize',
    'n': 'ns-resize', 's': 'ns-resize',
    'e': 'ew-resize', 'w': 'ew-resize',
};

/**
 * Base class for selection tools (RectSelector, EllipseSelector).
 * Handles resize handles, move, modifier keys, and constrain-to-square.
 * Subclasses override _drawPreview() and _applySelection().
 */
class BaseSelector extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.showsResizeHandles = true;
        this._startX = null;
        this._startY = null;
        this._moving = false;
        this._resizing = false;
        this._resizeHandle = null;
        this._resizeBounds = null;
        this._selectionMode = 'replace'; // 'replace', 'add', 'subtract'
        this._hoveringSelection = false;
        this._hoverHandle = null;
        this._moveOrigBounds = null;
        this._moveAppliedDx = 0;
        this._moveAppliedDy = 0;
    }

    getCursor() {
        const handle = this._resizeHandle || this._hoverHandle;
        if (handle) return HANDLE_CURSORS[handle];
        return this._hoveringSelection || this._moving ? 'move' : 'crosshair';
    }

    onHover(x, y) {
        const sel = this.doc.selection;
        const handle = this.canvasView.hitTestResizeHandle();
        this._hoverHandle = handle;
        this._hoveringSelection = !handle && sel.active && !sel.hasFloating() && sel.isSelected(x, y);
    }

    onPointerDown(x, y, e) {
        const sel = this.doc.selection;

        // Determine selection mode from modifiers
        if (e.ctrlKey) {
            this._selectionMode = 'add';
        } else if (e.altKey) {
            this._selectionMode = 'subtract';
        } else {
            this._selectionMode = 'replace';
        }

        if (sel.hasFloating()) {
            sel.commitFloating(this.doc.getActiveLayer());
        }

        // Resize handles only in replace mode
        if (this._selectionMode === 'replace') {
            const handle = this.canvasView.hitTestResizeHandle();
            if (handle) {
                this._resizing = true;
                this._resizeHandle = handle;
                this._resizeBounds = sel.getBounds();
                sel.saveResizeSource();
                this._startX = x;
                this._startY = y;
                return;
            }

            // Move only in replace mode
            if (sel.active && sel.isSelected(x, y)) {
                this._moving = true;
                const b = sel.getBounds();
                if (b) {
                    this._moveOrigBounds = { left: b.minX, top: b.minY, right: b.maxX + 1, bottom: b.maxY + 1 };
                }
                this._moveAppliedDx = 0;
                this._moveAppliedDy = 0;
            }
        }

        this._startX = x;
        this._startY = y;
    }

    _computeResizeBounds(x, y, shift) {
        const b = this._resizeBounds;
        const h = this._resizeHandle;
        const dx = x - this._startX;
        const dy = y - this._startY;
        let minX = b.minX, minY = b.minY, maxX = b.maxX, maxY = b.maxY;
        if (h.includes('w')) minX = b.minX + dx;
        if (h.includes('e')) maxX = b.maxX + dx;
        if (h.includes('n')) minY = b.minY + dy;
        if (h.includes('s')) maxY = b.maxY + dy;
        let x0 = Math.min(minX, maxX);
        let y0 = Math.min(minY, maxY);
        let x1 = Math.max(minX, maxX);
        let y1 = Math.max(minY, maxY);
        if (shift) {
            const w = x1 - x0;
            const ht = y1 - y0;
            const side = Math.max(w, ht);
            if (h.length === 2) {
                // Corner handle: anchor opposite corner
                if (h.includes('e')) x1 = x0 + side; else x0 = x1 - side;
                if (h.includes('s')) y1 = y0 + side; else y0 = y1 - side;
            } else {
                // Edge handle: match the other axis, centered
                if (h === 'n' || h === 's') {
                    const cx = (x0 + x1) / 2;
                    x0 = Math.round(cx - ht / 2);
                    x1 = Math.round(cx + ht / 2);
                } else {
                    const cy = (y0 + y1) / 2;
                    y0 = Math.round(cy - w / 2);
                    y1 = Math.round(cy + w / 2);
                }
            }
        }
        return { x0, y0, x1, y1 };
    }

    _overlayColor() {
        return this._selectionMode === 'subtract' ? 'rgba(255, 80, 80, 0.8)' : 'rgba(0, 200, 255, 0.8)';
    }

    _constrainSquare(sx, sy, x, y) {
        const dx = x - sx;
        const dy = y - sy;
        const side = Math.max(Math.abs(dx), Math.abs(dy));
        return { x: sx + side * Math.sign(dx || 1), y: sy + side * Math.sign(dy || 1) };
    }

    /** Override in subclass to draw the resize preview shape. */
    _drawResizePreview(x0, y0, x1, y1) {
        this.canvasView.drawOverlayRect(x0, y0, x1, y1, this._overlayColor());
    }

    /** Override in subclass to draw the drag preview shape. */
    _drawDragPreview(startX, startY, x, y) {
        this.canvasView.drawOverlayRect(startX, startY, x, y, this._overlayColor());
    }

    /** Override in subclass to apply the final selection. */
    _applySelection(sel, minX, minY, maxX, maxY) {
        // subclass must implement
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;

        if (this._resizing) {
            const { x0, y0, x1, y1 } = this._computeResizeBounds(x, y, e.shiftKey);
            this.canvasView.clearOverlay();
            // _computeResizeBounds returns inclusive; preview methods expect exclusive end
            this._drawResizePreview(x0, y0, x1 + 1, y1 + 1);
            this.bus.emit('selection-preview-size', { w: Math.max(0, x1 - x0 + 1), h: Math.max(0, y1 - y0 + 1) });
            return;
        }

        if (this._moving) {
            let dx = x - this._startX;
            let dy = y - this._startY;
            // Snap selection edges to grid/guides
            if (this._moveOrigBounds) {
                const snap = this.canvasView.snapEdges({
                    left: this._moveOrigBounds.left + dx,
                    top: this._moveOrigBounds.top + dy,
                    right: this._moveOrigBounds.right + dx,
                    bottom: this._moveOrigBounds.bottom + dy,
                });
                dx += snap.dx;
                dy += snap.dy;
            }
            const incDx = dx - this._moveAppliedDx;
            const incDy = dy - this._moveAppliedDy;
            if (incDx !== 0 || incDy !== 0) {
                this.doc.selection.moveMask(incDx, incDy);
                this._moveAppliedDx = dx;
                this._moveAppliedDy = dy;
                this.canvasView.invalidateSelectionEdges();
                this.bus.emit('selection-changed');
            }
            return;
        }
        this.canvasView.clearOverlay();
        if (e.shiftKey) {
            ({ x, y } = this._constrainSquare(this._startX, this._startY, x, y));
        }
        this._drawDragPreview(this._startX, this._startY, x, y);
        this.bus.emit('selection-preview-size', {
            w: Math.abs(x - this._startX),
            h: Math.abs(y - this._startY),
        });
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;

        if (this._resizing) {
            const { x0, y0, x1, y1 } = this._computeResizeBounds(x, y, e.shiftKey);
            this._resizing = false;
            this._resizeHandle = null;
            this._resizeBounds = null;
            this._startX = null;
            this._startY = null;
            this.canvasView.clearOverlay();
            if (x1 > x0 && y1 > y0) {
                this.doc.selection.applyResize(x0, y0, x1, y1);
                this.canvasView.invalidateSelectionEdges();
                this.bus.emit('selection-changed');
            }
            return;
        }

        if (this._moving) {
            this._moving = false;
            this._startX = null;
            this._startY = null;
            return;
        }

        this.canvasView.clearOverlay();

        const x0 = this._startX;
        const y0 = this._startY;
        this._startX = null;
        this._startY = null;

        // Click with no drag = deselect (only in replace mode)
        if (x === x0 && y === y0) {
            if (this._selectionMode === 'replace') {
                const sel = this.doc.selection;
                if (sel.active) {
                    if (sel.hasFloating()) sel.commitFloating(this.doc.getActiveLayer());
                    sel.clear();
                    this.bus.emit('selection-changed');
                }
            }
            return;
        }

        if (e.shiftKey) {
            ({ x, y } = this._constrainSquare(x0, y0, x, y));
        }

        this._finishSelection(x0, y0, x, y);
        // Re-sync status bar in case _finishSelection early-returned (drag too small)
        this.bus.emit('selection-changed');
    }

    /** Convert drag coordinates to selection bounds and apply. Override for shape-specific bounds. */
    _finishSelection(x0, y0, x, y) {
        // Edge-based: coordinates are grid-line boundaries (exclusive end)
        const minX = Math.max(0, Math.min(x0, x));
        const minY = Math.max(0, Math.min(y0, y));
        const maxX = Math.min(this.doc.width, Math.max(x0, x));
        const maxY = Math.min(this.doc.height, Math.max(y0, y));

        // Convert exclusive end to inclusive for Selection model
        if (maxX - minX < 1 || maxY - minY < 1) return;

        const sel = this.doc.selection;
        this._applySelection(sel, minX, minY, maxX - 1, maxY - 1);
        this.canvasView.invalidateSelectionEdges();
        this.bus.emit('selection-changed');
    }
}


/***/ },

/***/ "./js/tools/BaseShapeTool.js"
/*!***********************************!*\
  !*** ./js/tools/BaseShapeTool.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseShapeTool: () => (/* binding */ BaseShapeTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");


/**
 * Base class for shape drawing tools (Rectangle, Filled Rect, Ellipse, Filled Ellipse).
 * Handles start/end tracking, Shift-to-constrain, and the preview/stamp lifecycle.
 * Subclasses override _drawShape(startX, startY, x, y, callback) to iterate pixels.
 */
class BaseShapeTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this._startX = null;
        this._startY = null;
    }

    onPointerDown(x, y, e) {
        this._startX = x;
        this._startY = y;
    }

    _constrain(x, y) {
        const dx = x - this._startX;
        const dy = y - this._startY;
        const side = Math.max(Math.abs(dx), Math.abs(dy));
        return { x: this._startX + side * Math.sign(dx || 1), y: this._startY + side * Math.sign(dy || 1) };
    }

    /** Override in subclass: iterate shape pixels and call callback(px, py). */
    _drawShape(startX, startY, x, y, callback) {
        // subclass must implement
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;
        if (e.shiftKey) ({ x, y } = this._constrain(x, y));
        this.canvasView.clearOverlay();
        this._drawShape(this._startX, this._startY, x, y, (px, py) => {
            this.previewBrush(px, py);
        });
    }

    onPointerUp(x, y, e) {
        if (this._startX === null) return;
        if (e.shiftKey) ({ x, y } = this._constrain(x, y));
        const layer = this.doc.getActiveLayer();
        if (!layer.locked) {
            this._drawShape(this._startX, this._startY, x, y, (px, py) => {
                this.stampBrush(layer, px, py);
            });
        }
        this._startX = null;
        this._startY = null;
        this.canvasView.clearOverlay();
    }
}


/***/ },

/***/ "./js/tools/BaseTool.js"
/*!******************************!*\
  !*** ./js/tools/BaseTool.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BaseTool: () => (/* binding */ BaseTool)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class BaseTool {
    constructor(doc, bus, canvasView) {
        this.doc = doc;
        this.bus = bus;
        this.canvasView = canvasView;
        this.name = 'base';
        this.icon = '';
        this.shortcut = '';
    }

    onPointerDown(x, y, e) {}
    onPointerMove(x, y, e) {}
    onPointerUp(x, y, e) {}

    onHover(x, y) {
        this.canvasView.drawBrushPreview(x, y);
    }

    getCursor() {
        return 'crosshair';
    }

    previewBrush(x, y) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;
        const { zoom, panX, panY } = this.canvasView;
        const ctx = this.canvasView.overlayCtx;

        for (let by = 0; by < brush.height; by++) {
            for (let bx = 0; bx < brush.width; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (docX < 0 || docX >= docW || docY < 0 || docY >= docH) continue;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const colorIndex = brush.isCaptured ? idx : this.doc.fgColorIndex;
                const [r, g, b] = this.doc.palette.getColor(colorIndex);
                ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
                ctx.fillRect(panX + docX * zoom, panY + docY * zoom, zoom, zoom);
            }
        }
    }

    stampBrush(layer, x, y, colorOverride) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;

        // Clamp brush footprint to document bounds
        const startBx = Math.max(0, -x + ox);
        const startBy = Math.max(0, -y + oy);
        const endBx = Math.min(brush.width, docW - x + ox);
        const endBy = Math.min(brush.height, docH - y + oy);

        if (startBx >= endBx || startBy >= endBy) return;

        // Pre-extend layer to cover the clamped brush footprint
        layer.ensureRect(
            x - ox + startBx, y - oy + startBy,
            x - ox + endBx - 1, y - oy + endBy - 1
        );

        for (let by = startBy; by < endBy; by++) {
            for (let bx = startBx; bx < endBx; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const colorIndex = brush.isCaptured ? idx : (colorOverride !== undefined ? colorOverride : this.doc.fgColorIndex);
                layer.setPixelAutoExtend(docX, docY, colorIndex);
            }
        }
    }
}


/***/ },

/***/ "./js/tools/BrushTool.js"
/*!*******************************!*\
  !*** ./js/tools/BrushTool.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BrushTool: () => (/* binding */ BrushTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");



class BrushTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Brush';
        this.shortcut = 'B';
        this.icon = 'images/icon-brush.svg';
        this._startX = null;
        this._startY = null;
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
        this._color = undefined;
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (layer.locked) return;
        this.canvasView.clearOverlay();
        this._lineMode = e.shiftKey;
        this._color = e.button === 2 ? this.doc.bgColorIndex : undefined;
        if (this._lineMode) {
            this._startX = x;
            this._startY = y;
        } else {
            this._lastX = x;
            this._lastY = y;            
            this.stampBrush(layer, x, y, this._color);
        }
    }

    _snapEnd(x, y, e) {
        if (e.ctrlKey) {
            return (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.snapEndpoint)(this._startX, this._startY, x, y);
        }
        return { x, y };
    }

    onPointerMove(x, y, e) {
        if (this._lineMode) {
            if (this._startX === null) return;
            const end = this._snapEnd(x, y, e);
            this.canvasView.clearOverlay();
            (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.bresenhamLine)(this._startX, this._startY, end.x, end.y, (px, py) => {
                this.previewBrush(px, py);
            });
            return;
        }
        const layer = this.doc.getActiveLayer();
        if (layer.locked || this._lastX === null) return;

        // Interpolate from last position to current using Bresenham
        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.bresenhamLine)(this._lastX, this._lastY, x, y, (px, py) => {
            this.stampBrush(layer, px, py, this._color);
        });

        this._lastX = x;
        this._lastY = y;
    }

    onPointerUp(x, y, e) {
        if (this._lineMode && this._startX !== null) {
            if (this._startX === null) return;
            const end = this._snapEnd(x, y, e);
            const layer = this.doc.getActiveLayer();
            if (!layer.locked) {
                (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.bresenhamLine)(this._startX, this._startY, end.x, end.y, (px, py) => {
                    this.stampBrush(layer, px, py, this._color);
                });
            }
            this.canvasView.clearOverlay();
        }
        this._startX = null;
        this._startY = null;
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
    }
}


/***/ },

/***/ "./js/tools/ColorPickerTool.js"
/*!*************************************!*\
  !*** ./js/tools/ColorPickerTool.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorPickerTool: () => (/* binding */ ColorPickerTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");



class ColorPickerTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Color Picker';
        this.shortcut = 'I';
        this.icon = 'images/icon-colorpicker.svg';
    }

    onHover() {} // no brush preview

    onPointerDown(x, y, e) {
        this._pick(x, y, e);
    }

    onPointerMove(x, y, e) {
        // Allow drag-picking
        if (e.buttons > 0) {
            this._pick(x, y, e);
        }
    }

    onPointerUp(x, y, e) {}

    _pick(x, y, e) {
        if (x < 0 || x >= this.doc.width || y < 0 || y >= this.doc.height) return;

        // Sample from merged visible layers, top-to-bottom
        let index = _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT;
        for (let i = this.doc.layers.length - 1; i >= 0; i--) {
            const layer = this.doc.layers[i];
            if (!layer.visible) continue;
            const px = layer.getPixelDoc(x, y);
            if (px !== _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT) { index = px; break; }
        }
        if (index === _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT) return;

        if (e.button === 2 || e.buttons === 2) {
            this.doc.bgColorIndex = index;
            this.bus.emit('bg-color-changed');
        } else {
            this.doc.fgColorIndex = index;
            this.bus.emit('fg-color-changed');
        }
    }
}


/***/ },

/***/ "./js/tools/EllipseSelector.js"
/*!*************************************!*\
  !*** ./js/tools/EllipseSelector.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EllipseSelector: () => (/* binding */ EllipseSelector)
/* harmony export */ });
/* harmony import */ var _BaseSelector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseSelector.js */ "./js/tools/BaseSelector.js");


class EllipseSelector extends _BaseSelector_js__WEBPACK_IMPORTED_MODULE_0__.BaseSelector {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Ellipse Select';
        this.shortcut = 'Shift+M';
        this.icon = 'images/icon-ellipseselect.svg';
    }

    _drawResizePreview(x0, y0, x1, y1) {
        if (this.doc.selection._pureShape === 'ellipse') {
            this._drawEllipse(x0, y0, x1, y1);
        } else {
            this.canvasView.drawOverlayRect(x0, y0, x1, y1, this._overlayColor());
        }
    }

    _drawDragPreview(startX, startY, x, y) {
        const minX = Math.min(startX, x);
        const minY = Math.min(startY, y);
        const maxX = Math.max(startX, x);
        const maxY = Math.max(startY, y);
        this._drawEllipse(minX, minY, maxX, maxY);
    }

    _drawEllipse(x0, y0, x1, y1) {
        const cx = (x0 + x1) / 2;
        const cy = (y0 + y1) / 2;
        const rx = (x1 - x0) / 2;
        const ry = (y1 - y0) / 2;
        if (rx > 0 && ry > 0) {
            this.canvasView.drawOverlayEllipse(cx, cy, rx, ry, this._overlayColor());
        }
    }

    _finishSelection(x0, y0, x, y) {
        // Edge-based: convert exclusive end to inclusive for Selection model
        const minX = Math.min(x0, x);
        const minY = Math.min(y0, y);
        const maxX = Math.max(x0, x) - 1;
        const maxY = Math.max(y0, y) - 1;
        if (maxX < minX || maxY < minY) return;

        const sel = this.doc.selection;
        this._applySelection(sel, minX, minY, maxX, maxY);
        this.canvasView.invalidateSelectionEdges();
        this.bus.emit('selection-changed');
    }

    _applySelection(sel, minX, minY, maxX, maxY) {
        if (this._selectionMode === 'add') {
            sel.addEllipse(minX, minY, maxX, maxY);
        } else if (this._selectionMode === 'subtract') {
            sel.subtractEllipse(minX, minY, maxX, maxY);
        } else {
            sel.selectEllipse(minX, minY, maxX, maxY);
        }
    }
}


/***/ },

/***/ "./js/tools/EllipseTool.js"
/*!*********************************!*\
  !*** ./js/tools/EllipseTool.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EllipseTool: () => (/* binding */ EllipseTool)
/* harmony export */ });
/* harmony import */ var _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseShapeTool.js */ "./js/tools/BaseShapeTool.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");



class EllipseTool extends _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseShapeTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Ellipse';
        this.shortcut = 'O';
        this.icon = 'images/icon-ellipse.svg';
    }

    _drawShape(startX, startY, x, y, callback) {
        const cx = Math.round((startX + x) / 2);
        const cy = Math.round((startY + y) / 2);
        const rx = Math.round(Math.abs(x - startX) / 2);
        const ry = Math.round(Math.abs(y - startY) / 2);
        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.ellipseOutline)(cx, cy, rx, ry, callback);
    }
}


/***/ },

/***/ "./js/tools/EraserTool.js"
/*!********************************!*\
  !*** ./js/tools/EraserTool.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EraserTool: () => (/* binding */ EraserTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");




class EraserTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Eraser';
        this.shortcut = 'E';
        this.icon = 'images/icon-eraser.svg';
        this._lastX = null;
        this._lastY = null;
        this._lineMode = false;
        this._startX = null;
        this._startY = null;
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (layer.locked) return;
        this._lineMode = e.shiftKey;
        if (this._lineMode) {
            this._startX = x;
            this._startY = y;
        } else {
            this._lastX = x;
            this._lastY = y;
            this._eraseBrush(layer, x, y);
        }
    }

    onPointerMove(x, y, e) {
        if (this._lineMode) {
            if (this._startX === null) return;
            const end = e.ctrlKey ? (0,_util_math_js__WEBPACK_IMPORTED_MODULE_2__.snapEndpoint)(this._startX, this._startY, x, y) : { x, y };
            this.canvasView.clearOverlay();
            (0,_util_math_js__WEBPACK_IMPORTED_MODULE_2__.bresenhamLine)(this._startX, this._startY, end.x, end.y, (px, py) => {
                this.previewBrush(px, py);
            });
            return;
        }
        const layer = this.doc.getActiveLayer();
        if (layer.locked || this._lastX === null) return;

        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_2__.bresenhamLine)(this._lastX, this._lastY, x, y, (px, py) => {
            this._eraseBrush(layer, px, py);
        });

        this._lastX = x;
        this._lastY = y;
    }

    onPointerUp(x, y, e) {
        if (this._lineMode && this._startX !== null) {
            const layer = this.doc.getActiveLayer();
            if (!layer.locked) {
                const end = e.ctrlKey ? (0,_util_math_js__WEBPACK_IMPORTED_MODULE_2__.snapEndpoint)(this._startX, this._startY, x, y) : { x, y };
                (0,_util_math_js__WEBPACK_IMPORTED_MODULE_2__.bresenhamLine)(this._startX, this._startY, end.x, end.y, (px, py) => {
                    this._eraseBrush(layer, px, py);
                });
            }
            this.canvasView.clearOverlay();
        }
        this._lastX = null;
        this._lastY = null;
        this._startX = null;
        this._startY = null;
        this._lineMode = false;
    }

    _eraseBrush(layer, x, y) {
        const brush = this.doc.activeBrush;
        const ox = brush.originX;
        const oy = brush.originY;
        const docW = this.doc.width;
        const docH = this.doc.height;

        const startBx = Math.max(0, -x + ox);
        const startBy = Math.max(0, -y + oy);
        const endBx = Math.min(brush.width, docW - x + ox);
        const endBy = Math.min(brush.height, docH - y + oy);

        for (let by = startBy; by < endBy; by++) {
            for (let bx = startBx; bx < endBx; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT) continue;
                const docX = x + bx - ox;
                const docY = y + by - oy;
                if (this.doc.selection.active && !this.doc.selection.isSelected(docX, docY)) continue;
                const lx = docX - layer.offsetX;
                const ly = docY - layer.offsetY;
                layer.setPixel(lx, ly, _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT);
            }
        }
    }
}


/***/ },

/***/ "./js/tools/FillTool.js"
/*!******************************!*\
  !*** ./js/tools/FillTool.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FillTool: () => (/* binding */ FillTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");



class FillTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Fill';
        this.shortcut = 'G';
        this.icon = 'images/icon-fill.svg';
    }

    onHover() {} // no brush preview

    getCursor() {
        return 'crosshair';
    }

    onPointerDown(x, y, e) {
        const layer = this.doc.getActiveLayer();
        if (!layer) return;
        const docW = this.doc.width;
        const docH = this.doc.height;
        if (x < 0 || x >= docW || y < 0 || y >= docH) return;

        const sel = this.doc.selection;
        if (sel.active && !sel.isSelected(x, y)) return;

        const fillColor = e.button === 2 ? this.doc.bgColorIndex : this.doc.fgColorIndex;
        const targetColor = layer.getPixelDoc(x, y);
        if (targetColor === fillColor) return;

        // Flood fill using a queue
        const visited = new Uint8Array(docW * docH);
        const queue = [x, y];
        visited[y * docW + x] = 1;

        while (queue.length > 0) {
            const py = queue.pop();
            const px = queue.pop();

            layer.setPixelAutoExtend(px, py, fillColor);

            const neighbors = [[px - 1, py], [px + 1, py], [px, py - 1], [px, py + 1]];
            for (const [nx, ny] of neighbors) {
                if (nx < 0 || nx >= docW || ny < 0 || ny >= docH) continue;
                if (visited[ny * docW + nx]) continue;
                if (sel.active && !sel.isSelected(nx, ny)) continue;
                if (layer.getPixelDoc(nx, ny) !== targetColor) continue;
                visited[ny * docW + nx] = 1;
                queue.push(nx, ny);
            }
        }
    }
}


/***/ },

/***/ "./js/tools/FilledEllipseTool.js"
/*!***************************************!*\
  !*** ./js/tools/FilledEllipseTool.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FilledEllipseTool: () => (/* binding */ FilledEllipseTool)
/* harmony export */ });
/* harmony import */ var _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseShapeTool.js */ "./js/tools/BaseShapeTool.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");



class FilledEllipseTool extends _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseShapeTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Filled Ellipse';
        this.shortcut = 'Shift+O';
        this.icon = 'images/icon-filledellipse.svg';
    }

    _drawShape(startX, startY, x, y, callback) {
        const cx = Math.round((startX + x) / 2);
        const cy = Math.round((startY + y) / 2);
        const rx = Math.round(Math.abs(x - startX) / 2);
        const ry = Math.round(Math.abs(y - startY) / 2);
        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.ellipseFilled)(cx, cy, rx, ry, callback);
    }
}


/***/ },

/***/ "./js/tools/FilledRectTool.js"
/*!************************************!*\
  !*** ./js/tools/FilledRectTool.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FilledRectTool: () => (/* binding */ FilledRectTool)
/* harmony export */ });
/* harmony import */ var _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseShapeTool.js */ "./js/tools/BaseShapeTool.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");



class FilledRectTool extends _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseShapeTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Filled Rect';
        this.shortcut = 'Shift+U';
        this.icon = 'images/icon-filledrect.svg';
    }

    _drawShape(startX, startY, x, y, callback) {
        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.rectFilled)(startX, startY, x, y, callback);
    }
}


/***/ },

/***/ "./js/tools/FreeTransformTool.js"
/*!***************************************!*\
  !*** ./js/tools/FreeTransformTool.js ***!
  \***************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FreeTransformTool: () => (/* binding */ FreeTransformTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");



const HANDLE_CURSORS = {
    'nw': 'nwse-resize', 'se': 'nwse-resize',
    'ne': 'nesw-resize', 'sw': 'nesw-resize',
    'n': 'ns-resize', 's': 'ns-resize',
    'e': 'ew-resize', 'w': 'ew-resize',
};

const ROTATE_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'>` +
    `<path d='M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round'/>` +
    `<path d='M12 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round'/>` +
    `<path d='M12 1l3 3-3 3' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/>` +
    `<path d='M12 1l3 3-3 3' fill='none' stroke='black' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/>` +
    `</svg>`
)}") 12 12, crosshair`;

class FreeTransformTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Free Transform';
        this.shortcut = 'T';
        this.icon = 'images/icon-freetransform.svg';
        this._active = false;
        this._previousToolName = null;
        this._sourceFloating = null; // backup for cancel
        this._transform = null; // { tx, ty, sx, sy, rotation, cx, cy }
        this._dragMode = null; // 'move', 'resize', 'rotate'
        this._resizeHandle = null;
        this._startX = 0;
        this._startY = 0;
        this._startTransform = null;
        this._startAngle = 0;
        this._hoverMode = null; // 'move', handle id, 'rotate'
    }

    get isTransformActive() {
        return this._active;
    }

    getCursor() {
        if (this._dragMode === 'rotate' || this._hoverMode === 'rotate') return ROTATE_CURSOR;
        if (this._dragMode === 'move' || this._hoverMode === 'move') return 'move';
        const handle = this._resizeHandle || this._hoverMode;
        if (handle && HANDLE_CURSORS[handle]) return HANDLE_CURSORS[handle];
        return 'crosshair';
    }

    activate(previousToolName, undoManager) {
        const sel = this.doc.selection;
        if (!sel.active) return false;

        this._previousToolName = previousToolName;
        this._undoManager = undoManager;

        undoManager.beginOperation();

        // Lift to floating if not already
        if (!sel.hasFloating()) {
            sel.liftPixels(this.doc.getActiveLayer());
        }

        // Backup floating data for cancel
        const f = sel.floating;
        this._sourceFloating = {
            data: new Uint16Array(f.data),
            mask: new Uint8Array(f.mask),
            width: f.width, height: f.height,
            originX: f.originX, originY: f.originY,
        };

        // Initialize transform
        this._transform = {
            tx: 0, ty: 0,
            sx: 1, sy: 1,
            rotation: 0,
            cx: f.originX + f.width / 2,
            cy: f.originY + f.height / 2,
        };

        // Set transform on selection for renderer
        sel.floatingTransform = this._transform;

        this._active = true;
        this.bus.emit('selection-changed');
        return true;
    }

    commit() {
        if (!this._active) return;
        const sel = this.doc.selection;
        const t = this._transform;

        // Rasterize transformed pixels
        this._rasterize();

        // Clear transform and commit
        sel.floatingTransform = null;
        sel.commitFloating(this.doc.getActiveLayer());
        this._undoManager.endOperation();

        this._active = false;
        this._transform = null;
        this._sourceFloating = null;
        this.bus.emit('selection-changed');

        // Restore previous tool
        this.bus.emit('switch-tool', this._previousToolName);
    }

    cancel() {
        if (!this._active) return;
        const sel = this.doc.selection;

        // Restore original floating data
        const src = this._sourceFloating;
        sel.floating = {
            data: new Uint16Array(src.data),
            mask: new Uint8Array(src.mask),
            width: src.width, height: src.height,
            originX: src.originX, originY: src.originY,
        };
        sel.floatingTransform = null;
        sel.commitFloating(this.doc.getActiveLayer());
        this._undoManager.endOperation();

        this._active = false;
        this._transform = null;
        this._sourceFloating = null;
        this.bus.emit('selection-changed');

        this.bus.emit('switch-tool', this._previousToolName);
    }

    _rasterize() {
        const sel = this.doc.selection;
        const f = sel.floating;
        const t = this._transform;
        const src = this._sourceFloating;

        // Compute transformed corners of the source rect
        const corners = [
            [src.originX, src.originY],
            [src.originX + src.width, src.originY],
            [src.originX + src.width, src.originY + src.height],
            [src.originX, src.originY + src.height],
        ];

        const cos = Math.cos(t.rotation);
        const sin = Math.sin(t.rotation);

        const transformed = corners.map(([x, y]) => {
            const dx = (x - t.cx) * t.sx;
            const dy = (y - t.cy) * t.sy;
            return [
                t.cx + t.tx + dx * cos - dy * sin,
                t.cy + t.ty + dx * sin + dy * cos,
            ];
        });

        // Bounding box of transformed corners
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const [x, y] of transformed) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
        minX = Math.floor(minX);
        minY = Math.floor(minY);
        maxX = Math.ceil(maxX);
        maxY = Math.ceil(maxY);

        const nw = maxX - minX;
        const nh = maxY - minY;
        if (nw <= 0 || nh <= 0) return;

        const newData = new Uint16Array(nw * nh);
        const newMask = new Uint8Array(nw * nh);
        newData.fill(_constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT);

        // Inverse transform: for each destination pixel, find source pixel
        const invCos = Math.cos(-t.rotation);
        const invSin = Math.sin(-t.rotation);
        const invSx = 1 / t.sx;
        const invSy = 1 / t.sy;

        for (let dy = 0; dy < nh; dy++) {
            for (let dx = 0; dx < nw; dx++) {
                const docX = minX + dx;
                const docY = minY + dy;

                // Undo translate
                const rx = docX - t.cx - t.tx;
                const ry = docY - t.cy - t.ty;

                // Undo rotate
                const urx = rx * invCos - ry * invSin;
                const ury = rx * invSin + ry * invCos;

                // Undo scale
                const srcX = urx * invSx + t.cx;
                const srcY = ury * invSy + t.cy;

                // Nearest-neighbor sample from source
                const sx = Math.round(srcX) - src.originX;
                const sy = Math.round(srcY) - src.originY;

                if (sx < 0 || sx >= src.width || sy < 0 || sy >= src.height) continue;
                if (!src.mask[sy * src.width + sx]) continue;

                newData[dy * nw + dx] = src.data[sy * src.width + sx];
                newMask[dy * nw + dx] = 1;
            }
        }

        // Replace floating with rasterized result
        sel.floating = {
            data: newData, mask: newMask,
            width: nw, height: nh,
            originX: minX, originY: minY,
        };
    }

    // --- Bounding box / handle computation ---

    _getTransformedCorners() {
        const src = this._sourceFloating;
        const t = this._transform;
        if (!src || !t) return null;

        const corners = [
            [src.originX, src.originY],
            [src.originX + src.width, src.originY],
            [src.originX + src.width, src.originY + src.height],
            [src.originX, src.originY + src.height],
        ];

        const cos = Math.cos(t.rotation);
        const sin = Math.sin(t.rotation);

        return corners.map(([x, y]) => {
            const dx = (x - t.cx) * t.sx;
            const dy = (y - t.cy) * t.sy;
            return [
                t.cx + t.tx + dx * cos - dy * sin,
                t.cy + t.ty + dx * sin + dy * cos,
            ];
        });
    }

    _getHandlePositions() {
        const c = this._getTransformedCorners();
        if (!c) return null;
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        return [
            { id: 'nw', pos: c[0] },
            { id: 'n',  pos: mid(c[0], c[1]) },
            { id: 'ne', pos: c[1] },
            { id: 'e',  pos: mid(c[1], c[2]) },
            { id: 'se', pos: c[2] },
            { id: 's',  pos: mid(c[2], c[3]) },
            { id: 'sw', pos: c[3] },
            { id: 'w',  pos: mid(c[3], c[0]) },
        ];
    }

    _hitTest(docX, docY) {
        const handles = this._getHandlePositions();
        if (!handles) return null;

        const { zoom, panX, panY } = this.canvasView;
        const screenX = this.canvasView._lastScreenX;
        const screenY = this.canvasView._lastScreenY;

        // Check resize handles first
        for (const h of handles) {
            const hx = panX + h.pos[0] * zoom;
            const hy = panY + h.pos[1] * zoom;
            if (Math.abs(screenX - hx) <= 5 && Math.abs(screenY - hy) <= 5) {
                return h.id;
            }
        }

        // Check rotation zones (near corners but outside)
        const cornerHandles = handles.filter(h => ['nw', 'ne', 'se', 'sw'].includes(h.id));
        for (const h of cornerHandles) {
            const hx = panX + h.pos[0] * zoom;
            const hy = panY + h.pos[1] * zoom;
            if (Math.abs(screenX - hx) <= 15 && Math.abs(screenY - hy) <= 15) {
                return 'rotate';
            }
        }

        // Check if inside the transformed box (point-in-polygon)
        const corners = this._getTransformedCorners();
        if (this._pointInQuad(docX, docY, corners)) {
            return 'move';
        }

        return null;
    }

    _pointInQuad(px, py, corners) {
        // Cross product test for convex quad
        let sign = 0;
        for (let i = 0; i < 4; i++) {
            const [x1, y1] = corners[i];
            const [x2, y2] = corners[(i + 1) % 4];
            const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1);
            if (cross !== 0) {
                if (sign === 0) sign = cross > 0 ? 1 : -1;
                else if ((cross > 0 ? 1 : -1) !== sign) return false;
            }
        }
        return true;
    }

    onHover(x, y) {
        if (!this._active) return;
        this._hoverMode = this._hitTest(x, y);
    }

    onPointerDown(x, y, e) {
        if (!this._active) return;
        const hit = this._hitTest(x, y);
        if (!hit) return;

        this._dragMode = hit === 'move' ? 'move' :
                         hit === 'rotate' ? 'rotate' : 'resize';
        this._resizeHandle = (this._dragMode === 'resize') ? hit : null;
        this._startX = x;
        this._startY = y;
        this._startTransform = { ...this._transform };

        if (this._dragMode === 'rotate') {
            const t = this._transform;
            this._startAngle = Math.atan2(y - (t.cy + t.ty), x - (t.cx + t.tx));
        }
    }

    onPointerMove(x, y, e) {
        if (!this._active || !this._dragMode) return;

        const t = this._transform;
        const st = this._startTransform;

        if (this._dragMode === 'move') {
            t.tx = st.tx + (x - this._startX);
            t.ty = st.ty + (y - this._startY);
        } else if (this._dragMode === 'rotate') {
            const angle = Math.atan2(y - (st.cy + st.ty), x - (st.cx + st.tx));
            let newRotation = st.rotation + (angle - this._startAngle);
            if (e.ctrlKey) {
                const snap = 22.5 * Math.PI / 180;
                newRotation = Math.round(newRotation / snap) * snap;
            }
            t.rotation = newRotation;
        } else if (this._dragMode === 'resize') {
            this._applyResize(x, y, e);
        }

        this.doc.selection.floatingTransform = this._transform;
    }

    _applyResize(x, y, e) {
        const st = this._startTransform;
        const t = this._transform;
        const h = this._resizeHandle;
        const src = this._sourceFloating;

        // Work in the rotated coordinate frame
        const cos = Math.cos(-st.rotation);
        const sin = Math.sin(-st.rotation);
        const cx = st.cx + st.tx;
        const cy = st.cy + st.ty;

        // Current mouse in rotated frame
        const rdx = (x - cx) * cos - (y - cy) * sin;
        const rdy = (x - cx) * sin + (y - cy) * cos;

        // Start mouse in rotated frame
        const rsx = (this._startX - cx) * cos - (this._startY - cy) * sin;
        const rsy = (this._startX - cx) * sin + (this._startY - cy) * cos;

        // Half-dimensions in rotated frame
        const halfW = (src.width / 2) * st.sx;
        const halfH = (src.height / 2) * st.sy;

        let sx = st.sx;
        let sy = st.sy;

        if (h.includes('e')) {
            sx = st.sx * (halfW + (rdx - rsx)) / halfW;
        }
        if (h.includes('w')) {
            sx = st.sx * (halfW - (rdx - rsx)) / halfW;
        }
        if (h.includes('s')) {
            sy = st.sy * (halfH + (rdy - rsy)) / halfH;
        }
        if (h.includes('n')) {
            sy = st.sy * (halfH - (rdy - rsy)) / halfH;
        }

        // Prevent zero/negative scale
        if (Math.abs(sx) < 0.01) sx = 0.01 * Math.sign(sx || 1);
        if (Math.abs(sy) < 0.01) sy = 0.01 * Math.sign(sy || 1);

        if (e.shiftKey) {
            // Proportional scaling
            const avgScale = (Math.abs(sx) + Math.abs(sy)) / 2;
            sx = avgScale * Math.sign(sx);
            sy = avgScale * Math.sign(sy);
        }

        t.sx = sx;
        t.sy = sy;
    }

    onPointerUp(x, y, e) {
        this._dragMode = null;
        this._resizeHandle = null;
    }

    // --- Drawing ---

    drawTransformBox(ctx, zoom, panX, panY) {
        if (!this._active) return;

        const corners = this._getTransformedCorners();
        if (!corners) return;

        // Draw rotated bounding box
        ctx.strokeStyle = 'rgba(0, 200, 255, 0.9)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
            const [x, y] = corners[i];
            const sx = panX + x * zoom;
            const sy = panY + y * zoom;
            if (i === 0) ctx.moveTo(sx + 0.5, sy + 0.5);
            else ctx.lineTo(sx + 0.5, sy + 0.5);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw handles
        const handles = this._getHandlePositions();
        const size = 7;
        const half = Math.floor(size / 2);
        for (const h of handles) {
            const hx = panX + h.pos[0] * zoom;
            const hy = panY + h.pos[1] * zoom;
            ctx.fillStyle = '#fff';
            ctx.fillRect(hx - half, hy - half, size, size);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(hx - half + 0.5, hy - half + 0.5, size - 1, size - 1);
        }
    }
}


/***/ },

/***/ "./js/tools/MirrorTool.js"
/*!********************************!*\
  !*** ./js/tools/MirrorTool.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MirrorTool: () => (/* binding */ MirrorTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");



class MirrorTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Mirror';
        this.shortcut = 'Ctrl+M';
        this.icon = 'images/icon-mirror.svg';
        this._shiftDown = false;
        this._onKeyDown = (e) => { if (e.key === 'Shift') { this._shiftDown = true; this._updateCursor(); } };
        this._onKeyUp = (e) => { if (e.key === 'Shift') { this._shiftDown = false; this._updateCursor(); } };
    }

    onHover() {} // no brush preview

    activate() {
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        this._shiftDown = false;
    }

    deactivate() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        this._shiftDown = false;
        // Commit any pending floating mirror on tool switch
        this._commitFloating();
    }

    getCursor() {
        return this._shiftDown ? 'ns-resize' : 'ew-resize';
    }

    _updateCursor() {
        this.canvasView._updateCursor();
    }

    _commitFloating() {
        const sel = this.doc.selection;
        if (sel.hasFloating()) {
            sel.commitFloating(this.doc.getActiveLayer());
            this.canvasView.invalidateSelectionEdges();
            this.bus.emit('layer-changed');
            this.bus.emit('selection-changed');
        }
    }

    onPointerDown(x, y, e) {
        const vertical = this._shiftDown;
        const sel = this.doc.selection;
        const layer = this.doc.getActiveLayer();
        if (!layer) return;

        if (sel.active) {
            // Click outside selection → commit and done
            if (!sel.hasFloating() && !sel.isSelected(x, y)) {
                return;
            }
            if (sel.hasFloating()) {
                // Clicking outside floating → commit
                const f = sel.floating;
                const inFloating = x >= f.originX && x < f.originX + f.width &&
                                   y >= f.originY && y < f.originY + f.height;
                if (!inFloating) {
                    this._commitFloating();
                    return;
                }
                // Clicking inside floating → flip the existing floating again (no commit/re-lift)
                this._flipFloating(f, vertical);
                this.canvasView.invalidateSelectionEdges();
            } else {
                this._mirrorSelection(layer, sel, vertical);
            }
        } else {
            this._mirrorFullImage(vertical);
        }

        this.bus.emit('layer-changed');
        this.bus.emit('selection-changed');
    }

    _mirrorSelection(layer, sel, vertical) {
        // Lift pixels into floating selection, then flip
        sel.liftPixels(layer);
        if (!sel.hasFloating()) return;
        this._flipFloating(sel.floating, vertical);
        this.canvasView.invalidateSelectionEdges();
    }

    _flipFloating(f, vertical) {
        const w = f.width;
        const h = f.height;
        if (vertical) {
            for (let row = 0; row < Math.floor(h / 2); row++) {
                for (let col = 0; col < w; col++) {
                    const topIdx = row * w + col;
                    const botIdx = (h - 1 - row) * w + col;
                    const tmpD = f.data[topIdx]; f.data[topIdx] = f.data[botIdx]; f.data[botIdx] = tmpD;
                    const tmpM = f.mask[topIdx]; f.mask[topIdx] = f.mask[botIdx]; f.mask[botIdx] = tmpM;
                }
            }
        } else {
            for (let row = 0; row < h; row++) {
                for (let col = 0; col < Math.floor(w / 2); col++) {
                    const leftIdx = row * w + col;
                    const rightIdx = row * w + (w - 1 - col);
                    const tmpD = f.data[leftIdx]; f.data[leftIdx] = f.data[rightIdx]; f.data[rightIdx] = tmpD;
                    const tmpM = f.mask[leftIdx]; f.mask[leftIdx] = f.mask[rightIdx]; f.mask[rightIdx] = tmpM;
                }
            }
        }
    }

    _mirrorFullImage(vertical) {
        // Mirror all layers
        for (const layer of this.doc.layers) {
            const { width, height, data } = layer;
            if (vertical) {
                for (let row = 0; row < Math.floor(height / 2); row++) {
                    for (let col = 0; col < width; col++) {
                        const topIdx = row * width + col;
                        const botIdx = (height - 1 - row) * width + col;
                        const tmp = data[topIdx];
                        data[topIdx] = data[botIdx];
                        data[botIdx] = tmp;
                    }
                }
            } else {
                for (let row = 0; row < height; row++) {
                    for (let col = 0; col < Math.floor(width / 2); col++) {
                        const leftIdx = row * width + col;
                        const rightIdx = row * width + (width - 1 - col);
                        const tmp = data[leftIdx];
                        data[leftIdx] = data[rightIdx];
                        data[rightIdx] = tmp;
                    }
                }
            }
        }
    }
}


/***/ },

/***/ "./js/tools/MoveTool.js"
/*!******************************!*\
  !*** ./js/tools/MoveTool.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MoveTool: () => (/* binding */ MoveTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");


class MoveTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Move';
        this.shortcut = 'V';
        this.icon = 'images/icon-move.svg';
        this._startX = null;
        this._startY = null;
        this._origOffsets = [];
        this._movingSelection = false;
        this._contentBounds = null;
    }

    onHover() {} // no brush preview

    getCursor() {
        return 'grab';
    }

    onPointerDown(x, y, e) {
        const sel = this.doc.selection;
        const layer = this.doc.getActiveLayer();

        if (sel.active && this.doc.selectedLayerIndices.size < 2) {
            // Lift pixels if not already floating
            if (!sel.hasFloating()) {
                sel.liftPixels(layer);
                this.canvasView.invalidateSelectionEdges();
                this.bus.emit('selection-changed');
            }
            this._movingSelection = true;
            this._startX = x;
            this._startY = y;
            this._origOffsets = [{ ox: sel.floating.originX, oy: sel.floating.originY }];
            return;
        }

        this._movingSelection = false;
        this._startX = x;
        this._startY = y;

        // Store original offsets for all selected layers
        this._origOffsets = [];
        for (const idx of this.doc.selectedLayerIndices) {
            const l = this.doc.layers[idx];
            if (l && !l.locked) {
                this._origOffsets.push({ idx, ox: l.offsetX, oy: l.offsetY });
            }
        }

        // Compute merged content bounds for edge snapping
        this._contentBounds = null;
        if (this._origOffsets.length > 0) {
            let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
            for (const entry of this._origOffsets) {
                const bounds = this.doc.layers[entry.idx].getContentBounds();
                if (bounds) {
                    left = Math.min(left, bounds.left);
                    top = Math.min(top, bounds.top);
                    right = Math.max(right, bounds.right);
                    bottom = Math.max(bottom, bounds.bottom);
                }
            }
            if (left < Infinity) this._contentBounds = { left, top, right, bottom };
        }
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;
        let dx = x - this._startX;
        let dy = y - this._startY;

        if (this._movingSelection) {
            const sel = this.doc.selection;
            if (!sel.hasFloating()) return;
            sel.moveFloating(this._origOffsets[0].ox + dx, this._origOffsets[0].oy + dy);
            this.canvasView.invalidateSelectionEdges();
            return;
        }

        // Snap layer content edges to grid/guides
        if (this._contentBounds) {
            const snap = this.canvasView.snapEdges({
                left: this._contentBounds.left + dx,
                top: this._contentBounds.top + dy,
                right: this._contentBounds.right + dx,
                bottom: this._contentBounds.bottom + dy,
            });
            dx += snap.dx;
            dy += snap.dy;
        }

        for (const entry of this._origOffsets) {
            const l = this.doc.layers[entry.idx];
            if (l) {
                l.offsetX = entry.ox + dx;
                l.offsetY = entry.oy + dy;
            }
        }
    }

    onPointerUp(x, y, e) {
        if (this._movingSelection) {
            const sel = this.doc.selection;
            if (x < 0 || x >= this.doc.width || y < 0 || y >= this.doc.height) {
                if (sel.hasFloating()) {
                    sel.commitFloating(this.doc.getActiveLayer());
                    sel.clear();
                    this.canvasView.invalidateSelectionEdges();
                    this.bus.emit('selection-changed');
                }
            }
        }
        this._startX = null;
        this._startY = null;
        this._origOffsets = [];
        this._contentBounds = null;
    }
}


/***/ },

/***/ "./js/tools/RectSelector.js"
/*!**********************************!*\
  !*** ./js/tools/RectSelector.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RectSelector: () => (/* binding */ RectSelector)
/* harmony export */ });
/* harmony import */ var _BaseSelector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseSelector.js */ "./js/tools/BaseSelector.js");


class RectSelector extends _BaseSelector_js__WEBPACK_IMPORTED_MODULE_0__.BaseSelector {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Rect Select';
        this.shortcut = 'M';
        this.icon = 'images/icon-rectselect.svg';
    }

    _applySelection(sel, minX, minY, maxX, maxY) {
        if (this._selectionMode === 'add') {
            sel.addRect(minX, minY, maxX, maxY);
        } else if (this._selectionMode === 'subtract') {
            sel.subtractRect(minX, minY, maxX, maxY);
        } else {
            sel.selectRect(minX, minY, maxX, maxY);
        }
    }
}


/***/ },

/***/ "./js/tools/RectTool.js"
/*!******************************!*\
  !*** ./js/tools/RectTool.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RectTool: () => (/* binding */ RectTool)
/* harmony export */ });
/* harmony import */ var _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseShapeTool.js */ "./js/tools/BaseShapeTool.js");
/* harmony import */ var _util_math_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../util/math.js */ "./js/util/math.js");



class RectTool extends _BaseShapeTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseShapeTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Rectangle';
        this.shortcut = 'U';
        this.icon = 'images/icon-rect.svg';
    }

    _drawShape(startX, startY, x, y, callback) {
        (0,_util_math_js__WEBPACK_IMPORTED_MODULE_1__.rectOutline)(startX, startY, x, y, callback);
    }
}


/***/ },

/***/ "./js/tools/TextTool.js"
/*!******************************!*\
  !*** ./js/tools/TextTool.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TextTool: () => (/* binding */ TextTool)
/* harmony export */ });
/* harmony import */ var _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BaseTool.js */ "./js/tools/BaseTool.js");


class TextTool extends _BaseTool_js__WEBPACK_IMPORTED_MODULE_0__.BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Text';
        this.shortcut = 'W';
        this.icon = 'images/icon-text.svg';
    }

    onPointerDown(x, y, e) {
        if (e.button !== 0) return;
        const layer = this.doc.getActiveLayer();
        if (layer.type === 'text') {
            this.bus.emit('open-text-dialog', { layer, isNew: false });
        } else {
            this.bus.emit('open-text-dialog', { x, y, isNew: true });
        }
    }

    onHover() {} // no brush preview

    getCursor() { return 'text'; }
}


/***/ },

/***/ "./js/ui/CanvasView.js"
/*!*****************************!*\
  !*** ./js/ui/CanvasView.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CanvasView: () => (/* binding */ CanvasView)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");
/* harmony import */ var _render_Renderer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../render/Renderer.js */ "./js/render/Renderer.js");
/* harmony import */ var _render_GridOverlay_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../render/GridOverlay.js */ "./js/render/GridOverlay.js");
/* harmony import */ var _Rulers_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Rulers.js */ "./js/ui/Rulers.js");
/* harmony import */ var _Guides_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Guides.js */ "./js/ui/Guides.js");






class CanvasView {
    constructor(doc, bus) {
        this.doc = doc;
        this.bus = bus;

        this.container = document.getElementById('canvas-container');
        this.workCanvas = document.getElementById('work-canvas');
        this.overlayCanvas = document.getElementById('overlay-canvas');
        this.gridCanvas = document.getElementById('grid-canvas');
        this.checkerboard = document.getElementById('checkerboard');

        this.workCtx = this.workCanvas.getContext('2d');
        this.overlayCtx = this.overlayCanvas.getContext('2d');
        // Grid, guides, and selection all share gridCanvas
        this.selectionCtx = this.gridCanvas.getContext('2d');

        this.renderer = new _render_Renderer_js__WEBPACK_IMPORTED_MODULE_1__.Renderer(doc);
        this.gridOverlay = new _render_GridOverlay_js__WEBPACK_IMPORTED_MODULE_2__.GridOverlay(this.gridCanvas);

        // Offscreen canvas at 1:1 document resolution
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = doc.width;
        this.offscreen.height = doc.height;
        this.offscreenCtx = this.offscreen.getContext('2d');

        // Zoom & pan
        this.zoomIndex = 1; // start at 2x (200%)
        this.zoom = _constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS[this.zoomIndex];
        this.panX = 0;
        this.panY = 0;

        // Configurable grid
        this.gridSize = 16;
        this.gridVisible = false;
        this.snapToGrid = false;

        // Rulers & Guides
        this.rulers = new _Rulers_js__WEBPACK_IMPORTED_MODULE_3__.Rulers();
        this.rulersVisible = false;
        this.guides = new _Guides_js__WEBPACK_IMPORTED_MODULE_4__.Guides(this);
        this.showLayerBorder = false;

        // Marching ants state
        this._marchingAntsOffset = 0;
        this._marchingAntsRAF = null;
        this._selectionEdges = null;

        // Interaction state
        this._isPanning = false;
        this._panStartX = 0;
        this._panStartY = 0;
        this._panStartPanX = 0;
        this._panStartPanY = 0;
        this._spaceDown = false;
        this._spacePanned = false;
        this._pointerDown = false;
        this._lastDocX = 0;
        this._lastDocY = 0;
        this._lastScreenX = 0;
        this._lastScreenY = 0;
        this._lastMoveEvent = null;

        this._setupResize();
        this._setupEvents();
        this._resize();
        this._centerDocument();
        this.render();
    }

    get activeTool() {
        return this._activeTool;
    }

    set activeTool(tool) {
        this._activeTool = tool;
        this.clearOverlay();
        if (tool && tool.onHover) {
            tool.onHover(this._lastDocX, this._lastDocY);
        }
        this._updateCursor();
    }

    _setupResize() {
        const ro = new ResizeObserver(() => this._resize());
        ro.observe(this.container);
    }

    _replayLastMove(keyEvent) {
        const pos = this.screenToDoc(this._lastMoveEvent.clientX, this._lastMoveEvent.clientY);
        this._activeTool.onPointerMove(pos.x, pos.y, keyEvent);
        this.render();
    }

    _updateCursor() {
        if (this._activeTool) {
            const cursor = this._activeTool.getCursor();
            this.container.style.cursor = 'none';
            requestAnimationFrame(() => {
                this.container.style.cursor = cursor;
            });
        }
    }

    _resize() {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;

        for (const c of [this.workCanvas, this.overlayCanvas, this.gridCanvas]) {
            c.width = w;
            c.height = h;
            c.style.width = w + 'px';
            c.style.height = h + 'px';
        }

        if (this.rulersVisible) {
            this.rulers.resize(w, h);
        }

        this.render();
    }

    setRulersVisible(visible) {
        this.rulersVisible = visible;
        this.rulers.setVisible(visible);
        this._resize();
    }

    _centerDocument() {
        const cw = this.container.clientWidth;
        const ch = this.container.clientHeight;
        this.panX = Math.round((cw - this.doc.width * this.zoom) / 2);
        this.panY = Math.round((ch - this.doc.height * this.zoom) / 2);
    }

    _setupEvents() {
        this.container.addEventListener('pointerdown', (e) => this._onPointerDown(e));
        this.container.addEventListener('pointermove', (e) => this._onPointerMove(e));
        this.container.addEventListener('pointerup', (e) => this._onPointerUp(e));
        this.container.addEventListener('pointerleave', (e) => {
            this._onPointerUp(e);
            this.clearOverlay();
        });
        this.container.addEventListener('wheel', (e) => this._onWheel(e), { passive: false });
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());

        document.addEventListener('keydown', (e) => {
            const tag = e.target.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
            if (e.code === 'Space' && !e.repeat) {
                this._spaceDown = true;
                this._spacePanned = false;
                this._panStartX = this._lastScreenX;
                this._panStartY = this._lastScreenY;
                this._panStartPanX = this.panX;
                this._panStartPanY = this.panY;
                this.container.style.cursor = 'grab';
                e.preventDefault();
            }
            if (e.key === 'Shift' && this._lastMoveEvent) {
                this._replayLastMove(e);
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space' && this._spaceDown) {
                this._spaceDown = false;
                this._updateCursor();
                if (!this._spacePanned) {
                    this.bus.emit('space-tap');
                }
            }
            if (e.key === 'Shift' && this._lastMoveEvent) {
                this._replayLastMove(e);
            }
        });
    }

    screenToDoc(screenX, screenY) {
        const rect = this.container.getBoundingClientRect();
        const cx = screenX - rect.left;
        const cy = screenY - rect.top;
        let docX = Math.floor((cx - this.panX) / this.zoom);
        let docY = Math.floor((cy - this.panY) / this.zoom);

        // Snap threshold in screen pixels, converted to doc pixels
        const snapScreenPx = 6;
        const snapDoc = snapScreenPx / this.zoom;

        // Snap to grid lines
        if (this.snapToGrid && this.gridSize > 1) {
            const gs = this.gridSize;
            const nearestX = Math.round(docX / gs) * gs;
            const nearestY = Math.round(docY / gs) * gs;
            if (Math.abs(docX - nearestX) <= snapDoc && nearestX >= 0 && nearestX <= this.doc.width) {
                docX = nearestX;
            }
            if (Math.abs(docY - nearestY) <= snapDoc && nearestY >= 0 && nearestY <= this.doc.height) {
                docY = nearestY;
            }
        }

        // Snap to guides
        if (this.guides.visible && this.guides.guides.length > 0) {
            let bestDx = snapDoc + 1, bestDy = snapDoc + 1;
            let snapX = docX, snapY = docY;
            for (const g of this.guides.guides) {
                if (g.axis === 'v') {
                    const d = Math.abs(docX - g.position);
                    if (d < bestDx) { bestDx = d; snapX = g.position; }
                } else {
                    const d = Math.abs(docY - g.position);
                    if (d < bestDy) { bestDy = d; snapY = g.position; }
                }
            }
            if (bestDx <= snapDoc) docX = snapX;
            if (bestDy <= snapDoc) docY = snapY;
        }

        return { x: docX, y: docY };
    }

    _onPointerDown(e) {
        // Middle mouse button = pan
        if (e.button === 1) {
            this._isPanning = true;
            this._panStartX = e.clientX;
            this._panStartY = e.clientY;
            this._panStartPanX = this.panX;
            this._panStartPanY = this.panY;
            this.container.style.cursor = 'grabbing';
            this.container.setPointerCapture(e.pointerId);
            return;
        }

        // Shift+click near a guide = move guide
        if (e.button === 0 && e.shiftKey && this.guides.visible) {
            const hit = this.guides.hitTest(e.clientX, e.clientY);
            if (hit) {
                this.guides.startMove(hit);
                return;
            }
        }

        if ((e.button === 0 || e.button === 2) && this._activeTool) {
            this._pointerDown = true;
            const pos = this.screenToDoc(e.clientX, e.clientY);
            // Warn if clicking outside a fixed-size layer
            const layer = this.doc.getActiveLayer();
            if (layer && layer.isFixedSize) {
                const lx = pos.x - layer.offsetX;
                const ly = pos.y - layer.offsetY;
                if (lx < 0 || lx >= layer.width || ly < 0 || ly >= layer.height) {
                    this.bus.emit('show-toast', 'Cannot draw outside fixed-size layer');
                }
            }
            this._activeTool.onPointerDown(pos.x, pos.y, e);
            this.render();
            this.container.setPointerCapture(e.pointerId);
        }
    }

    _onPointerMove(e) {
        const pos = this.screenToDoc(e.clientX, e.clientY);
        this._lastDocX = pos.x;
        this._lastDocY = pos.y;
        const rect = this.container.getBoundingClientRect();
        this._lastScreenX = e.clientX - rect.left;
        this._lastScreenY = e.clientY - rect.top;

        // Update status bar position
        this.bus.emit('cursor-move', pos);

        if (this._isPanning) {
            this.panX = this._panStartPanX + (e.clientX - this._panStartX);
            this.panY = this._panStartPanY + (e.clientY - this._panStartY);
            this.render();
            return;
        }

        // Space + mouse move (no button) = pan
        if (this._spaceDown && !this._pointerDown) {
            const dx = this._lastScreenX - this._panStartX;
            const dy = this._lastScreenY - this._panStartY;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
                this._spacePanned = true;
                this.container.style.cursor = 'grabbing';
            }
            if (this._spacePanned) {
                this.panX = this._panStartPanX + dx;
                this.panY = this._panStartPanY + dy;
                this.render();
            }
            return;
        }

        if (this._pointerDown && this._activeTool) {
            this._lastMoveEvent = e;
            this._activeTool.onPointerMove(pos.x, pos.y, e);
            this.render();
        } else if (this._activeTool) {
            if (this._activeTool.onHover) {
                this._activeTool.onHover(pos.x, pos.y);
            }
            // Show move cursor when Shift held near a guide (not during active drag)
            if (e.shiftKey && this.guides.visible && !this.guides.isDragging()) {
                const hit = this.guides.hitTest(e.clientX, e.clientY);
                if (hit) {
                    this.container.style.cursor = hit.axis === 'h' ? 'ns-resize' : 'ew-resize';
                    return;
                }
            }
            this.container.style.cursor = this._activeTool.getCursor();
        }
    }

    _onPointerUp(e) {
        if (this._isPanning) {
            this._isPanning = false;
            this.container.style.cursor = this._activeTool ? this._activeTool.getCursor() : 'crosshair';
            return;
        }

        if (this._pointerDown && this._activeTool) {
            const pos = this.screenToDoc(e.clientX, e.clientY);
            this._activeTool.onPointerUp(pos.x, pos.y, e);
            this._pointerDown = false;
            this._lastMoveEvent = null;
            this._updateCursor();
            this.render();
            this.bus.emit('layer-changed');
        }
    }

    _onWheel(e) {
        e.preventDefault();

        const rect = this.container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Document point under cursor before zoom
        const docX = (mx - this.panX) / this.zoom;
        const docY = (my - this.panY) / this.zoom;

        if (e.deltaY < 0) {
            this.zoomIndex = Math.min(this.zoomIndex + 1, _constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS.length - 1);
        } else {
            this.zoomIndex = Math.max(this.zoomIndex - 1, 0);
        }

        this.zoom = _constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS[this.zoomIndex];

        // Adjust pan so the same doc point stays under cursor
        this.panX = Math.round(mx - docX * this.zoom);
        this.panY = Math.round(my - docY * this.zoom);

        this.bus.emit('zoom-changed', this.zoom);
        this.render();
    }

    snapEdges(bounds) {
        const snapScreenPx = 6;
        const snapDoc = snapScreenPx / this.zoom;
        let bestDx = snapDoc + 1, bestDy = snapDoc + 1;
        let snapDx = 0, snapDy = 0;

        const checkX = (edgeX) => {
            // Grid lines
            if (this.snapToGrid && this.gridSize > 1) {
                const nearest = Math.round(edgeX / this.gridSize) * this.gridSize;
                const d = Math.abs(edgeX - nearest);
                if (d < bestDx && d <= snapDoc) { bestDx = d; snapDx = nearest - edgeX; }
            }
            // Guide lines
            if (this.guides.visible) {
                for (const g of this.guides.guides) {
                    if (g.axis !== 'v') continue;
                    const d = Math.abs(edgeX - g.position);
                    if (d < bestDx && d <= snapDoc) { bestDx = d; snapDx = g.position - edgeX; }
                }
            }
        };

        const checkY = (edgeY) => {
            if (this.snapToGrid && this.gridSize > 1) {
                const nearest = Math.round(edgeY / this.gridSize) * this.gridSize;
                const d = Math.abs(edgeY - nearest);
                if (d < bestDy && d <= snapDoc) { bestDy = d; snapDy = nearest - edgeY; }
            }
            if (this.guides.visible) {
                for (const g of this.guides.guides) {
                    if (g.axis !== 'h') continue;
                    const d = Math.abs(edgeY - g.position);
                    if (d < bestDy && d <= snapDoc) { bestDy = d; snapDy = g.position - edgeY; }
                }
            }
        };

        checkX(bounds.left);
        checkX(bounds.right);
        checkY(bounds.top);
        checkY(bounds.bottom);

        return {
            dx: bestDx <= snapDoc ? snapDx : 0,
            dy: bestDy <= snapDoc ? snapDy : 0,
        };
    }

    _drawConfigGrid(docW, docH, zoom, panX, panY) {
        const ctx = this.gridCanvas.getContext('2d');
        const gs = this.gridSize;
        ctx.strokeStyle = 'rgba(0, 0, 0, 1.0)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= docW; x += gs) {
            const sx = Math.round(panX + x * zoom) + 0.5;
            ctx.moveTo(sx, Math.round(panY) + 0.5);
            ctx.lineTo(sx, Math.round(panY + docH * zoom) + 0.5);
        }
        for (let y = 0; y <= docH; y += gs) {
            const sy = Math.round(panY + y * zoom) + 0.5;
            ctx.moveTo(Math.round(panX) + 0.5, sy);
            ctx.lineTo(Math.round(panX + docW * zoom) + 0.5, sy);
        }
        ctx.stroke();
    }

    drawBrushPreview(docX, docY) {
        this.clearOverlay();
        const brush = this.doc.activeBrush;
        const { zoom, panX, panY } = this;
        const ctx = this.overlayCtx;
        const ox = brush.originX;
        const oy = brush.originY;

        for (let by = 0; by < brush.height; by++) {
            for (let bx = 0; bx < brush.width; bx++) {
                const idx = brush.data[by * brush.width + bx];
                if (idx === _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT) continue;
                const dx = docX + bx - ox;
                const dy = docY + by - oy;
                if (dx < 0 || dx >= this.doc.width || dy < 0 || dy >= this.doc.height) continue;
                const colorIndex = brush.isCaptured ? idx : this.doc.fgColorIndex;
                const [r, g, b] = this.doc.palette.getColor(colorIndex);
                ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
                ctx.fillRect(panX + dx * zoom, panY + dy * zoom, zoom, zoom);
            }
        }
    }

    clearOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    }

    /**
     * Draw a preview line on the overlay canvas in screen coordinates.
     */
    drawOverlayLine(x0, y0, x1, y1, color = 'rgba(255,255,255,0.6)') {
        const ctx = this.overlayCtx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(this.panX + (x0 + 0.5) * this.zoom, this.panY + (y0 + 0.5) * this.zoom);
        ctx.lineTo(this.panX + (x1 + 0.5) * this.zoom, this.panY + (y1 + 0.5) * this.zoom);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Draw a preview rect outline on the overlay canvas.
     */
    drawOverlayRect(x0, y0, x1, y1, color = 'rgba(255,255,255,0.6)') {
        const ctx = this.overlayCtx;
        const minX = Math.min(x0, x1);
        const minY = Math.min(y0, y1);
        const maxX = Math.max(x0, x1);
        const maxY = Math.max(y0, y1);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(
            this.panX + minX * this.zoom + 0.5,
            this.panY + minY * this.zoom + 0.5,
            (maxX - minX) * this.zoom - 1,
            (maxY - minY) * this.zoom - 1
        );
        ctx.setLineDash([]);
    }

    /**
     * Draw a preview ellipse outline on the overlay.
     */
    drawOverlayEllipse(cx, cy, rx, ry, color = 'rgba(255,255,255,0.6)') {
        const ctx = this.overlayCtx;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.ellipse(
            this.panX + (cx + 0.5) * this.zoom,
            this.panY + (cy + 0.5) * this.zoom,
            rx * this.zoom,
            ry * this.zoom,
            0, 0, Math.PI * 2
        );
        ctx.stroke();
        ctx.setLineDash([]);
    }

    render() {
        const { doc, workCtx, zoom, panX, panY } = this;
        const cw = this.workCanvas.width;
        const ch = this.workCanvas.height;

        // Update offscreen canvas if document dimensions changed
        if (this.offscreen.width !== doc.width || this.offscreen.height !== doc.height) {
            this.offscreen.width = doc.width;
            this.offscreen.height = doc.height;
        }

        // Composite document
        const imageData = this.renderer.composite();
        this.offscreenCtx.putImageData(imageData, 0, 0);

        // Draw to visible canvas
        workCtx.clearRect(0, 0, cw, ch);
        workCtx.imageSmoothingEnabled = false;
        workCtx.drawImage(
            this.offscreen,
            0, 0, doc.width, doc.height,
            panX, panY,
            doc.width * zoom,
            doc.height * zoom
        );

        // Update checkerboard
        const cbSize = 8 * zoom;
        this.checkerboard.style.left = panX + 'px';
        this.checkerboard.style.top = panY + 'px';
        this.checkerboard.style.width = (doc.width * zoom) + 'px';
        this.checkerboard.style.height = (doc.height * zoom) + 'px';
        this.checkerboard.style.backgroundSize = `${cbSize}px ${cbSize}px`;

        // Draw grid, guides, selection on shared canvas
        this._redrawOverlayTop();

        // Draw rulers (separate canvases)
        if (this.rulersVisible) {
            this.rulers.draw(doc.width, doc.height, zoom, panX, panY);
        }

        // Redraw brush preview if the active tool supports it
        if (this._activeTool && this._activeTool.onHover && !this._pointerDown) {
            this._activeTool.onHover(this._lastDocX, this._lastDocY);
        }
    }

    // --- Marching ants selection overlay ---

    invalidateSelectionEdges() {
        this._selectionEdges = null;
    }

    _redrawOverlayTop() {
        const { zoom, panX, panY, doc } = this;
        const cw = this.gridCanvas.width;
        const ch = this.gridCanvas.height;
        this.gridOverlay.draw(doc.width, doc.height, zoom, panX, panY);
        if (this.gridVisible && this.gridSize > 1) {
            this._drawConfigGrid(doc.width, doc.height, zoom, panX, panY);
        }
        this.guides.draw(this.selectionCtx, cw, ch, zoom, panX, panY);
        // Draw active layer border
        if (this.showLayerBorder) {
            const layer = doc.getActiveLayer();
            if (layer) {
                const ctx = this.selectionCtx;
                const lx = panX + layer.offsetX * zoom;
                const ly = panY + layer.offsetY * zoom;
                const lw = layer.width * zoom;
                const lh = layer.height * zoom;
                ctx.strokeStyle = 'rgba(255, 220, 0, 0.8)';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(lx + 0.5, ly + 0.5, lw - 1, lh - 1);
                ctx.setLineDash([]);
            }
        }
        if (this._activeTool && this._activeTool.isTransformActive) {
            this._activeTool.drawTransformBox(this.selectionCtx, zoom, panX, panY);
        } else if (doc.selection.active) {
            this._drawMarchingAnts();
        }
    }

    startMarchingAnts() {
        if (this._marchingAntsRAF) return;
        let lastTime = 0;
        const animate = (time) => {
            if (time - lastTime >= 100) { // ~10fps for smooth march
                this._marchingAntsOffset = (this._marchingAntsOffset + 1) % 16;
                this._redrawOverlayTop();
                lastTime = time;
            }
            this._marchingAntsRAF = requestAnimationFrame(animate);
        };
        this._marchingAntsRAF = requestAnimationFrame(animate);
    }

    stopMarchingAnts() {
        if (this._marchingAntsRAF) {
            cancelAnimationFrame(this._marchingAntsRAF);
            this._marchingAntsRAF = null;
        }
        this.render();
    }

    _computeSelectionEdges() {
        const sel = this.doc.selection;
        if (!sel.active) return [];

        const w = sel.width;
        const h = sel.height;
        const mask = sel.mask;
        const edges = [];

        // For floating selection, compute edges from floating bounds
        if (sel.hasFloating()) {
            const f = sel.floating;
            for (let fy = 0; fy < f.height; fy++) {
                for (let fx = 0; fx < f.width; fx++) {
                    if (!f.mask[fy * f.width + fx]) continue;
                    const docX = f.originX + fx;
                    const docY = f.originY + fy;
                    // Check 4 neighbors in floating mask space
                    const hasTop = (fy > 0 && f.mask[(fy - 1) * f.width + fx]);
                    const hasBottom = (fy < f.height - 1 && f.mask[(fy + 1) * f.width + fx]);
                    const hasLeft = (fx > 0 && f.mask[fy * f.width + fx - 1]);
                    const hasRight = (fx < f.width - 1 && f.mask[fy * f.width + fx + 1]);
                    if (!hasTop) edges.push(docX, docY, docX + 1, docY);           // top
                    if (!hasBottom) edges.push(docX, docY + 1, docX + 1, docY + 1); // bottom
                    if (!hasLeft) edges.push(docX, docY, docX, docY + 1);           // left
                    if (!hasRight) edges.push(docX + 1, docY, docX + 1, docY + 1);  // right
                }
            }
            return edges;
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (!mask[y * w + x]) continue;
                // Check 4 neighbors
                const hasTop = (y > 0 && mask[(y - 1) * w + x]);
                const hasBottom = (y < h - 1 && mask[(y + 1) * w + x]);
                const hasLeft = (x > 0 && mask[y * w + x - 1]);
                const hasRight = (x < w - 1 && mask[y * w + x + 1]);
                if (!hasTop) edges.push(x, y, x + 1, y);
                if (!hasBottom) edges.push(x, y + 1, x + 1, y + 1);
                if (!hasLeft) edges.push(x, y, x, y + 1);
                if (!hasRight) edges.push(x + 1, y, x + 1, y + 1);
            }
        }
        return edges;
    }

    _mergeEdges(edges) {
        // Separate into horizontal (same y) and vertical (same x) edges
        const hEdges = []; // [x1, y, x2] where x1 < x2
        const vEdges = []; // [x, y1, y2] where y1 < y2
        for (let i = 0; i < edges.length; i += 4) {
            const x1 = edges[i], y1 = edges[i + 1], x2 = edges[i + 2], y2 = edges[i + 3];
            if (y1 === y2) {
                hEdges.push([Math.min(x1, x2), y1, Math.max(x1, x2)]);
            } else {
                vEdges.push([x1, Math.min(y1, y2), Math.max(y1, y2)]);
            }
        }
        // Merge horizontal: sort by y then x, merge contiguous
        hEdges.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
        const merged = [];
        for (let i = 0; i < hEdges.length; i++) {
            let [x1, y, x2] = hEdges[i];
            while (i + 1 < hEdges.length && hEdges[i + 1][1] === y && hEdges[i + 1][0] === x2) {
                x2 = hEdges[++i][2];
            }
            merged.push(x1, y, x2, y);
        }
        // Merge vertical: sort by x then y, merge contiguous
        vEdges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        for (let i = 0; i < vEdges.length; i++) {
            let [x, y1, y2] = vEdges[i];
            while (i + 1 < vEdges.length && vEdges[i + 1][0] === x && vEdges[i + 1][1] === y2) {
                y2 = vEdges[++i][2];
            }
            merged.push(x, y1, x, y2);
        }
        return merged;
    }

    _drawMarchingAnts() {
        const ctx = this.selectionCtx;
        const cw = this.gridCanvas.width;
        const ch = this.gridCanvas.height;

        // Don't draw ants during free transform — render() draws the transform box
        if (this._activeTool && this._activeTool.isTransformActive) {
            this._activeTool.drawTransformBox(ctx, this.zoom, this.panX, this.panY);
            return;
        }

        const sel = this.doc.selection;
        if (!sel.active) return;

        if (!this._selectionEdges) {
            this._selectionEdges = this._mergeEdges(this._computeSelectionEdges());
        }

        const edges = this._selectionEdges;
        if (edges.length === 0) return;

        const { zoom, panX, panY } = this;

        // Draw black dashes then white dashes offset
        for (let pass = 0; pass < 2; pass++) {
            ctx.strokeStyle = pass === 0 ? '#000' : '#fff';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.lineDashOffset = pass === 0 ? -this._marchingAntsOffset : -(this._marchingAntsOffset + 4);
            ctx.beginPath();
            for (let i = 0; i < edges.length; i += 4) {
                const sx = panX + edges[i] * zoom;
                const sy = panY + edges[i + 1] * zoom;
                const ex = panX + edges[i + 2] * zoom;
                const ey = panY + edges[i + 3] * zoom;
                ctx.moveTo(sx + 0.5, sy + 0.5);
                ctx.lineTo(ex + 0.5, ey + 0.5);
            }
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw resize handles if active tool supports them
        if (this._activeTool && this._activeTool.showsResizeHandles) {
            this._drawResizeHandles();
        }
    }

    _getResizeHandlePositions() {
        const sel = this.doc.selection;
        if (!sel.active || sel.hasFloating()) return null;
        const bounds = sel.getBounds();
        if (!bounds) return null;

        const { minX, minY, maxX, maxY } = bounds;
        const { zoom, panX, panY } = this;

        const left = panX + minX * zoom;
        const top = panY + minY * zoom;
        const right = panX + (maxX + 1) * zoom;
        const bottom = panY + (maxY + 1) * zoom;
        const midX = (left + right) / 2;
        const midY = (top + bottom) / 2;

        return [
            { id: 'nw', x: left, y: top },
            { id: 'n',  x: midX, y: top },
            { id: 'ne', x: right, y: top },
            { id: 'e',  x: right, y: midY },
            { id: 'se', x: right, y: bottom },
            { id: 's',  x: midX, y: bottom },
            { id: 'sw', x: left, y: bottom },
            { id: 'w',  x: left, y: midY },
        ];
    }

    hitTestResizeHandle() {
        const handles = this._getResizeHandlePositions();
        if (!handles) return null;

        const screenX = this._lastScreenX;
        const screenY = this._lastScreenY;
        const halfSize = 5;

        for (const h of handles) {
            if (Math.abs(screenX - h.x) <= halfSize && Math.abs(screenY - h.y) <= halfSize) {
                return h.id;
            }
        }
        return null;
    }

    _drawResizeHandles() {
        const handles = this._getResizeHandlePositions();
        if (!handles) return;

        const ctx = this.selectionCtx;
        const size = 7;
        const half = Math.floor(size / 2);

        for (const h of handles) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(h.x - half, h.y - half, size, size);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.setLineDash([]);
            ctx.strokeRect(h.x - half + 0.5, h.y - half + 0.5, size - 1, size - 1);
        }
    }
}


/***/ },

/***/ "./js/ui/ColorSelector.js"
/*!********************************!*\
  !*** ./js/ui/ColorSelector.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorSelector: () => (/* binding */ ColorSelector)
/* harmony export */ });
class ColorSelector {
    constructor(doc, bus) {
        this.doc = doc;
        this.bus = bus;

        this.fgSwatch = document.getElementById('color-fg-swatch');
        this.bgSwatch = document.getElementById('color-bg-swatch');
        this.swapBtn = document.getElementById('color-swap-btn');
        this.label = document.getElementById('color-index-label');

        this.swapBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.doc.swapColors();
            this.bus.emit('fg-color-changed');
            this.bus.emit('bg-color-changed');
            this.update();
        });
        this.swapBtn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        const swatchArea = document.getElementById('color-selector-swatches');
        swatchArea.addEventListener('click', () => {
            this.bus.emit('open-palette-picker', 'fg');
        });
        swatchArea.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.bus.emit('open-palette-picker', 'bg');
        });

        this.bus.on('fg-color-changed', () => this.update());
        this.bus.on('bg-color-changed', () => this.update());
        this.bus.on('palette-changed', () => this.update());

        this.update();
    }

    update() {
        const { palette, fgColorIndex, bgColorIndex } = this.doc;
        const [fr, fg, fb] = palette.getColor(fgColorIndex);
        const [br, bg, bb] = palette.getColor(bgColorIndex);

        this.fgSwatch.style.backgroundColor = `rgb(${fr},${fg},${fb})`;
        this.bgSwatch.style.backgroundColor = `rgb(${br},${bg},${bb})`;
        this.label.textContent = `FG:${fgColorIndex} BG:${bgColorIndex}`;
    }
}


/***/ },

/***/ "./js/ui/Dialog.js"
/*!*************************!*\
  !*** ./js/ui/Dialog.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Dialog)
/* harmony export */ });
/**
 * Lightweight dialog helper. Creates the overlay, header (title + close button),
 * body container, and footer with buttons. Handles Escape/Enter keys and
 * safe overlay-click-to-close (requires mousedown + click both on overlay).
 *
 * Usage:
 *   const dlg = Dialog.create({
 *       title: 'My Dialog',
 *       width: '300px',           // optional, CSS value
 *       buttons: [
 *           { label: 'Cancel' },
 *           { label: 'OK', primary: true, onClick: () => { ... } },
 *       ],
 *       onClose: () => { ... },   // optional, called on any close
 *       enterButton: 1,           // optional, index into buttons[] for Enter key
 *   });
 *   dlg.body.appendChild(myContent);
 *   dlg.show();
 *   // later: dlg.close();
 */
class Dialog {
    static create(opts = {}) {
        return new Dialog(opts);
    }

    constructor(opts) {
        this._onClose = opts.onClose || null;
        this._closed = false;

        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'palette-dialog-overlay';

        // Dialog container
        this.dialog = document.createElement('div');
        this.dialog.className = 'palette-dialog';
        if (opts.width) {
            this.dialog.style.width = opts.width;
            this.dialog.style.maxWidth = '90vw';
        }

        // Header
        const header = document.createElement('div');
        header.className = 'palette-dialog-header';
        header.innerHTML = `<span>${opts.title || ''}</span>`;
        const closeBtn = document.createElement('button');
        closeBtn.className = 'palette-dialog-close';
        closeBtn.textContent = '\u00D7';
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
        this.dialog.appendChild(header);

        // Body
        this.body = document.createElement('div');
        this.dialog.appendChild(this.body);

        // Footer (only if buttons provided)
        this._buttons = [];
        if (opts.buttons && opts.buttons.length) {
            const footer = document.createElement('div');
            footer.className = 'palette-dialog-footer';
            footer.style.justifyContent = 'flex-end';
            footer.style.gap = '8px';

            for (const btnOpt of opts.buttons) {
                const btn = document.createElement('button');
                btn.textContent = btnOpt.label;
                if (btnOpt.primary) btn.className = 'primary';
                btn.addEventListener('click', () => {
                    if (btnOpt.onClick) {
                        btnOpt.onClick(this);
                    } else {
                        this.close();
                    }
                });
                footer.appendChild(btn);
                this._buttons.push(btn);
            }
            this.dialog.appendChild(footer);
        }

        this.overlay.appendChild(this.dialog);

        // Keyboard
        const enterIdx = opts.enterButton !== undefined ? opts.enterButton : -1;
        this._onKey = (e) => {
            if (e.key === 'Escape') {
                this.close();
            } else if (e.key === 'Enter' && enterIdx >= 0 && this._buttons[enterIdx]) {
                // Don't trigger button when typing in a textarea or text input
                if (e.target.tagName === 'TEXTAREA') return;
                this._buttons[enterIdx].click();
            }
            e.stopPropagation();
        };

        // Overlay click-to-close (mousedown + click must both be on overlay)
        let mouseDownOnOverlay = false;
        this.overlay.addEventListener('mousedown', (e) => {
            mouseDownOnOverlay = e.target === this.overlay;
        });
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay && mouseDownOnOverlay) this.close();
            mouseDownOnOverlay = false;
        });
    }

    show(focusEl) {
        document.body.appendChild(this.overlay);
        this.dialog.addEventListener('keydown', this._onKey);
        if (focusEl) {
            focusEl.focus();
            if (focusEl.select) focusEl.select();
        }
        return this;
    }

    close() {
        if (this._closed) return;
        this._closed = true;
        this.overlay.remove();
        if (this._onClose) this._onClose();
    }

    /** Get a button element by index. */
    getButton(index) {
        return this._buttons[index] || null;
    }
}


/***/ },

/***/ "./js/ui/FramePanel.js"
/*!*****************************!*\
  !*** ./js/ui/FramePanel.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FramePanel: () => (/* binding */ FramePanel)
/* harmony export */ });
/* harmony import */ var _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Renderer.js */ "./js/render/Renderer.js");
/* harmony import */ var _Dialog_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Dialog.js */ "./js/ui/Dialog.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");




class FramePanel {
    constructor(doc, bus, undoManager) {
        this.doc = doc;
        this.bus = bus;
        this.undoManager = undoManager;
        this.panel = document.getElementById('frame-panel');
        this._list = null;
        this._playing = false;
        this._lastClickTime = 0;
        this._lastClickIndex = -1;
        this._playMode = null; // 'all' or 'tag'
        this._playFrameIndices = null; // indices to loop through
        this._playTimer = null;

        this._buildUI();

        this.bus.on('layer-changed', () => this._updateAllThumbs());
        this.bus.on('document-changed', () => this._updateAllThumbs());
        this.bus.on('frame-changed', () => this.render());
        this.bus.on('animation-changed', () => this.render());
    }

    _snapshotFrames() {
        return {
            activeFrameIndex: this.doc.activeFrameIndex,
            frames: this.doc.frames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({
                    ...ld,
                    data: ld.data.slice(),
                })) : null,
            })),
        };
    }

    _buildUI() {
        // Header
        const header = document.createElement('div');
        header.className = 'frame-panel-header';

        const btn = (iconSrc, title, action) => {
            const b = document.createElement('button');
            b.className = 'icon-btn';
            const img = document.createElement('img');
            img.src = (0,_constants_js__WEBPACK_IMPORTED_MODULE_2__.withVersion)(iconSrc);
            img.className = 'panel-icon';
            img.draggable = false;
            b.appendChild(img);
            b.title = title;
            b.addEventListener('click', action);
            header.appendChild(b);
            return b;
        };

        btn('images/icon-add.svg', 'Add frame', () => {
            const before = this._snapshotFrames();
            this.doc.addFrame();
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-add',
                beforeFrames: before.frames,
                afterFrames: after.frames,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
        });
        btn('images/icon-delete.svg', 'Delete frame', () => {
            if (this.doc.frames.length <= 1) return;
            if (!confirm('Delete this frame?')) return;
            const before = this._snapshotFrames();
            this.doc.deleteFrame(this.doc.activeFrameIndex);
            const after = this._snapshotFrames();
            this.undoManager.pushEntry({
                type: 'frame-delete',
                beforeFrames: before.frames,
                afterFrames: after.frames,
                beforeActiveFrame: before.activeFrameIndex,
                afterActiveFrame: after.activeFrameIndex,
            });
            this.bus.emit('frame-changed');
            this.bus.emit('animation-changed');
            this.bus.emit('layer-changed');
        });
        btn('images/icon-move-left.svg', 'Move left', () => {
            this.doc.saveCurrentFrame();
            const from = this.doc.activeFrameIndex;
            if (this.doc.moveFrame(from, -1)) {
                this.undoManager.pushEntry({
                    type: 'frame-move',
                    fromIndex: from,
                    toIndex: this.doc.activeFrameIndex,
                });
                this.bus.emit('frame-changed');
                this.bus.emit('animation-changed');
            }
        });
        btn('images/icon-move-right.svg', 'Move right', () => {
            this.doc.saveCurrentFrame();
            const from = this.doc.activeFrameIndex;
            if (this.doc.moveFrame(from, 1)) {
                this.undoManager.pushEntry({
                    type: 'frame-move',
                    fromIndex: from,
                    toIndex: this.doc.activeFrameIndex,
                });
                this.bus.emit('frame-changed');
                this.bus.emit('animation-changed');
            }
        });

        const sep = document.createElement('span');
        sep.style.cssText = 'width:1px;height:16px;background:var(--border);margin:0 4px;';
        header.appendChild(sep);

        this._playBtn = btn('images/icon-play.svg', 'Play all', () => this._play());
        this._playTagBtn = btn('images/icon-play-tag.svg', 'Play tag', () => this._playTag());
        this._pauseBtn = btn('images/icon-pause.svg', 'Pause', () => this._pause());
        this._stopBtn = btn('images/icon-stop.svg', 'Stop', () => this._stop());

        const sep2 = document.createElement('span');
        sep2.style.cssText = 'width:1px;height:16px;background:var(--border);margin:0 4px;';
        header.appendChild(sep2);

        // Onion skinning checkbox
        const onionLabel = document.createElement('label');
        onionLabel.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-dim);cursor:pointer;user-select:none;';
        this._onionCheckbox = document.createElement('input');
        this._onionCheckbox.type = 'checkbox';
        this._onionCheckbox.checked = this.doc.onionSkinning;
        this._onionCheckbox.addEventListener('change', () => {
            this.doc.onionSkinning = this._onionCheckbox.checked;
            this.bus.emit('document-changed');
        });
        onionLabel.appendChild(this._onionCheckbox);
        onionLabel.appendChild(document.createTextNode('Onion'));
        header.appendChild(onionLabel);

        // Onion opacity input
        this._onionOpacityInput = document.createElement('input');
        this._onionOpacityInput.type = 'number';
        this._onionOpacityInput.min = 1;
        this._onionOpacityInput.max = 100;
        this._onionOpacityInput.value = this.doc.onionOpacity ?? 50;
        this._onionOpacityInput.style.cssText = 'width:38px;padding:1px 3px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:11px;text-align:center;';
        this._onionOpacityInput.addEventListener('change', () => {
            this.doc.onionOpacity = Math.max(1, Math.min(100, parseInt(this._onionOpacityInput.value) || 50));
            this._onionOpacityInput.value = this.doc.onionOpacity;
            this.bus.emit('document-changed');
        });
        const pctLabel = document.createElement('span');
        pctLabel.textContent = '%';
        pctLabel.style.cssText = 'font-size:11px;color:var(--text-dim);';
        header.appendChild(this._onionOpacityInput);
        header.appendChild(pctLabel);

        // Onion extended checkbox (+/- 2 frames)
        const extLabel = document.createElement('label');
        extLabel.style.cssText = 'display:flex;align-items:center;gap:3px;font-size:11px;color:var(--text-dim);cursor:pointer;user-select:none;margin-left:2px;';
        this._onionExtCheckbox = document.createElement('input');
        this._onionExtCheckbox.type = 'checkbox';
        this._onionExtCheckbox.checked = this.doc.onionExtended;
        this._onionExtCheckbox.addEventListener('change', () => {
            this.doc.onionExtended = this._onionExtCheckbox.checked;
            this.bus.emit('document-changed');
        });
        extLabel.appendChild(this._onionExtCheckbox);
        extLabel.appendChild(document.createTextNode('\u00B12'));
        header.appendChild(extLabel);

        this.panel.appendChild(header);

        // Frame list
        this._list = document.createElement('div');
        this._list.className = 'frame-list';
        this.panel.appendChild(this._list);
    }

    show() {
        this.panel.classList.add('visible');
        this._onionCheckbox.checked = this.doc.onionSkinning;
        this._onionOpacityInput.value = this.doc.onionOpacity ?? 50;
        this._onionExtCheckbox.checked = this.doc.onionExtended;
        this.render();
    }

    hide() {
        this._stop();
        this.panel.classList.remove('visible');
    }

    render() {
        this._list.innerHTML = '';
        const frames = this.doc.frames;
        const activeIdx = this.doc.activeFrameIndex;

        // Determine which tag group the active frame belongs to
        let activeTag = null;
        for (let j = activeIdx; j >= 0; j--) {
            if (frames[j].tag) { activeTag = frames[j].tag; break; }
        }

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];

            const thumb = document.createElement('div');
            thumb.className = 'frame-thumb' + (i === activeIdx ? ' active' : '');

            // Tag label above the frame (only on tag-start frames)
            if (frame.tag) {
                const tagLabel = document.createElement('div');
                tagLabel.className = 'frame-tag-label';
                tagLabel.textContent = frame.tag;
                // Active tag group gets higher z-index
                if (frame.tag === activeTag) {
                    tagLabel.classList.add('active-tag');
                }
                thumb.appendChild(tagLabel);
            }

            // Preview canvas
            const canvas = document.createElement('canvas');
            const scale = Math.min(48 / this.doc.width, 36 / this.doc.height);
            canvas.width = Math.round(this.doc.width * scale);
            canvas.height = Math.round(this.doc.height * scale);
            canvas.style.cssText = `image-rendering:pixelated;`;
            this._renderThumb(canvas, frame, i);
            thumb.appendChild(canvas);

            // Label — always show frame number
            const label = document.createElement('div');
            label.className = 'frame-label';
            label.textContent = `${i + 1}`;
            thumb.appendChild(label);

            thumb.addEventListener('click', () => {
                if (this._playing) return;
                const now = Date.now();
                if (now - this._lastClickTime < 400 && this._lastClickIndex === i) {
                    this._lastClickTime = 0;
                    this._editFrame(i, frame);
                    return;
                }
                this._lastClickTime = now;
                this._lastClickIndex = i;
                this._switchFrame(i);
            });

            this._list.appendChild(thumb);
        }
    }

    _renderThumb(canvas, frame, frameIndex) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Temporarily load frame data to render it
        const doc = this.doc;
        const isActive = frameIndex === doc.activeFrameIndex;

        // For active frame, render current state; for others, temporarily swap
        if (!isActive && frame.layerData) {
            // Save current layer state
            const saved = doc.layers.map(l => ({
                data: l.data, opacity: l.opacity, textData: l.textData,
                offsetX: l.offsetX, offsetY: l.offsetY,
                width: l.width, height: l.height,
            }));
            // Load frame data
            doc._restoreLayersFromFrame(frame);
            // Render
            const renderer = new _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__.Renderer(doc);
            const imageData = renderer.composite();
            const tmp = document.createElement('canvas');
            tmp.width = doc.width;
            tmp.height = doc.height;
            tmp.getContext('2d').putImageData(imageData, 0, 0);
            ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
            // Restore
            for (let i = 0; i < doc.layers.length && i < saved.length; i++) {
                const s = saved[i];
                doc.layers[i].data = s.data;
                doc.layers[i].opacity = s.opacity;
                doc.layers[i].textData = s.textData;
                doc.layers[i].offsetX = s.offsetX;
                doc.layers[i].offsetY = s.offsetY;
                doc.layers[i].width = s.width;
                doc.layers[i].height = s.height;
            }
        } else {
            const renderer = new _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__.Renderer(doc);
            const imageData = renderer.composite();
            const tmp = document.createElement('canvas');
            tmp.width = doc.width;
            tmp.height = doc.height;
            tmp.getContext('2d').putImageData(imageData, 0, 0);
            ctx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
        }
    }

    _updateAllThumbs() {
        if (!this.doc.animationEnabled || !this.panel.classList.contains('visible')) return;
        const thumbs = this._list.querySelectorAll('.frame-thumb');
        const frames = this.doc.frames;
        for (let i = 0; i < thumbs.length && i < frames.length; i++) {
            const canvas = thumbs[i].querySelector('canvas');
            if (canvas) this._renderThumb(canvas, frames[i], i);
        }
    }

    _switchFrame(index) {
        if (index === this.doc.activeFrameIndex) return;
        this.doc.saveCurrentFrame();
        this.doc.loadFrame(index);
        this.bus.emit('frame-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }

    _editFrame(index, frame) {
        const dlg = _Dialog_js__WEBPACK_IMPORTED_MODULE_1__["default"].create({
            title: `Frame ${index + 1} Properties`,
            width: '260px',
            buttons: [
                { label: 'Cancel' },
                { label: 'OK', primary: true, onClick: () => {
                    const newTag = tagInput.value.trim();
                    const newDelay = Math.max(1, parseInt(delayInput.value) || 100);
                    if (newTag !== frame.tag || newDelay !== frame.delay) {
                        const beforeTag = frame.tag;
                        const beforeDelay = frame.delay;
                        frame.tag = newTag;
                        frame.delay = newDelay;
                        this.undoManager.pushEntry({
                            type: 'frame-edit',
                            frameIndex: index,
                            beforeTag,
                            afterTag: newTag,
                            beforeDelay,
                            afterDelay: newDelay,
                        });
                    }
                    this.render();
                    dlg.close();
                }},
            ],
            enterButton: 1,
        });

        const body = dlg.body;
        body.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 0;';

        const tagRow = document.createElement('div');
        tagRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const tagLabel = document.createElement('label');
        tagLabel.textContent = 'Tag:';
        tagLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
        const tagInput = document.createElement('input');
        tagInput.type = 'text';
        tagInput.value = frame.tag || '';
        tagInput.placeholder = 'e.g. idle, run';
        tagInput.style.cssText = 'flex:1;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;';
        tagRow.appendChild(tagLabel);
        tagRow.appendChild(tagInput);
        body.appendChild(tagRow);

        const delayRow = document.createElement('div');
        delayRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const delayLabel = document.createElement('label');
        delayLabel.textContent = 'Delay:';
        delayLabel.style.cssText = 'font-size:13px;color:var(--text);width:50px;';
        const delayInput = document.createElement('input');
        delayInput.type = 'number';
        delayInput.value = frame.delay || 100;
        delayInput.min = 1;
        delayInput.max = 10000;
        delayInput.style.cssText = 'width:80px;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;';
        const delayUnit = document.createElement('span');
        delayUnit.textContent = 'ms';
        delayUnit.style.cssText = 'font-size:12px;color:var(--text-dim);';
        delayRow.appendChild(delayLabel);
        delayRow.appendChild(delayInput);
        delayRow.appendChild(delayUnit);
        body.appendChild(delayRow);

        dlg.show(tagInput);
    }

    _getTagFrameIndices() {
        // A tag marks the start of a group. The group extends until the next
        // tagged frame (or end of frames). Find which group the active frame
        // belongs to and return all indices in that group.
        const frames = this.doc.frames;
        const idx = this.doc.activeFrameIndex;

        // Walk backwards to find the group's start (a frame with a non-empty tag)
        let start = idx;
        while (start > 0 && !frames[start].tag) start--;
        // If the start frame has no tag either, there's no tag group here
        if (!frames[start].tag) return null;

        // Walk forwards from start to find the end (next tagged frame or end)
        let end = start + 1;
        while (end < frames.length && !frames[end].tag) end++;
        // end is now exclusive

        if (end - start < 2) return null; // single frame, nothing to animate
        const indices = [];
        for (let i = start; i < end; i++) indices.push(i);
        return indices;
    }

    togglePlayTag() {
        if (this._playing) {
            this._stop();
        } else {
            this._playTag();
        }
    }

    _setPlayingState(playing) {
        this._playing = playing;
        this._playBtn.disabled = playing;
        this._playTagBtn.disabled = playing;
    }

    _play() {
        if (this._playing || this.doc.frames.length <= 1) return;
        this._playMode = 'all';
        const indices = [];
        for (let i = 0; i < this.doc.frames.length; i++) indices.push(i);
        this._playFrameIndices = indices;
        this._setPlayingState(true);
        this._tick();
    }

    _playTag() {
        if (this._playing) return;
        const indices = this._getTagFrameIndices();
        if (!indices) return; // not in a tag group or only 1 frame
        this._playMode = 'tag';
        this._playFrameIndices = indices;
        this._setPlayingState(true);
        this._tick();
    }

    _tick() {
        if (!this._playing) return;
        this.doc.saveCurrentFrame();
        const indices = this._playFrameIndices;
        const curPos = indices.indexOf(this.doc.activeFrameIndex);
        const nextPos = (curPos + 1) % indices.length;
        const nextIdx = indices[nextPos];
        this.doc.loadFrame(nextIdx);
        this.bus.emit('frame-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
        const delay = this.doc.frames[nextIdx].delay || 100;
        this._playTimer = setTimeout(() => this._tick(), delay);
    }

    _pause() {
        // Pause: stop playback but stay on current frame
        if (!this._playing) return;
        this._playing = false;
        this._playMode = null;
        this._playFrameIndices = null;
        this._setPlayingState(false);
        if (this._playTimer) {
            clearTimeout(this._playTimer);
            this._playTimer = null;
        }
    }

    _stop() {
        // Stop: stop playback and jump to beginning
        if (!this._playing) return;
        const mode = this._playMode;
        const indices = this._playFrameIndices;
        this._playing = false;
        this._setPlayingState(false);
        if (this._playTimer) {
            clearTimeout(this._playTimer);
            this._playTimer = null;
        }
        // Jump to first frame of the played range
        const targetIdx = (mode === 'tag' && indices && indices.length > 0) ? indices[0] : 0;
        if (targetIdx !== this.doc.activeFrameIndex) {
            this.doc.saveCurrentFrame();
            this.doc.loadFrame(targetIdx);
            this.bus.emit('frame-changed');
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
        this._playMode = null;
        this._playFrameIndices = null;
    }
}


/***/ },

/***/ "./js/ui/Guides.js"
/*!*************************!*\
  !*** ./js/ui/Guides.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Guides: () => (/* binding */ Guides)
/* harmony export */ });
class Guides {
    constructor(canvasView) {
        this.cv = canvasView;
        this.guides = [];
        this.visible = true;

        this._dragging = null; // { axis, creating, guide?, pointerId }
        this._previewPos = null; // doc coordinate during drag

        this._onDocMove = (e) => this._handleDragMove(e);
        this._onDocUp = (e) => this._handleDragEnd(e);

        this._setupRulerListeners();
    }

    _setupRulerListeners() {
        const hCanvas = document.getElementById('ruler-h');
        const vCanvas = document.getElementById('ruler-v');

        hCanvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            this._startCreate('h', e);
        });

        vCanvas.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            this._startCreate('v', e);
        });
    }

    _startCreate(axis, e) {
        this._dragging = { axis, creating: true };
        this._previewPos = null;
        document.addEventListener('pointermove', this._onDocMove);
        document.addEventListener('pointerup', this._onDocUp);
        e.preventDefault();
    }

    startMove(guide) {
        this._dragging = { axis: guide.axis, creating: false, guide };
        this._previewPos = guide.position;
        document.addEventListener('pointermove', this._onDocMove);
        document.addEventListener('pointerup', this._onDocUp);
    }

    isDragging() {
        return this._dragging !== null;
    }

    _handleDragMove(e) {
        if (!this._dragging) return;
        const pos = this.cv.screenToDoc(e.clientX, e.clientY);
        const docPos = this._dragging.axis === 'h' ? pos.y : pos.x;
        this._previewPos = docPos;

        if (!this._dragging.creating) {
            this._dragging.guide.position = docPos;
        }

        this.cv.render();
    }

    _handleDragEnd(e) {
        if (!this._dragging) return;
        document.removeEventListener('pointermove', this._onDocMove);
        document.removeEventListener('pointerup', this._onDocUp);

        const overRuler = this._isOverRulerOrOutside(e.clientX, e.clientY);

        if (this._dragging.creating) {
            if (!overRuler && this._previewPos !== null) {
                this.guides.push({ axis: this._dragging.axis, position: this._previewPos });
            }
        } else {
            // Moving existing guide — remove if dragged to ruler/outside
            if (overRuler) {
                const idx = this.guides.indexOf(this._dragging.guide);
                if (idx >= 0) this.guides.splice(idx, 1);
            }
        }

        this._dragging = null;
        this._previewPos = null;
        this.cv.render();
    }

    _isOverRulerOrOutside(clientX, clientY) {
        const containerRect = this.cv.container.getBoundingClientRect();
        return clientX < containerRect.left || clientX > containerRect.right ||
               clientY < containerRect.top || clientY > containerRect.bottom;
    }

    hitTest(clientX, clientY) {
        const rect = this.cv.container.getBoundingClientRect();
        const sx = clientX - rect.left;
        const sy = clientY - rect.top;
        const threshold = 4;

        for (const g of this.guides) {
            if (g.axis === 'h') {
                const gy = this.cv.panY + g.position * this.cv.zoom;
                if (Math.abs(sy - gy) <= threshold) return g;
            } else {
                const gx = this.cv.panX + g.position * this.cv.zoom;
                if (Math.abs(sx - gx) <= threshold) return g;
            }
        }
        return null;
    }

    draw(ctx, w, h, zoom, panX, panY) {
        if (!this.visible) return;

        ctx.lineWidth = 1;

        // Draw placed guides
        ctx.strokeStyle = 'rgba(0, 170, 255, 0.75)';
        for (const g of this.guides) {
            ctx.beginPath();
            if (g.axis === 'h') {
                const sy = Math.round(panY + g.position * zoom) + 0.5;
                ctx.moveTo(0, sy);
                ctx.lineTo(w, sy);
            } else {
                const sx = Math.round(panX + g.position * zoom) + 0.5;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
            }
            ctx.stroke();
        }

        // Draw drag preview
        if (this._dragging && this._dragging.creating && this._previewPos !== null) {
            ctx.strokeStyle = 'rgba(0, 170, 255, 0.4)';
            ctx.beginPath();
            if (this._dragging.axis === 'h') {
                const sy = Math.round(panY + this._previewPos * zoom) + 0.5;
                ctx.moveTo(0, sy);
                ctx.lineTo(w, sy);
            } else {
                const sx = Math.round(panX + this._previewPos * zoom) + 0.5;
                ctx.moveTo(sx, 0);
                ctx.lineTo(sx, h);
            }
            ctx.stroke();
        }
    }

    clear() {
        this.guides = [];
    }
}


/***/ },

/***/ "./js/ui/LayersPanel.js"
/*!******************************!*\
  !*** ./js/ui/LayersPanel.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LayersPanel: () => (/* binding */ LayersPanel)
/* harmony export */ });
class LayersPanel {
    constructor(doc, bus, undoManager) {
        this.doc = doc;
        this.bus = bus;
        this.undoManager = undoManager;

        this.list = document.getElementById('layers-list');
        this._opacityRow = document.getElementById('layer-opacity-row');
        this._opacitySlider = document.getElementById('layer-opacity-slider');
        this._opacityNum = document.getElementById('layer-opacity-num');
        this._opacityBefore = null;
        this._lastClickTime = 0;
        this._lastClickIndex = -1;

        document.getElementById('layer-add-btn').addEventListener('click', () => this._addLayer());
        document.getElementById('layer-del-btn').addEventListener('click', () => this._deleteLayer());
        document.getElementById('layer-up-btn').addEventListener('click', () => this._moveLayer(-1));
        document.getElementById('layer-down-btn').addEventListener('click', () => this._moveLayer(1));
        document.getElementById('layer-dup-btn').addEventListener('click', () => this._duplicateLayer());

        this._opacitySlider.addEventListener('pointerdown', () => {
            this._opacityBefore = this.doc.getActiveLayer().opacity;
        });
        this._opacitySlider.addEventListener('input', () => {
            const val = parseInt(this._opacitySlider.value);
            this._opacityNum.value = val;
            this.doc.getActiveLayer().opacity = val / 100;
            this.bus.emit('layer-changed');
        });
        this._opacitySlider.addEventListener('pointerup', () => {
            const layer = this.doc.getActiveLayer();
            if (this._opacityBefore !== null && layer.opacity !== this._opacityBefore) {
                this.undoManager.pushEntry({
                    type: 'layer-opacity',
                    layerIndex: this.doc.activeLayerIndex,
                    beforeOpacity: this._opacityBefore,
                    afterOpacity: layer.opacity,
                });
            }
            this._opacityBefore = null;
        });
        this._opacityNum.addEventListener('focus', () => {
            this._opacityBefore = this.doc.getActiveLayer().opacity;
        });
        this._opacityNum.addEventListener('change', () => {
            const val = Math.max(0, Math.min(100, parseInt(this._opacityNum.value) || 100));
            this._opacitySlider.value = val;
            this._opacityNum.value = val;
            const layer = this.doc.getActiveLayer();
            layer.opacity = val / 100;
            if (this._opacityBefore !== null && layer.opacity !== this._opacityBefore) {
                this.undoManager.pushEntry({
                    type: 'layer-opacity',
                    layerIndex: this.doc.activeLayerIndex,
                    beforeOpacity: this._opacityBefore,
                    afterOpacity: layer.opacity,
                });
            }
            this._opacityBefore = null;
            this.bus.emit('layer-changed');
        });

        this.bus.on('layer-changed', () => this.render());
        this.bus.on('document-changed', () => this.render());
        this.bus.on('active-layer-changed', () => this.render());

        this.render();
    }

    _snapshotMeta() {
        return {
            activeIndex: this.doc.activeLayerIndex,
            selected: new Set(this.doc.selectedLayerIndices),
            frames: this.doc.animationEnabled ? this.doc.frames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({
                    ...ld,
                    data: ld.data.slice(),
                })) : null,
            })) : null,
        };
    }

    render() {
        // Sync opacity controls
        const activeLayer = this.doc.getActiveLayer();
        const multiSelected = this.doc.selectedLayerIndices.size >= 2;
        if (activeLayer && !multiSelected) {
            const pct = Math.round(activeLayer.opacity * 100);
            this._opacitySlider.value = pct;
            this._opacityNum.value = pct;
            this._opacityRow.classList.remove('disabled');
        } else {
            this._opacityRow.classList.add('disabled');
        }

        this.list.innerHTML = '';

        // Render layers top-to-bottom (reverse of array order, since array[0] = bottom)
        for (let i = this.doc.layers.length - 1; i >= 0; i--) {
            const layer = this.doc.layers[i];
            const item = document.createElement('div');
            const isActive = i === this.doc.activeLayerIndex;
            const isSelected = this.doc.selectedLayerIndices.has(i);
            item.className = 'layer-item' + (isActive ? ' active' : '') + (isSelected ? ' selected' : '');

            // Visibility toggle
            const vis = document.createElement('div');
            vis.className = 'layer-visibility' + (layer.visible ? '' : ' hidden');
            vis.textContent = layer.visible ? '👁' : '○';
            vis.addEventListener('click', (e) => {
                e.stopPropagation();
                const beforeStates = this.doc.layers.map(l => l.visible);
                layer.visible = !layer.visible;
                const afterStates = this.doc.layers.map(l => l.visible);
                this.undoManager.pushEntry({
                    type: 'layer-visibility',
                    beforeStates,
                    afterStates,
                });
                this.bus.emit('layer-changed');
            });
            vis.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const beforeStates = this.doc.layers.map(l => l.visible);
                const isSolo = this.doc.layers.every(l => l === layer ? l.visible : !l.visible);
                for (const l of this.doc.layers) l.visible = isSolo ? true : (l === layer);
                const afterStates = this.doc.layers.map(l => l.visible);
                this.undoManager.pushEntry({
                    type: 'layer-visibility',
                    beforeStates,
                    afterStates,
                });
                this.bus.emit('layer-changed');
            });

            // Thumbnail
            let thumb;
            if (layer.type === 'text') {
                thumb = document.createElement('div');
                thumb.className = 'layer-thumbnail layer-text-icon';
                thumb.textContent = 'T';
            } else {
                thumb = document.createElement('canvas');
                thumb.className = 'layer-thumbnail';
                thumb.width = 32;
                thumb.height = 32;
                this._drawThumbnail(thumb, layer);
            }

            // Name
            const name = document.createElement('span');
            name.className = 'layer-name';
            name.textContent = layer.name;

            item.addEventListener('click', (e) => {
                const now = Date.now();
                if (now - this._lastClickTime < 400 && this._lastClickIndex === i) {
                    this._lastClickTime = 0;
                    this._startRename(name, layer, i);
                    return;
                }
                this._lastClickTime = now;
                this._lastClickIndex = i;

                if (e.ctrlKey) {
                    // Can't deselect the active layer — it's always selected
                    if (i !== this.doc.activeLayerIndex) {
                        const sel = this.doc.selectedLayerIndices;
                        if (sel.has(i)) {
                            sel.delete(i);
                        } else {
                            sel.add(i);
                        }
                    }
                    this.bus.emit('layer-changed');
                } else {
                    this.doc.selectedLayerIndices.clear();
                    this.doc.selectedLayerIndices.add(i);
                    this.doc.activeLayerIndex = i;
                    this.bus.emit('active-layer-changed');
                }
                this.render();
            });

            item.appendChild(vis);
            item.appendChild(thumb);
            item.appendChild(name);
            this.list.appendChild(item);
        }
    }

    _drawThumbnail(canvas, layer) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, 32, 32);

        const docW = this.doc.width;
        const docH = this.doc.height;

        // Fit document ratio into 32x32 thumbnail
        const scale = Math.min(32 / docW, 32 / docH);
        const dw = Math.round(docW * scale);
        const dh = Math.round(docH * scale);
        const dx = Math.round((32 - dw) / 2);
        const dy = Math.round((32 - dh) / 2);

        // Visible portion of the layer within document bounds
        const lx0 = Math.max(0, layer.offsetX);
        const ly0 = Math.max(0, layer.offsetY);
        const lx1 = Math.min(docW, layer.offsetX + layer.width);
        const ly1 = Math.min(docH, layer.offsetY + layer.height);
        const vw = lx1 - lx0;
        const vh = ly1 - ly0;
        if (vw <= 0 || vh <= 0) return;

        const imgData = new ImageData(vw, vh);
        const buf = imgData.data;
        for (let y = 0; y < vh; y++) {
            for (let x = 0; x < vw; x++) {
                const lx = (lx0 - layer.offsetX) + x;
                const ly = (ly0 - layer.offsetY) + y;
                const colorIndex = layer.data[ly * layer.width + lx];
                if (colorIndex > 255) continue;
                const [r, g, b] = this.doc.palette.getColor(colorIndex);
                const off = (y * vw + x) * 4;
                buf[off] = r;
                buf[off + 1] = g;
                buf[off + 2] = b;
                buf[off + 3] = 255;
            }
        }

        const tmp = document.createElement('canvas');
        tmp.width = vw;
        tmp.height = vh;
        tmp.getContext('2d').putImageData(imgData, 0, 0);

        // Draw the visible portion at its correct position within the thumbnail
        ctx.drawImage(tmp, 0, 0, vw, vh,
            dx + Math.round(lx0 * scale), dy + Math.round(ly0 * scale),
            Math.round(vw * scale) || 1, Math.round(vh * scale) || 1);
    }

    _startRename(nameEl, layer, layerIndex) {
        const beforeName = layer.name;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'layer-name-input';
        input.value = layer.name;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        const commit = () => {
            const trimmed = input.value.trim();
            if (trimmed && trimmed !== beforeName) {
                layer.name = trimmed;
                this.undoManager.pushEntry({
                    type: 'layer-rename',
                    layerIndex,
                    beforeName,
                    afterName: trimmed,
                });
            }
            this.render();
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); this.render(); }
            e.stopPropagation();
        });
        input.addEventListener('blur', commit);
    }

    _addLayer() {
        const before = this._snapshotMeta();
        const layer = this.doc.addLayer();
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        const insertIndex = this.doc.activeLayerIndex;
        const after = this._snapshotMeta();
        this.undoManager.pushEntry({
            type: 'layer-add',
            insertIndex,
            layer,
            beforeActiveIndex: before.activeIndex,
            afterActiveIndex: after.activeIndex,
            beforeSelected: before.selected,
            afterSelected: after.selected,
            beforeFrames: before.frames,
            afterFrames: after.frames,
        });
        this.bus.emit('layer-changed');
    }

    _deleteLayer() {
        const layer = this.doc.layers[this.doc.activeLayerIndex];
        if (!confirm(`Delete layer "${layer.name}"?`)) return;
        const removedIndex = this.doc.activeLayerIndex;
        const before = this._snapshotMeta();
        if (this.doc.removeLayer(removedIndex)) {
            if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
            const after = this._snapshotMeta();
            this.undoManager.pushEntry({
                type: 'layer-delete',
                removedIndex,
                layer,
                beforeActiveIndex: before.activeIndex,
                afterActiveIndex: after.activeIndex,
                beforeSelected: before.selected,
                afterSelected: after.selected,
                beforeFrames: before.frames,
                afterFrames: after.frames,
            });
            this.bus.emit('layer-changed');
        }
    }

    _moveLayer(dir) {
        const from = this.doc.activeLayerIndex;
        // dir=-1 means "up" visually = higher index in array
        const to = from - dir;
        const before = this._snapshotMeta();
        if (this.doc.moveLayer(from, to)) {
            if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
            const after = this._snapshotMeta();
            this.undoManager.pushEntry({
                type: 'layer-move',
                fromIndex: from,
                toIndex: to,
                beforeActiveIndex: before.activeIndex,
                afterActiveIndex: after.activeIndex,
                beforeSelected: before.selected,
                afterSelected: after.selected,
            });
            this.bus.emit('layer-changed');
        }
    }

    _duplicateLayer() {
        const before = this._snapshotMeta();
        const copy = this.doc.duplicateLayer(this.doc.activeLayerIndex);
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        const insertIndex = this.doc.activeLayerIndex;
        const after = this._snapshotMeta();
        this.undoManager.pushEntry({
            type: 'layer-add',
            insertIndex,
            layer: copy,
            beforeActiveIndex: before.activeIndex,
            afterActiveIndex: after.activeIndex,
            beforeSelected: before.selected,
            afterSelected: after.selected,
            beforeFrames: before.frames,
            afterFrames: after.frames,
        });
        this.bus.emit('layer-changed');
    }
}


/***/ },

/***/ "./js/ui/MenuManager.js"
/*!******************************!*\
  !*** ./js/ui/MenuManager.js ***!
  \******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _closeActiveMenu: () => (/* binding */ _closeActiveMenu),
/* harmony export */   _handleMenu: () => (/* binding */ _handleMenu),
/* harmony export */   _setupMenuBar: () => (/* binding */ _setupMenuBar),
/* harmony export */   _showAboutDialog: () => (/* binding */ _showAboutDialog),
/* harmony export */   _showDropdown: () => (/* binding */ _showDropdown),
/* harmony export */   _showEditMenu: () => (/* binding */ _showEditMenu),
/* harmony export */   _showFileMenu: () => (/* binding */ _showFileMenu),
/* harmony export */   _showGridSettingsDialog: () => (/* binding */ _showGridSettingsDialog),
/* harmony export */   _showHelpMenu: () => (/* binding */ _showHelpMenu),
/* harmony export */   _showImageMenu: () => (/* binding */ _showImageMenu),
/* harmony export */   _showLayerMenu: () => (/* binding */ _showLayerMenu),
/* harmony export */   _showSelectionMenu: () => (/* binding */ _showSelectionMenu),
/* harmony export */   _showViewMenu: () => (/* binding */ _showViewMenu)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");
/* harmony import */ var _model_Brush_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/Brush.js */ "./js/model/Brush.js");
/* harmony import */ var _dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dialogHelpers.js */ "./js/ui/dialogHelpers.js");
/* harmony import */ var _Dialog_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Dialog.js */ "./js/ui/Dialog.js");





/**
 * Menu bar infrastructure and menu definitions.
 * Methods are mixed into App.prototype — `this` refers to the App instance.
 */

function _setupMenuBar() {
    this._activeMenuName = null;
    this._activeDropdown = null;
    this._closeMenuListener = null;

    const menuItems = document.querySelectorAll('#menubar .menu-item');
    for (const item of menuItems) {
        item.addEventListener('click', () => {
            const menu = item.dataset.menu;
            if (this._activeMenuName === menu) {
                this._closeActiveMenu();
            } else {
                this._handleMenu(menu);
            }
        });
        item.addEventListener('mouseenter', () => {
            if (this._activeMenuName && this._activeMenuName !== item.dataset.menu) {
                this._handleMenu(item.dataset.menu);
            }
        });
    }
}

function _closeActiveMenu() {
    if (this._activeDropdown) {
        this._activeDropdown.remove();
        this._activeDropdown = null;
    }
    if (this._closeMenuListener) {
        document.removeEventListener('pointerdown', this._closeMenuListener);
        this._closeMenuListener = null;
    }
    this._activeMenuName = null;
}

function _handleMenu(menu) {
    switch (menu) {
        case 'file':
            this._showFileMenu();
            break;
        case 'edit':
            this._showEditMenu();
            break;
        case 'selection':
            this._showSelectionMenu();
            break;
        case 'view':
            this._showViewMenu();
            break;
        case 'image':
            this._showImageMenu();
            break;
        case 'layer':
            this._showLayerMenu();
            break;
        case 'help':
            this._showHelpMenu();
            break;
    }
}

function _showDropdown(anchorEl, menuName, items) {
    this._closeActiveMenu();

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.style.cssText = `
        position: fixed; background: #2d2d30; border: 1px solid #555;
        border-radius: 4px; padding: 4px 0; min-width: 180px; z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    const rect = anchorEl.getBoundingClientRect();
    dropdown.style.left = rect.left + 'px';
    dropdown.style.top = rect.bottom + 'px';

    for (const item of items) {
        if (item === '-') {
            const sep = document.createElement('div');
            sep.style.cssText = 'height: 1px; background: #555; margin: 4px 8px;';
            dropdown.appendChild(sep);
            continue;
        }

        const disabled = item.disabled === true;
        const el = document.createElement('div');
        el.style.cssText = `
            padding: 6px 16px; cursor: ${disabled ? 'default' : 'pointer'}; font-size: 12px;
            color: ${disabled ? '#666' : '#ccc'};
            display: flex; justify-content: space-between;
        `;
        el.innerHTML = `<span>${item.label}</span>${item.shortcut ? `<span style="color:#888; margin-left:24px">${item.shortcut}</span>` : ''}`;
        if (!disabled) {
            el.addEventListener('mouseenter', () => { el.style.background = '#007acc'; });
            el.addEventListener('mouseleave', () => { el.style.background = 'none'; });
            el.addEventListener('click', () => {
                this._closeActiveMenu();
                item.action();
            });
        }
        dropdown.appendChild(el);
    }

    document.body.appendChild(dropdown);
    this._activeDropdown = dropdown;
    this._activeMenuName = menuName || null;

    // Close on click outside
    this._closeMenuListener = (e) => {
        if (!dropdown.contains(e.target) && !e.target.closest('#menubar')) {
            this._closeActiveMenu();
        }
    };
    const listener = this._closeMenuListener;
    setTimeout(() => {
        if (this._closeMenuListener === listener) {
            document.addEventListener('pointerdown', listener);
        }
    }, 0);
}

function _showFileMenu() {
    const anchor = document.querySelector('[data-menu="file"]');
    this._showDropdown(anchor, 'file', [
        { label: 'New...', shortcut: '', action: () => this._newDocument() },
        { label: 'Open...', shortcut: 'Ctrl+O', action: () => this._openFile() },
        { label: 'Close Tab', disabled: this._tabs.length <= 1, action: () => this._closeTab(this._activeTabId) },
        '-',
        { label: 'Save Project (.pix8)', shortcut: 'Ctrl+S', action: () => this._saveProject() },
        '-',
        { label: 'Import as Layer...', action: () => this._importAsLayer() },
        '-',
        { label: 'Export as...', shortcut: 'Ctrl+Shift+E', action: () => this._showExportDialog() },
    ]);
}

function _showEditMenu() {
    const anchor = document.querySelector('[data-menu="edit"]');
    this._showDropdown(anchor, 'edit', [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => this.undoManager.undo(),
          disabled: this._freeTransformTool?.isTransformActive },
        { label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => this.undoManager.redo(),
          disabled: this._freeTransformTool?.isTransformActive },
        '-',
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => this._cut() },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => this._copy() },
        { label: 'Copy Merged', shortcut: 'Ctrl+Shift+C', action: () => this._copyMerged() },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => this._clipboard ? this._paste() : this._pasteFromClipboard() },
        { label: 'Paste in Place', shortcut: 'Ctrl+Shift+V', action: () => this._pasteInPlace() },
        '-',
        { label: 'Clear', shortcut: 'Delete', action: () => this._clearSelection() },
        '-',
        { label: 'Set Brush from Selection', shortcut: 'Ctrl+B', action: () => this._setBrushFromSelection() },
        '-',
        { label: (this.doc.animationEnabled ? '\u2713 ' : '') + 'Enable Animation', action: () => this._toggleAnimation() },
    ]);
}

function _showSelectionMenu() {
    const anchor = document.querySelector('[data-menu="selection"]');
    const sel = this.doc.selection;
    const hasSel = sel.active;
    this._showDropdown(anchor, 'selection', [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => {
            if (sel.hasFloating()) sel.commitFloating(this.doc.getActiveLayer());
            sel.selectAll();
            this.bus.emit('selection-changed');
        }},
        { label: 'Deselect', shortcut: 'Ctrl+D', disabled: !hasSel, action: () => {
            if (sel.hasFloating()) {
                this.undoManager.beginOperation();
                sel.commitFloating(this.doc.getActiveLayer());
                this.undoManager.endOperation();
            }
            sel.clear();
            this.bus.emit('selection-changed');
        }},
        { label: 'Invert', action: () => this._invertSelection() },
        '-',
        { label: 'Expand...', disabled: !hasSel, action: () => this._expandShrinkSelection(1) },
        { label: 'Shrink...', disabled: !hasSel, action: () => this._expandShrinkSelection(-1) },
        '-',
        { label: 'Select by Alpha', action: () => this._selectByAlpha() },
    ]);
}

function _showViewMenu() {
    const anchor = document.querySelector('[data-menu="view"]');
    const cv = this.canvasView;
    this._showDropdown(anchor, 'view', [
        { label: 'Zoom In', shortcut: '+', action: () => this._zoomStep(1) },
        { label: 'Zoom Out', shortcut: '-', action: () => this._zoomStep(-1) },
        '-',
        { label: 'Reset Zoom', action: () => {
            cv.zoomIndex = 3;
            cv.zoom = _constants_js__WEBPACK_IMPORTED_MODULE_0__.ZOOM_LEVELS[2];
            cv._centerDocument();
            this.bus.emit('zoom-changed', cv.zoom);
            cv.render();
        }},
        '-',
        { label: (cv.gridVisible ? '\u2713 ' : '') + 'Show Grid', shortcut: "Ctrl+'", action: () => {
            cv.gridVisible = !cv.gridVisible; cv.render();
        }},
        { label: (cv.snapToGrid ? '\u2713 ' : '') + 'Snap to Grid', shortcut: "Ctrl+Shift+'", action: () => {
            cv.snapToGrid = !cv.snapToGrid;
        }},
        { label: 'Grid Settings...', action: () => this._showGridSettingsDialog() },
        '-',
        { label: (cv.rulersVisible ? '\u2713 ' : '') + 'Show Rulers', shortcut: 'Alt+R', action: () => {
            cv.setRulersVisible(!cv.rulersVisible);
        }},
        '-',
        { label: (cv.guides.visible ? '\u2713 ' : '') + 'Show Guides', shortcut: 'Ctrl+;', action: () => {
            cv.guides.visible = !cv.guides.visible; cv.render();
        }},
        { label: 'Clear All Guides', action: () => {
            cv.guides.clear(); cv.render();
        }, disabled: cv.guides.guides.length === 0 },
    ]);
}

function _showImageMenu() {
    const anchor = document.querySelector('[data-menu="image"]');
    this._showDropdown(anchor, 'image', [
        { label: 'Resize...', action: () => this._showResizeDialog() },
        '-',
        { label: 'Rotate Left', action: () => this._rotateImage(false) },
        { label: 'Rotate Right', action: () => this._rotateImage(true) },
        '-',
        { label: 'Reset Brush', shortcut: '1', action: () => {
            this.doc.activeBrush = _model_Brush_js__WEBPACK_IMPORTED_MODULE_1__.Brush.default();
            this.bus.emit('brush-changed');
        }},
    ]);
}

function _showLayerMenu() {
    const anchor = document.querySelector('[data-menu="layer"]');
    const sel = this.doc.selectedLayerIndices;
    const multiSelected = sel.size >= 2;
    const activeLayer = this.doc.getActiveLayer();
    const isTextLayer = activeLayer && activeLayer.type === 'text';
    this._showDropdown(anchor, 'layer', [
        { label: 'Convert to Bitmap', disabled: !isTextLayer, action: () => this._convertTextToBitmap() },
        { label: 'Trim to Content', disabled: isTextLayer, action: () => this._trimLayerToContent() },
        { label: 'Crop to Canvas', disabled: isTextLayer, action: () => this._cropLayerToCanvas() },
        '-',
        { label: 'Set Fixed Size...', disabled: isTextLayer, action: () => this._setFixedSize() },
        { label: 'Remove Fixed Size', disabled: !activeLayer || !activeLayer.isFixedSize, action: () => this._removeFixedSize() },
        '-',
        { label: (this.canvasView.showLayerBorder ? '\u2713 ' : '') + 'Show Border', action: () => {
            this.canvasView.showLayerBorder = !this.canvasView.showLayerBorder;
            this.canvasView.render();
        }},
        '-',
        { label: 'Merge Selected', disabled: !multiSelected, action: () => this._mergeSelectedLayers() },
        { label: 'Merge All', action: () => {
            const doc = this.doc;
            if (doc.layers.length < 2) return;
            // Select all layers and delegate to merge selected
            doc.selectedLayerIndices.clear();
            for (let i = 0; i < doc.layers.length; i++) doc.selectedLayerIndices.add(i);
            this._mergeSelectedLayers();
        }},
    ]);
}

function _showGridSettingsDialog() {
    const dlg = _Dialog_js__WEBPACK_IMPORTED_MODULE_3__["default"].create({
        title: 'Grid Settings',
        width: '280px',
        buttons: [
            { label: 'Cancel' },
            { label: 'OK', primary: true, onClick: () => {
                const val = Math.max(2, Math.min(256, parseInt(sizeInput.value) || 16));
                this.canvasView.gridSize = val;
                this.canvasView.render();
                dlg.close();
            }},
        ],
        enterButton: 1,
    });

    const labelStyle = 'font-size:13px;color:var(--text);width:70px;';
    const inputStyle = 'flex:1;padding:3px 6px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:3px;font-size:13px;text-align:center;';

    dlg.body.style.cssText = 'display:flex;flex-direction:column;gap:8px;padding:8px 0;';

    const sizeRow = document.createElement('div');
    sizeRow.style.cssText = _dialogHelpers_js__WEBPACK_IMPORTED_MODULE_2__.ROW_STYLE;
    const sizeLabel = document.createElement('label');
    sizeLabel.textContent = 'Grid Size:';
    sizeLabel.style.cssText = labelStyle;
    const sizeInput = document.createElement('input');
    sizeInput.type = 'number';
    sizeInput.min = 2;
    sizeInput.max = 256;
    sizeInput.value = this.canvasView.gridSize;
    sizeInput.style.cssText = inputStyle;
    sizeRow.appendChild(sizeLabel);
    sizeRow.appendChild(sizeInput);
    dlg.body.appendChild(sizeRow);

    const presetRow = document.createElement('div');
    presetRow.style.cssText = 'display:flex;gap:6px;';
    for (const s of [8, 16, 32]) {
        const btn = document.createElement('button');
        btn.textContent = `${s}\u00D7${s}`;
        btn.style.cssText = 'flex:1;padding:4px;font-size:12px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;';
        btn.addEventListener('click', () => { sizeInput.value = s; });
        presetRow.appendChild(btn);
    }
    dlg.body.appendChild(presetRow);

    dlg.show(sizeInput);
}

function _showHelpMenu() {
    const anchor = document.querySelector('[data-menu="help"]');
    this._showDropdown(anchor, 'help', [
        { label: 'About Pix8...', action: () => this._showAboutDialog() },
    ]);
}

function _showAboutDialog() {
    const dlg = _Dialog_js__WEBPACK_IMPORTED_MODULE_3__["default"].create({
        title: 'About Pix8',
        width: '380px',
        buttons: [
            { label: 'Close', primary: true },
        ],
        enterButton: 0,
    });

    dlg.body.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:12px 4px;font-size:13px;color:var(--text);line-height:1.5;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:16px;font-weight:bold;';
    title.textContent = `Pix8 v${_constants_js__WEBPACK_IMPORTED_MODULE_0__.ASSET_VERSION}`;
    dlg.body.appendChild(title);

    const desc = document.createElement('div');
    desc.textContent = 'A 256-color indexed pixel art editor for the browser, inspired by VGA-era workflows where every color comes from a shared 256-entry palette.';
    dlg.body.appendChild(desc);

    const linkStyle = 'color:var(--accent);text-decoration:none;';
    const makeRow = (label, url) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;';
        const lbl = document.createElement('span');
        lbl.textContent = label;
        lbl.style.cssText = 'min-width:84px;color:var(--text-muted, #aaa);';
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = url;
        link.style.cssText = linkStyle;
        row.appendChild(lbl);
        row.appendChild(link);
        return row;
    };

    dlg.body.appendChild(makeRow('Website:', 'https://pix8.app'));
    dlg.body.appendChild(makeRow('Repository:', 'https://github.com/DynartInteractive/Pix8'));
    dlg.body.appendChild(makeRow('Developer:', 'https://dynart.net'));

    dlg.show(dlg.getButton(0));
}


/***/ },

/***/ "./js/ui/PaletteEditDialog.js"
/*!************************************!*\
  !*** ./js/ui/PaletteEditDialog.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PaletteEditDialog: () => (/* binding */ PaletteEditDialog)
/* harmony export */ });
/* harmony import */ var _util_io_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../util/io.js */ "./js/util/io.js");


class PaletteEditDialog {
    constructor(doc, bus, undoManager) {
        this.doc = doc;
        this.bus = bus;
        this.undoManager = undoManager;
        this.onClose = null;
        this.onPick = null; // callback(colorIndex) — pick mode

        this._overlay = null;
        this._onKey = null;
        this._dlgSwatches = [];
        this._rangeStart = doc.fgColorIndex;
        this._rangeEnd = doc.fgColorIndex;
        this._dragging = false;
        this._6bit = true;
        this._pendingOp = null;
        this._originalPalette = null;
        this._originalLayers = null;
        this._statusEl = null;
        this._usedHighlight = false;
        this._paletteHistory = [];
        this._undoBtn = null;
        this._sliderDirty = false;

        // HSV picker state
        this._hue = 0;        // 0-360
        this._sat = 0;        // 0-1
        this._val = 1;        // 0-1
        this._svCanvas = null;
        this._svCtx = null;
        this._hueCanvas = null;
        this._hueCtx = null;
        this._svCursor = null;
        this._hueCursor = null;
        this._svDragging = false;
        this._hueDragging = false;

        this._rSlider = null; this._gSlider = null; this._bSlider = null;
        this._rNum = null; this._gNum = null; this._bNum = null; this._hexInput = null;
        this._indexLabel = null;
        this._rangePreview = null;
        this._grid = null;
    }

    setInitialIndex(idx) {
        this._rangeStart = idx;
        this._rangeEnd = idx;
    }

    open() {
        this._originalPalette = this.doc.palette.export();
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        this._originalLayers = this.doc.layers.map(l => l.clone(true));
        this._originalFrames = this.doc.animationEnabled ? this.doc.frames.map(f => ({
            ...f,
            layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
        })) : null;
        this._buildDOM();
        document.body.appendChild(this._overlay);
    }

    // ── DOM Construction ──────────────────────────────────────────────

    _buildDOM() {
        const overlay = document.createElement('div');
        overlay.className = 'palette-dialog-overlay';
        this._overlay = overlay;

        const dialog = document.createElement('div');
        dialog.className = 'palette-dialog';

        // Header
        const header = document.createElement('div');
        header.className = 'palette-dialog-header';
        header.innerHTML = '<span>Edit Palette</span>';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'palette-dialog-close';
        closeBtn.textContent = '\u00D7';
        closeBtn.addEventListener('click', () => this._cancel());
        header.appendChild(closeBtn);
        dialog.appendChild(header);

        // Toolbar (full width)
        dialog.appendChild(this._buildToolbar());

        // 6-bit checkbox
        const checkRow = document.createElement('div');
        checkRow.className = 'palette-dialog-6bit';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'palette-6bit-check';
        checkbox.checked = this._6bit;
        checkbox.addEventListener('change', () => this._on6bitToggle(checkbox));
        const checkLabel = document.createElement('label');
        checkLabel.htmlFor = 'palette-6bit-check';
        checkLabel.textContent = '6 bit/channel';
        checkRow.appendChild(checkbox);
        checkRow.appendChild(checkLabel);
        dialog.appendChild(checkRow);

        // Status message (for two-step ops)
        const status = document.createElement('div');
        status.className = 'palette-dialog-status';
        status.style.display = 'none';
        this._statusEl = status;
        dialog.appendChild(status);

        // Index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'palette-dialog-index';
        this._indexLabel = indexLabel;
        dialog.appendChild(indexLabel);

        // Grid row: grid (left) + sliders (right)
        const gridRow = document.createElement('div');
        gridRow.className = 'ped-grid-row';

        const grid = document.createElement('div');
        grid.className = 'palette-dialog-grid';
        this._grid = grid;
        this._dlgSwatches = [];

        for (let i = 0; i < 256; i++) {
            const sw = document.createElement('div');
            sw.className = 'palette-dialog-swatch';
            sw.dataset.index = i;
            const [r, g, b] = this.doc.palette.getColor(i);
            sw.style.backgroundColor = `rgb(${r},${g},${b})`;
            grid.appendChild(sw);
            this._dlgSwatches.push(sw);
        }

        grid.addEventListener('pointerdown', (e) => this._onGridPointerDown(e));
        grid.addEventListener('pointermove', (e) => this._onGridPointerMove(e));
        grid.addEventListener('pointerup', (e) => this._onGridPointerUp(e));

        // Grid column: grid + range preview stacked
        const gridCol = document.createElement('div');
        gridCol.className = 'ped-grid-col';
        gridCol.appendChild(grid);

        const rangePreview = document.createElement('div');
        rangePreview.className = 'palette-dialog-range-preview';
        this._rangePreview = rangePreview;
        gridCol.appendChild(rangePreview);

        gridRow.appendChild(gridCol);
        gridRow.appendChild(this._buildColorPicker());
        dialog.appendChild(gridRow);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'palette-dialog-footer';

        const leftBtns = document.createElement('div');
        leftBtns.className = 'palette-dialog-footer-btns';

        const undoBtn = document.createElement('button');
        undoBtn.textContent = 'Undo';
        undoBtn.disabled = true;
        undoBtn.addEventListener('click', () => this._undoPalette());
        this._undoBtn = undoBtn;
        leftBtns.appendChild(undoBtn);

        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => this._loadPalette());
        leftBtns.appendChild(loadBtn);

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.addEventListener('click', () => this._savePalette());
        leftBtns.appendChild(saveBtn);

        footer.appendChild(leftBtns);

        const rightBtns = document.createElement('div');
        rightBtns.className = 'palette-dialog-footer-btns';
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => this._cancel());
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.className = 'primary';
        okBtn.addEventListener('click', () => this._ok());
        rightBtns.appendChild(cancelBtn);
        rightBtns.appendChild(okBtn);
        footer.appendChild(rightBtns);
        dialog.appendChild(footer);

        overlay.appendChild(dialog);

        let overlayMouseDown = false;
        overlay.addEventListener('mousedown', (e) => {
            overlayMouseDown = e.target === overlay;
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && overlayMouseDown) this._cancel();
            overlayMouseDown = false;
        });

        this._onKey = (e) => {
            if (e.key === 'Escape') {
                if (this._pendingOp) {
                    this._cancelPendingOp();
                } else {
                    this._cancel();
                }
            }
        };
        document.addEventListener('keydown', this._onKey);

        this._updateRangeHighlight();
        this._updateRangePreview();
        this._syncPicker();
    }

    _buildToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'palette-dialog-toolbar';

        const btn = (label, action) => {
            const b = document.createElement('button');
            b.textContent = label;
            b.addEventListener('click', action);
            toolbar.appendChild(b);
            return b;
        };

        this._swapBtn = btn('Swap', () => this._startPendingOp('swap'));
        this._xswapBtn = btn('X-Swap', () => this._startPendingOp('xswap'));
        btn('Copy', () => this._actionCopyRange());
        this._pasteRangeBtn = btn('Paste', () => this._actionPasteRange());
        this._pasteRangeBtn.disabled = !PaletteEditDialog._rangeClipboard;
        this._flipBtn = btn('Flip', () => this._actionFlip());
        this._xflipBtn = btn('X-Flip', () => this._actionXFlip());

        // Sort select
        const sortSel = document.createElement('select');
        sortSel.className = 'palette-dialog-toolbar-select';
        this._sortSel = sortSel;
        for (const [val, label] of [['', 'Sort...'], ['hue', 'Hue/Light'], ['light', 'Lightness'], ['hist', 'Histogram']]) {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = label;
            sortSel.appendChild(opt);
        }
        sortSel.addEventListener('change', () => {
            if (sortSel.value) {
                this._actionSort(sortSel.value);
                sortSel.value = '';
            }
        });
        toolbar.appendChild(sortSel);

        btn('Used', () => this._actionUsed());
        this._invertBtn = btn('Invert', () => this._actionInvert());
        this._grayBtn = btn('Gray', () => this._actionGray());
        this._spreadBtn = btn('Spread', () => this._actionSpread());
        this._mergeBtn = btn('Merge', () => this._actionMerge());
        btn('Zap', () => this._actionZapUnused());

        // Separator
        const sep = document.createElement('div');
        sep.className = 'ped-toolbar-sep';
        toolbar.appendChild(sep);

        // Reduce row
        const reduceRow = document.createElement('div');
        reduceRow.className = 'ped-reduce-row';
        const reduceBtn = document.createElement('button');
        reduceBtn.textContent = 'Reduce to';
        const reduceNum = document.createElement('input');
        reduceNum.type = 'number';
        reduceNum.min = 1;
        reduceNum.max = 256;
        reduceNum.value = 16;
        reduceNum.className = 'palette-dialog-toolbar-num';
        reduceBtn.addEventListener('click', () => this._actionReduce(parseInt(reduceNum.value) || 16));
        reduceRow.appendChild(reduceBtn);
        reduceRow.appendChild(reduceNum);
        toolbar.appendChild(reduceRow);

        return toolbar;
    }

    _buildColorPicker() {
        const container = document.createElement('div');
        container.className = 'ped-color-picker';

        // Top row: SV canvas + hue strip
        const pickerRow = document.createElement('div');
        pickerRow.className = 'ped-picker-row';

        // SV area
        const svArea = document.createElement('div');
        svArea.className = 'ped-sv-area';

        const svCanvas = document.createElement('canvas');
        svCanvas.className = 'ped-sv-canvas';
        svCanvas.width = 160;
        svCanvas.height = 160;
        this._svCanvas = svCanvas;
        this._svCtx = svCanvas.getContext('2d');
        svArea.appendChild(svCanvas);

        const svCursor = document.createElement('div');
        svCursor.className = 'ped-sv-cursor';
        this._svCursor = svCursor;
        svArea.appendChild(svCursor);

        svCanvas.addEventListener('pointerdown', (e) => this._onSVPointerDown(e));
        svCanvas.addEventListener('pointermove', (e) => this._onSVPointerMove(e));
        svCanvas.addEventListener('pointerup', (e) => this._onSVPointerUp(e));

        pickerRow.appendChild(svArea);

        // Hue strip
        const hueStrip = document.createElement('div');
        hueStrip.className = 'ped-hue-strip';

        const hueCanvas = document.createElement('canvas');
        hueCanvas.className = 'ped-hue-canvas';
        hueCanvas.width = 20;
        hueCanvas.height = 160;
        this._hueCanvas = hueCanvas;
        this._hueCtx = hueCanvas.getContext('2d');
        hueStrip.appendChild(hueCanvas);

        const hueCursor = document.createElement('div');
        hueCursor.className = 'ped-hue-cursor';
        this._hueCursor = hueCursor;
        hueStrip.appendChild(hueCursor);

        hueCanvas.addEventListener('pointerdown', (e) => this._onHuePointerDown(e));
        hueCanvas.addEventListener('pointermove', (e) => this._onHuePointerMove(e));
        hueCanvas.addEventListener('pointerup', (e) => this._onHuePointerUp(e));

        pickerRow.appendChild(hueStrip);
        container.appendChild(pickerRow);

        // RGB slider rows
        const max = this._6bit ? 63 : 255;
        const makeSliderRow = (label) => {
            const row = document.createElement('div');
            row.className = 'ped-inputs-row';

            const lbl = document.createElement('div');
            lbl.className = 'ped-rgb-label';
            lbl.textContent = label;
            row.appendChild(lbl);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = 0;
            slider.max = max;
            slider.value = 0;
            slider.className = 'ped-rgb-slider';
            row.appendChild(slider);

            const num = document.createElement('input');
            num.type = 'number';
            num.min = 0;
            num.max = max;
            num.value = 0;
            num.className = 'ped-rgb-num';
            row.appendChild(num);

            container.appendChild(row);
            return { slider, num };
        };

        const rRow = makeSliderRow('R');
        const gRow = makeSliderRow('G');
        const bRow = makeSliderRow('B');

        this._rSlider = rRow.slider; this._rNum = rRow.num;
        this._gSlider = gRow.slider; this._gNum = gRow.num;
        this._bSlider = bRow.slider; this._bNum = bRow.num;

        const applyFromSliders = () => {
            this._rNum.value = this._rSlider.value;
            this._gNum.value = this._gSlider.value;
            this._bNum.value = this._bSlider.value;
            this._applyFromRGBInputs();
        };

        for (const s of [this._rSlider, this._gSlider, this._bSlider]) {
            s.addEventListener('input', applyFromSliders);
        }
        for (const n of [this._rNum, this._gNum, this._bNum]) {
            n.addEventListener('change', () => this._applyFromRGBInputs());
        }

        // Hex row
        const hexRow = document.createElement('div');
        hexRow.className = 'ped-inputs-row';

        const hexLabel = document.createElement('div');
        hexLabel.className = 'ped-rgb-label';
        hexLabel.textContent = '#';
        hexRow.appendChild(hexLabel);

        const hexInput = document.createElement('input');
        hexInput.type = 'text';
        hexInput.maxLength = 6;
        hexInput.className = 'ped-hex-input';
        hexInput.value = '000000';
        this._hexInput = hexInput;
        hexRow.appendChild(hexInput);

        hexInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text');
            hexInput.value = text.replace(/^#/, '').slice(0, 6);
            hexInput.dispatchEvent(new Event('change'));
        });

        hexInput.addEventListener('change', () => this._applyFromHexInput());

        container.appendChild(hexRow);

        return container;
    }

    // ── HSV Conversion ───────────────────────────────────────────────

    _rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const d = max - min;
        const v = max;
        const s = max === 0 ? 0 : d / max;
        let h = 0;
        if (d !== 0) {
            if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
            else if (max === g) h = ((b - r) / d + 2) * 60;
            else h = ((r - g) / d + 4) * 60;
        }
        return [h, s, v];
    }

    _hsvToRgb(h, s, v) {
        h = ((h % 360) + 360) % 360;
        const c = v * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = v - c;
        let r, g, b;
        if (h < 60)       { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else               { r = c; g = 0; b = x; }
        return [
            Math.round((r + m) * 255),
            Math.round((g + m) * 255),
            Math.round((b + m) * 255)
        ];
    }

    // ── Color Picker Rendering ───────────────────────────────────────

    _renderSVCanvas() {
        const ctx = this._svCtx;
        const w = this._svCanvas.width;
        const h = this._svCanvas.height;
        const [r, g, b] = this._hsvToRgb(this._hue, 1, 1);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(0, 0, w, h);
        const white = ctx.createLinearGradient(0, 0, w, 0);
        white.addColorStop(0, 'rgba(255,255,255,1)');
        white.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = white;
        ctx.fillRect(0, 0, w, h);
        const black = ctx.createLinearGradient(0, 0, 0, h);
        black.addColorStop(0, 'rgba(0,0,0,0)');
        black.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = black;
        ctx.fillRect(0, 0, w, h);
    }

    _renderHueStrip() {
        const ctx = this._hueCtx;
        const w = this._hueCanvas.width;
        const h = this._hueCanvas.height;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        for (const deg of [0, 60, 120, 180, 240, 300, 360]) {
            const [r, g, b] = this._hsvToRgb(deg, 1, 1);
            grad.addColorStop(deg / 360, `rgb(${r},${g},${b})`);
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    _updateSVCursor() {
        const w = this._svCanvas.width;
        const h = this._svCanvas.height;
        this._svCursor.style.left = (this._sat * w) + 'px';
        this._svCursor.style.top = ((1 - this._val) * h) + 'px';
    }

    _updateHueCursor() {
        const h = this._hueCanvas.height;
        this._hueCursor.style.top = (this._hue / 360 * h) + 'px';
    }

    // ── SV Canvas Interaction ────────────────────────────────────────

    _onSVPointerDown(e) {
        if (e.button !== 0) return;
        this._svDragging = true;
        e.target.setPointerCapture(e.pointerId);
        this._updateSVFromPointer(e);
    }

    _onSVPointerMove(e) {
        if (!this._svDragging) return;
        this._updateSVFromPointer(e);
    }

    _onSVPointerUp(e) {
        if (!this._svDragging) return;
        this._svDragging = false;
        e.target.releasePointerCapture(e.pointerId);
    }

    _updateSVFromPointer(e) {
        const rect = this._svCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this._sat = Math.max(0, Math.min(1, x / rect.width));
        this._val = Math.max(0, Math.min(1, 1 - y / rect.height));
        this._updateSVCursor();
        this._applyPickerColor();
    }

    // ── Hue Strip Interaction ────────────────────────────────────────

    _onHuePointerDown(e) {
        if (e.button !== 0) return;
        this._hueDragging = true;
        e.target.setPointerCapture(e.pointerId);
        this._updateHueFromPointer(e);
    }

    _onHuePointerMove(e) {
        if (!this._hueDragging) return;
        this._updateHueFromPointer(e);
    }

    _onHuePointerUp(e) {
        if (!this._hueDragging) return;
        this._hueDragging = false;
        e.target.releasePointerCapture(e.pointerId);
    }

    _updateHueFromPointer(e) {
        const rect = this._hueCanvas.getBoundingClientRect();
        const y = e.clientY - rect.top;
        this._hue = Math.max(0, Math.min(360, y / rect.height * 360));
        this._renderSVCanvas();
        this._updateHueCursor();
        this._applyPickerColor();
    }

    // ── Apply Color ──────────────────────────────────────────────────

    _rgbToHex(r, g, b) {
        return ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase();
    }

    _syncRGBDisplay(r, g, b) {
        if (this._6bit) {
            const rv = Math.round(r / 4), gv = Math.round(g / 4), bv = Math.round(b / 4);
            this._rSlider.value = rv; this._rNum.value = rv;
            this._gSlider.value = gv; this._gNum.value = gv;
            this._bSlider.value = bv; this._bNum.value = bv;
        } else {
            this._rSlider.value = r; this._rNum.value = r;
            this._gSlider.value = g; this._gNum.value = g;
            this._bSlider.value = b; this._bNum.value = b;
        }
        this._hexInput.value = this._rgbToHex(r, g, b);
    }

    _applyPickerColor() {
        if (!this._sliderDirty) {
            this._pushPaletteHistory();
            this._sliderDirty = true;
        }
        let [r, g, b] = this._hsvToRgb(this._hue, this._sat, this._val);
        [r, g, b] = this._snapIf6bit(r, g, b);
        const idx = this._rangeStart;
        this.doc.palette.setColor(idx, r, g, b);
        this._dlgSwatches[idx].style.backgroundColor = `rgb(${r},${g},${b})`;
        this._syncRGBDisplay(r, g, b);
        this._updateRangePreview();
        this.bus.emit('palette-changed');
    }

    _applyFromRGBInputs() {
        const max = this._6bit ? 63 : 255;
        const rv = Math.min(max, Math.max(0, parseInt(this._rNum.value) || 0));
        const gv = Math.min(max, Math.max(0, parseInt(this._gNum.value) || 0));
        const bv = Math.min(max, Math.max(0, parseInt(this._bNum.value) || 0));
        if (!this._sliderDirty) {
            this._pushPaletteHistory();
            this._sliderDirty = true;
        }
        const r = this._6bit ? rv * 4 : rv;
        const g = this._6bit ? gv * 4 : gv;
        const b = this._6bit ? bv * 4 : bv;
        const idx = this._rangeStart;
        this.doc.palette.setColor(idx, r, g, b);
        this._dlgSwatches[idx].style.backgroundColor = `rgb(${r},${g},${b})`;
        const [h, s, v] = this._rgbToHsv(r, g, b);
        if (s > 0) this._hue = h;
        this._sat = s;
        this._val = v;
        this._syncRGBDisplay(r, g, b);
        this._renderSVCanvas();
        this._updateSVCursor();
        this._updateHueCursor();
        this._updateRangePreview();
        this.bus.emit('palette-changed');
    }

    _applyFromHexInput() {
        const hex = this._hexInput.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
        if (hex.length !== 6) return;
        let r = parseInt(hex.slice(0, 2), 16);
        let g = parseInt(hex.slice(2, 4), 16);
        let b = parseInt(hex.slice(4, 6), 16);
        if (!this._sliderDirty) {
            this._pushPaletteHistory();
            this._sliderDirty = true;
        }
        [r, g, b] = this._snapIf6bit(r, g, b);
        const idx = this._rangeStart;
        this.doc.palette.setColor(idx, r, g, b);
        this._dlgSwatches[idx].style.backgroundColor = `rgb(${r},${g},${b})`;
        const [h, s, v] = this._rgbToHsv(r, g, b);
        if (s > 0) this._hue = h;
        this._sat = s;
        this._val = v;
        this._syncRGBDisplay(r, g, b);
        this._renderSVCanvas();
        this._updateSVCursor();
        this._updateHueCursor();
        this._updateRangePreview();
        this.bus.emit('palette-changed');
    }

    // ── Grid Pointer Events (Range Selection) ─────────────────────────

    _hitTestGrid(e) {
        const rect = this._grid.getBoundingClientRect();
        const col = Math.floor((e.clientX - rect.left) / (rect.width / 16));
        const row = Math.floor((e.clientY - rect.top) / (rect.height / 16));
        return Math.max(0, Math.min(255, row * 16 + Math.max(0, Math.min(15, col))));
    }

    _onGridPointerDown(e) {
        if (e.button !== 0) return;
        const idx = this._hitTestGrid(e);

        if (this._pendingOp) {
            this._executePendingOp(idx);
            return;
        }

        this._dragging = true;
        this._sliderDirty = false;
        this._rangeStart = idx;
        this._rangeEnd = idx;
        this._grid.setPointerCapture(e.pointerId);
        this._updateRangeHighlight();
        this._updateRangePreview();
        this._syncPicker();
    }

    _onGridPointerMove(e) {
        if (!this._dragging) return;
        const idx = this._hitTestGrid(e);
        this._rangeEnd = idx;
        this._updateRangeHighlight();
        this._updateRangePreview();
    }

    _onGridPointerUp(e) {
        if (!this._dragging) return;
        this._dragging = false;
        this._grid.releasePointerCapture(e.pointerId);
        // Pick mode: single click sets color immediately
        if (this.onPick && this._rangeStart === this._rangeEnd) {
            this.onPick(this._rangeStart);
        }
        if (this._rangeStart > this._rangeEnd) {
            const tmp = this._rangeStart;
            this._rangeStart = this._rangeEnd;
            this._rangeEnd = tmp;
        }
        this._updateRangeHighlight();
        this._updateRangePreview();
        this._syncPicker();
    }

    _sortedRange() {
        const lo = Math.min(this._rangeStart, this._rangeEnd);
        const hi = Math.max(this._rangeStart, this._rangeEnd);
        return [lo, hi];
    }

    _updateRangeHighlight() {
        const [lo, hi] = this._sortedRange();
        for (let i = 0; i < 256; i++) {
            const sw = this._dlgSwatches[i];
            sw.classList.toggle('in-range', i >= lo && i <= hi);
            sw.classList.toggle('range-end', i === lo || i === hi);
        }
        this._updateRangeButtons();
    }

    _updateRangeButtons() {
        const [lo, hi] = this._sortedRange();
        const hasRange = hi > lo;
        // These need 2+ colors
        for (const b of [this._flipBtn, this._xflipBtn, this._spreadBtn, this._mergeBtn]) {
            if (b) b.disabled = !hasRange;
        }
        if (this._sortSel) this._sortSel.disabled = !hasRange;
    }

    _updateRangePreview() {
        const [lo, hi] = this._sortedRange();
        this._rangePreview.innerHTML = '';
        for (let i = lo; i <= hi; i++) {
            const strip = document.createElement('div');
            strip.className = 'range-color';
            const [r, g, b] = this.doc.palette.getColor(i);
            strip.style.backgroundColor = `rgb(${r},${g},${b})`;
            this._rangePreview.appendChild(strip);
        }
    }

    _syncPicker() {
        const [lo, hi] = this._sortedRange();
        const [r, g, b] = this.doc.palette.getColor(this._rangeStart);
        if (lo === hi) {
            this._indexLabel.textContent = `Index: ${lo}`;
        } else {
            this._indexLabel.textContent = `Index: ${lo}\u2013${hi} (${hi - lo + 1} colors)`;
        }
        // Only update HSV from palette if color changed externally;
        // otherwise keep precise HSV to avoid 6-bit snap round-trip drift
        let [er, eg, eb] = this._hsvToRgb(this._hue, this._sat, this._val);
        [er, eg, eb] = this._snapIf6bit(er, eg, eb);
        if (r !== er || g !== eg || b !== eb) {
            const [h, s, v] = this._rgbToHsv(r, g, b);
            if (s > 0) this._hue = h;
            this._sat = s;
            this._val = v;
        }
        this._syncRGBDisplay(r, g, b);
        // Re-render canvases and cursors
        this._renderSVCanvas();
        this._renderHueStrip();
        this._updateSVCursor();
        this._updateHueCursor();
    }

    updateSwatches() {
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = this.doc.palette.getColor(i);
            this._dlgSwatches[i].style.backgroundColor = `rgb(${r},${g},${b})`;
        }
        this._updateRangePreview();
        this._syncPicker();
    }

    // ── 6-Bit Toggle ──────────────────────────────────────────────────

    _on6bitToggle(checkbox) {
        if (checkbox.checked) {
            if (!confirm('Convert current colors to 6-bit?')) {
                checkbox.checked = false;
                return;
            }
            this._pushPaletteHistory();
            for (let i = 0; i < 256; i++) {
                const [r, g, b] = this.doc.palette.getColor(i);
                this.doc.palette.setColor(i,
                    Math.round(r / 4) * 4,
                    Math.round(g / 4) * 4,
                    Math.round(b / 4) * 4
                );
            }
            this._6bit = true;
            this._updateInputRange(63);
            this.updateSwatches();
            this.bus.emit('palette-changed');
        } else {
            if (!confirm('Convert current colors to 8-bit?')) {
                checkbox.checked = true;
                return;
            }
            this._6bit = false;
            this._updateInputRange(255);
            this._syncPicker();
        }
    }

    _updateInputRange(max) {
        for (const s of [this._rSlider, this._gSlider, this._bSlider]) {
            s.max = max;
        }
        for (const n of [this._rNum, this._gNum, this._bNum]) {
            n.max = max;
        }
    }

    _snapIf6bit(r, g, b) {
        if (!this._6bit) return [r, g, b];
        return [
            Math.min(255, Math.round(r / 4) * 4),
            Math.min(255, Math.round(g / 4) * 4),
            Math.min(255, Math.round(b / 4) * 4)
        ];
    }

    // ── Simple Operations ─────────────────────────────────────────────

    _actionFlip() {
        const [lo, hi] = this._sortedRange();
        if (lo === hi) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;
        for (let i = 0; i < Math.floor((hi - lo + 1) / 2); i++) {
            const a = [...pal.getColor(lo + i)];
            const b = [...pal.getColor(hi - i)];
            pal.setColor(lo + i, ...b);
            pal.setColor(hi - i, ...a);
        }
        this.updateSwatches();
        this.bus.emit('palette-changed');
    }

    _actionXFlip() {
        const [lo, hi] = this._sortedRange();
        if (lo === hi) return;
        this._pushPaletteHistory();
        const mapping = new Array(256);
        for (let i = 0; i < 256; i++) mapping[i] = i;
        for (let i = 0; i <= hi - lo; i++) {
            mapping[lo + i] = hi - i;
        }
        this._actionFlip();
        this.doc.remapColorIndices(mapping);
        this.bus.emit('document-changed');
    }

    _actionInvert() {
        this._pushPaletteHistory();
        const [lo, hi] = this._sortedRange();
        const pal = this.doc.palette;
        for (let i = lo; i <= hi; i++) {
            const [r, g, b] = pal.getColor(i);
            pal.setColor(i, ...this._snapIf6bit(255 - r, 255 - g, 255 - b));
        }
        this.updateSwatches();
        this.bus.emit('palette-changed');
    }

    _actionGray() {
        this._pushPaletteHistory();
        const [lo, hi] = this._sortedRange();
        const pal = this.doc.palette;
        for (let i = lo; i <= hi; i++) {
            const [r, g, b] = pal.getColor(i);
            const avg = Math.round((r + g + b) / 3);
            const [sr, sg, sb] = this._snapIf6bit(avg, avg, avg);
            pal.setColor(i, sr, sg, sb);
        }
        this.updateSwatches();
        this.bus.emit('palette-changed');
    }

    _actionSpread() {
        const [lo, hi] = this._sortedRange();
        if (hi - lo < 2) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;
        const [r0, g0, b0] = pal.getColor(lo);
        const [r1, g1, b1] = pal.getColor(hi);
        const n = hi - lo;
        for (let i = 1; i < n; i++) {
            const t = i / n;
            const r = Math.round(r0 + (r1 - r0) * t);
            const g = Math.round(g0 + (g1 - g0) * t);
            const b = Math.round(b0 + (b1 - b0) * t);
            pal.setColor(lo + i, ...this._snapIf6bit(r, g, b));
        }
        this.updateSwatches();
        this.bus.emit('palette-changed');
    }

    _actionMerge() {
        const [lo, hi] = this._sortedRange();
        if (lo === hi) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;

        // Average all colors in the range
        let rSum = 0, gSum = 0, bSum = 0;
        const count = hi - lo + 1;
        for (let i = lo; i <= hi; i++) {
            const [r, g, b] = pal.getColor(i);
            rSum += r; gSum += g; bSum += b;
        }
        const [ar, ag, ab] = this._snapIf6bit(
            Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)
        );

        // Remap all pixels using indices [lo+1..hi] to lo
        const mapping = new Array(256);
        for (let i = 0; i < 256; i++) mapping[i] = i;
        for (let i = lo + 1; i <= hi; i++) mapping[i] = lo;
        this.doc.remapColorIndices(mapping);

        // Set merged color and zero out freed slots
        pal.setColor(lo, ar, ag, ab);
        for (let i = lo + 1; i <= hi; i++) {
            pal.setColor(i, 0, 0, 0);
        }

        this.updateSwatches();
        this.bus.emit('palette-changed');
        this.bus.emit('document-changed');
    }

    // ── Two-Step Operations ───────────────────────────────────────────

    _startPendingOp(type) {
        if (this._pendingOp && this._pendingOp.type === type) {
            this._cancelPendingOp();
            return;
        }
        this._cancelPendingOp();
        const [lo, hi] = this._sortedRange();
        const rangeLen = hi - lo + 1;
        this._pendingOp = { type, srcStart: lo, srcEnd: hi, rangeLen };
        this._grid.classList.add('pending-op');

        const labels = { swap: 'Swap', xswap: 'X-Swap' };
        this._statusEl.textContent = `Click destination for ${labels[type]} (${rangeLen} colors)`;
        this._statusEl.style.display = '';

        this._swapBtn.classList.toggle('active', type === 'swap');
        this._xswapBtn.classList.toggle('active', type === 'xswap');
    }

    _cancelPendingOp() {
        this._pendingOp = null;
        this._grid.classList.remove('pending-op');
        this._statusEl.style.display = 'none';
        this._swapBtn.classList.remove('active');
        this._xswapBtn.classList.remove('active');
    }

    _executePendingOp(destStart) {
        const op = this._pendingOp;
        if (!op) return;

        const destEnd = destStart + op.rangeLen - 1;
        if (destEnd > 255) {
            this._cancelPendingOp();
            return;
        }

        const srcLo = op.srcStart, srcHi = op.srcEnd;
        if (!(destEnd < srcLo || destStart > srcHi)) {
            return;
        }

        this._pushPaletteHistory();
        const pal = this.doc.palette;
        const len = op.rangeLen;

        for (let i = 0; i < len; i++) {
            const a = [...pal.getColor(op.srcStart + i)];
            const b = [...pal.getColor(destStart + i)];
            pal.setColor(op.srcStart + i, ...b);
            pal.setColor(destStart + i, ...a);
        }
        if (op.type === 'xswap') {
            const mapping = new Array(256);
            for (let i = 0; i < 256; i++) mapping[i] = i;
            for (let i = 0; i < len; i++) {
                mapping[op.srcStart + i] = destStart + i;
                mapping[destStart + i] = op.srcStart + i;
            }
            this.doc.remapColorIndices(mapping);
            this.bus.emit('document-changed');
        }

        this._cancelPendingOp();
        this._rangeStart = destStart;
        this._rangeEnd = destEnd;
        this.updateSwatches();
        this._updateRangeHighlight();
        this.bus.emit('palette-changed');
    }

    // ── Copy / Paste Range ─────────────────────────────────────────────

    _actionCopyRange() {
        const [lo, hi] = this._sortedRange();
        const colors = [];
        const pal = this.doc.palette;
        for (let i = lo; i <= hi; i++) {
            colors.push([...pal.getColor(i)]);
        }
        PaletteEditDialog._rangeClipboard = colors;
        if (this._pasteRangeBtn) this._pasteRangeBtn.disabled = false;
    }

    _actionPasteRange() {
        const clip = PaletteEditDialog._rangeClipboard;
        if (!clip || clip.length === 0) return;
        const [lo] = this._sortedRange();
        if (lo + clip.length > 256) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;
        for (let i = 0; i < clip.length; i++) {
            pal.setColor(lo + i, ...clip[i]);
        }
        this._rangeEnd = lo + clip.length - 1;
        this._updateRangeHighlight();
        this.updateSwatches();
        this._syncPicker();
        this.bus.emit('palette-changed');
    }

    // ── Used / Zap Unused ─────────────────────────────────────────────

    _actionUsed() {
        this._usedHighlight = !this._usedHighlight;
        if (this._usedHighlight) {
            const used = this.doc.getUsedColorIndices();
            for (let i = 0; i < 256; i++) {
                this._dlgSwatches[i].classList.toggle('color-used', used.has(i));
            }
        } else {
            for (let i = 0; i < 256; i++) {
                this._dlgSwatches[i].classList.remove('color-used');
            }
        }
    }

    _actionZapUnused() {
        const used = this.doc.getUsedColorIndices();
        const usedCount = used.size;
        if (!confirm(`Reduce the colors to ${usedCount}?`)) return;
        this._pushPaletteHistory();

        const usedArr = [...used].sort((a, b) => a - b);
        const mapping = new Array(256).fill(0);
        const newColors = [];

        for (let i = 0; i < usedArr.length; i++) {
            mapping[usedArr[i]] = i;
            newColors.push([...this.doc.palette.getColor(usedArr[i])]);
        }

        while (newColors.length < 256) {
            newColors.push([0, 0, 0]);
        }

        for (let i = 0; i < 256; i++) {
            this.doc.palette.setColor(i, ...newColors[i]);
        }
        this.doc.remapColorIndices(mapping);
        this._rangeStart = 0;
        this._rangeEnd = Math.max(0, usedCount - 1);
        this.updateSwatches();
        this._updateRangeHighlight();
        this.bus.emit('palette-changed');
        this.bus.emit('document-changed');
    }

    // ── Sort ──────────────────────────────────────────────────────────

    _actionSort(mode) {
        const [lo, hi] = this._sortedRange();
        if (lo === hi) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;

        const entries = [];
        for (let i = lo; i <= hi; i++) {
            entries.push({ index: i, color: [...pal.getColor(i)] });
        }

        if (mode === 'hue') {
            entries.sort((a, b) => {
                const ha = this._rgbToHsl(a.color);
                const hb = this._rgbToHsl(b.color);
                return ha[0] - hb[0] || ha[2] - hb[2];
            });
        } else if (mode === 'light') {
            entries.sort((a, b) => {
                return (a.color[0] + a.color[1] + a.color[2]) -
                       (b.color[0] + b.color[1] + b.color[2]);
            });
        } else if (mode === 'hist') {
            const hist = this.doc.getColorHistogram();
            entries.sort((a, b) => hist[b.index] - hist[a.index]);
        }

        for (let i = 0; i < entries.length; i++) {
            pal.setColor(lo + i, ...entries[i].color);
        }

        this.updateSwatches();
        this.bus.emit('palette-changed');
    }

    _rgbToHsl([r, g, b]) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const l = (max + min) / 2;
        if (max === min) return [0, 0, l];
        const d = max - min;
        const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        let h;
        if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / d + 2) / 6;
        else h = ((r - g) / d + 4) / 6;
        return [h, s, l];
    }

    // ── Reduce ────────────────────────────────────────────────────────

    _actionReduce(n) {
        if (n < 1 || n > 256) return;
        this._pushPaletteHistory();
        const pal = this.doc.palette;
        const hist = this.doc.getColorHistogram();
        const used = this.doc.getUsedColorIndices();

        // Collect all distinct non-black palette entries (or used ones)
        const colorSet = new Set();
        const colors = [];
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = pal.getColor(i);
            const key = (r << 16) | (g << 8) | b;
            if (!colorSet.has(key) || used.has(i)) {
                colors.push({ index: i, color: [r, g, b], count: hist[i] || 0 });
                colorSet.add(key);
            }
        }

        if (colors.length <= n) return;

        const representatives = this._medianCut(colors, n);

        const newColors = representatives.map(rep => rep.color);

        // Map every palette index to nearest representative
        const mapping = new Array(256);
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = pal.getColor(i);
            let bestDist = Infinity, bestI = 0;
            for (let j = 0; j < newColors.length; j++) {
                const [cr, cg, cb] = newColors[j];
                const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
                if (dist < bestDist) { bestDist = dist; bestI = j; }
            }
            mapping[i] = bestI;
        }

        // Write new palette: N colors at front, rest black
        for (let i = 0; i < 256; i++) {
            if (i < newColors.length) {
                pal.setColor(i, ...this._snapIf6bit(...newColors[i]));
            } else {
                pal.setColor(i, 0, 0, 0);
            }
        }

        this.doc.remapColorIndices(mapping);
        this._rangeStart = 0;
        this._rangeEnd = Math.max(0, newColors.length - 1);
        this.updateSwatches();
        this._updateRangeHighlight();
        this.bus.emit('palette-changed');
        this.bus.emit('document-changed');
    }

    _medianCut(colors, n) {
        if (colors.length <= n) return colors;

        let buckets = [colors];

        while (buckets.length < n) {
            let bestBucket = 0, bestRange = -1, bestChannel = 0;
            for (let bi = 0; bi < buckets.length; bi++) {
                const bucket = buckets[bi];
                if (bucket.length < 2) continue;
                for (let ch = 0; ch < 3; ch++) {
                    let min = 255, max = 0;
                    for (const c of bucket) {
                        if (c.color[ch] < min) min = c.color[ch];
                        if (c.color[ch] > max) max = c.color[ch];
                    }
                    if (max - min > bestRange) {
                        bestRange = max - min;
                        bestBucket = bi;
                        bestChannel = ch;
                    }
                }
            }

            if (bestRange <= 0) break;

            const bucket = buckets[bestBucket];
            bucket.sort((a, b) => a.color[bestChannel] - b.color[bestChannel]);
            const mid = Math.floor(bucket.length / 2);
            buckets.splice(bestBucket, 1, bucket.slice(0, mid), bucket.slice(mid));
        }

        return buckets.map(bucket => {
            let totalW = 0, rSum = 0, gSum = 0, bSum = 0;
            for (const c of bucket) {
                const w = c.count || 1;
                totalW += w;
                rSum += c.color[0] * w;
                gSum += c.color[1] * w;
                bSum += c.color[2] * w;
            }
            return {
                color: [
                    Math.round(rSum / totalW),
                    Math.round(gSum / totalW),
                    Math.round(bSum / totalW)
                ]
            };
        });
    }

    // ── Palette History ────────────────────────────────────────────────

    _pushPaletteHistory() {
        this._paletteHistory.push(this.doc.palette.export());
        if (this._undoBtn) this._undoBtn.disabled = false;
    }

    _undoPalette() {
        if (this._paletteHistory.length === 0) return;
        const prev = this._paletteHistory.pop();
        this.doc.palette.import(prev);
        this.updateSwatches();
        this.bus.emit('palette-changed');
        if (this._undoBtn) this._undoBtn.disabled = this._paletteHistory.length === 0;
    }

    // ── Load / Save Palette ──────────────────────────────────────────

    _loadPalette() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pal,.bmp,.pcx';
        input.addEventListener('change', () => {
            if (!input.files[0]) return;
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                const bytes = new Uint8Array(reader.result);
                let colors = null;
                const ext = file.name.split('.').pop().toLowerCase();
                if (ext === 'pal') {
                    colors = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_0__.importPAL)(bytes);
                } else if (ext === 'bmp') {
                    try {
                        const doc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_0__.importBMP)(reader.result);
                        colors = doc.palette.export();
                    } catch (e) { /* ignore */ }
                } else if (ext === 'pcx') {
                    try {
                        const doc = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_0__.importPCX)(reader.result);
                        colors = doc.palette.export();
                    } catch (e) { /* ignore */ }
                }
                if (colors) {
                    this._pushPaletteHistory();
                    this.doc.palette.import(colors);
                    this.updateSwatches();
                    this.bus.emit('palette-changed');
                }
            };
            reader.readAsArrayBuffer(file);
        });
        input.click();
    }

    _savePalette() {
        const blob = (0,_util_io_js__WEBPACK_IMPORTED_MODULE_0__.exportPAL)(this.doc.palette, this._6bit);
        (0,_util_io_js__WEBPACK_IMPORTED_MODULE_0__.downloadBlob)(blob, 'palette.pal');
    }

    // ── OK / Cancel ───────────────────────────────────────────────────

    _ok() {
        // Push palette change to document undo history
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        const afterPalette = this.doc.palette.export();
        const afterLayers = this.doc.layers.map(l => l.clone(true));
        const afterFrames = this.doc.animationEnabled ? this.doc.frames.map(f => ({
            ...f,
            layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
        })) : null;
        // Check if anything actually changed
        let changed = false;
        for (let i = 0; i < 256; i++) {
            const [r1, g1, b1] = this._originalPalette[i];
            const [r2, g2, b2] = afterPalette[i];
            if (r1 !== r2 || g1 !== g2 || b1 !== b2) { changed = true; break; }
        }
        if (!changed && this._originalLayers.length === this.doc.layers.length) {
            for (let i = 0; i < this.doc.layers.length && !changed; i++) {
                const a = this._originalLayers[i].data;
                const b = this.doc.layers[i].data;
                if (a.length !== b.length) { changed = true; break; }
                for (let j = 0; j < a.length; j++) {
                    if (a[j] !== b[j]) { changed = true; break; }
                }
            }
        }
        if (changed && this.undoManager) {
            this.undoManager.undoStack.push({
                type: 'palette',
                beforePalette: this._originalPalette,
                afterPalette: afterPalette,
                beforeLayers: this._originalLayers,
                afterLayers: afterLayers,
                beforeFrames: this._originalFrames,
                afterFrames: afterFrames,
            });
            this.undoManager.redoStack = [];
        }
        this._destroy();
    }

    _cancel() {
        this.doc.palette.import(this._originalPalette);
        this.doc.layers = this._originalLayers;
        if (this._originalFrames) {
            this.doc.frames = this._originalFrames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({ ...ld, data: ld.data.slice() })) : null,
            }));
            this.doc.loadFrame(this.doc.activeFrameIndex);
        }
        this.bus.emit('palette-changed');
        this.bus.emit('document-changed');
        this._destroy();
    }

    _destroy() {
        document.removeEventListener('keydown', this._onKey);
        this._overlay.remove();
        this.onClose?.();
    }
}

PaletteEditDialog._rangeClipboard = null;


/***/ },

/***/ "./js/ui/PalettePanel.js"
/*!*******************************!*\
  !*** ./js/ui/PalettePanel.js ***!
  \*******************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PalettePanel: () => (/* binding */ PalettePanel)
/* harmony export */ });
/* harmony import */ var _PaletteEditDialog_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./PaletteEditDialog.js */ "./js/ui/PaletteEditDialog.js");


class PalettePanel {
    constructor(doc, bus, undoManager) {
        this.doc = doc;
        this.bus = bus;
        this.undoManager = undoManager;

        this.grid = document.getElementById('palette-grid');
        this._swatches = [];
        this._dialog = null;

        this._buildGrid();

        document.getElementById('palette-edit-btn').addEventListener('click', () => this._openDialog());

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

            swatch.addEventListener('click', () => {
                this.doc.fgColorIndex = i;
                this.bus.emit('fg-color-changed');
            });

            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.doc.bgColorIndex = i;
                this.bus.emit('bg-color-changed');
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
        // Also update dialog swatches if open
        if (this._dialog) {
            this._dialog.updateSwatches();
        }
    }

    _openDialog(onPick, initialIndex) {
        if (this._dialog) {
            this._dialog._destroy();
            this._dialog = null;
        }

        const dlg = new _PaletteEditDialog_js__WEBPACK_IMPORTED_MODULE_0__.PaletteEditDialog(this.doc, this.bus, this.undoManager);
        dlg.onClose = () => { this._dialog = null; };
        if (onPick) {
            dlg.onPick = onPick;
            if (initialIndex !== undefined) dlg.setInitialIndex(initialIndex);
        }
        dlg.open();
        this._dialog = dlg;
    }
}


/***/ },

/***/ "./js/ui/Rulers.js"
/*!*************************!*\
  !*** ./js/ui/Rulers.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Rulers: () => (/* binding */ Rulers)
/* harmony export */ });
class Rulers {
    constructor() {
        this.hCanvas = document.getElementById('ruler-h');
        this.vCanvas = document.getElementById('ruler-v');
        this.hCtx = this.hCanvas.getContext('2d');
        this.vCtx = this.vCanvas.getContext('2d');
        this.canvasArea = document.getElementById('canvas-area');
        this.SIZE = 20;
    }

    setVisible(visible) {
        this.canvasArea.style.setProperty('--ruler-size', visible ? this.SIZE + 'px' : '0px');
        this.canvasArea.classList.toggle('rulers-visible', visible);
    }

    resize(w, h) {
        this.hCanvas.width = w;
        this.hCanvas.height = this.SIZE;
        this.vCanvas.width = this.SIZE;
        this.vCanvas.height = h;
    }

    draw(docWidth, docHeight, zoom, panX, panY) {
        this._drawH(docWidth, zoom, panX);
        this._drawV(docHeight, zoom, panY);
    }

    _tickStep(zoom) {
        if (zoom >= 16) return 1;
        if (zoom >= 8) return 2;
        if (zoom >= 4) return 4;
        if (zoom >= 2) return 8;
        return 16;
    }

    _drawH(docWidth, zoom, panX) {
        const ctx = this.hCtx;
        const w = this.hCanvas.width;
        const h = this.SIZE;
        ctx.clearRect(0, 0, w, h);

        const step = this._tickStep(zoom);
        const majorEvery = step * 8;
        const first = Math.floor(-panX / zoom / step) * step;
        const last = Math.ceil((w - panX) / zoom / step) * step;

        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#888';
        ctx.font = '9px sans-serif';
        ctx.textBaseline = 'top';
        ctx.lineWidth = 1;

        for (let d = first; d <= last; d += step) {
            if (d < 0 || d > docWidth) continue;
            const sx = Math.round(panX + d * zoom) + 0.5;
            if (sx < 0 || sx > w) continue;
            const isMajor = d % majorEvery === 0;
            ctx.beginPath();
            ctx.moveTo(sx, isMajor ? 0 : h * 0.6);
            ctx.lineTo(sx, h);
            ctx.stroke();
            if (isMajor) {
                ctx.fillText(String(d), sx + 2, 1);
            }
        }
    }

    _drawV(docHeight, zoom, panY) {
        const ctx = this.vCtx;
        const w = this.SIZE;
        const h = this.vCanvas.height;
        ctx.clearRect(0, 0, w, h);

        const step = this._tickStep(zoom);
        const majorEvery = step * 8;
        const first = Math.floor(-panY / zoom / step) * step;
        const last = Math.ceil((h - panY) / zoom / step) * step;

        ctx.strokeStyle = '#666';
        ctx.fillStyle = '#888';
        ctx.font = '9px sans-serif';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 1;

        for (let d = first; d <= last; d += step) {
            if (d < 0 || d > docHeight) continue;
            const sy = Math.round(panY + d * zoom) + 0.5;
            if (sy < 0 || sy > h) continue;
            const isMajor = d % majorEvery === 0;
            ctx.beginPath();
            ctx.moveTo(isMajor ? 0 : w * 0.6, sy);
            ctx.lineTo(w, sy);
            ctx.stroke();
            if (isMajor) {
                ctx.save();
                ctx.translate(2, sy - 3);
                ctx.rotate(-Math.PI / 2);
                ctx.textBaseline = 'top';
                ctx.fillText(String(d), 0, 0);
                ctx.restore();
            }
        }
    }
}


/***/ },

/***/ "./js/ui/TabBar.js"
/*!*************************!*\
  !*** ./js/ui/TabBar.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TabBar: () => (/* binding */ TabBar)
/* harmony export */ });
class TabBar {
    constructor(bus) {
        this.bus = bus;
        this.container = document.getElementById('tab-bar');
        this._lastClickTime = 0;
        this._lastClickId = null;
    }

    render(tabs, activeTabId) {
        this.container.innerHTML = '';
        for (const tab of tabs) {
            const el = document.createElement('div');
            el.className = 'tab' + (tab.id === activeTabId ? ' active' : '');

            const name = document.createElement('span');
            name.className = 'tab-name';
            name.textContent = tab.name;
            el.appendChild(name);

            const close = document.createElement('span');
            close.className = 'tab-close';
            close.textContent = '\u00D7';
            close.addEventListener('click', (e) => {
                e.stopPropagation();
                this.bus.emit('tab-close', tab.id);
            });
            el.appendChild(close);

            el.addEventListener('click', () => {
                const now = Date.now();
                if (now - this._lastClickTime < 400 && this._lastClickId === tab.id) {
                    this._lastClickTime = 0;
                    this._startRename(name, tab);
                    return;
                }
                this._lastClickTime = now;
                this._lastClickId = tab.id;
                this.bus.emit('tab-switch', tab.id);
            });

            this.container.appendChild(el);
        }
    }

    _startRename(nameEl, tab) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'tab-name-input';
        input.value = tab.name;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        const commit = () => {
            const trimmed = input.value.trim();
            if (trimmed && trimmed !== tab.name) {
                this.bus.emit('tab-rename', { id: tab.id, name: trimmed });
            } else {
                input.replaceWith(nameEl);
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); commit(); }
            if (e.key === 'Escape') { e.preventDefault(); input.replaceWith(nameEl); }
            e.stopPropagation();
        });
        input.addEventListener('blur', commit);
    }
}


/***/ },

/***/ "./js/ui/Toolbar.js"
/*!**************************!*\
  !*** ./js/ui/Toolbar.js ***!
  \**************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Toolbar: () => (/* binding */ Toolbar)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


class Toolbar {
    constructor(tools, bus, doc) {
        this.tools = tools;
        this.bus = bus;
        this.doc = doc;
        this.container = document.getElementById('toolbar-area');
        this.activeTool = null;
        this._buttons = []; // { btn, toolName, groupEl? }
        this._openFlyout = null;
        this._flyoutBrowsing = false; // true while in flyout browsing mode
        this._disabledTools = new Set();
        this._locked = false;

        this._render();

        this.bus.on('switch-tool', (name) => {
            this.setActiveTool(name);
        });

        this.bus.on('layer-changed', () => this.updateEnabledState());
        this.bus.on('document-changed', () => this.updateEnabledState());
        this.bus.on('active-layer-changed', () => this.updateEnabledState());

        // Close flyout on click outside (but not on group buttons — they handle toggle)
        document.addEventListener('pointerdown', (e) => {
            if ((this._openFlyout || this._flyoutBrowsing) && !e.target.closest('.tool-group') && !(this._openFlyout && this._openFlyout.contains(e.target))) {
                this._closeFlyout();
            }
        });
    }

    _render() {
        const colorSelector = document.getElementById('color-selector');

        // Items: either a tool name string, or a flyout group { tools: [...], label }
        const layout = [
            'Move', 'Brush', 'Eraser', 'Fill', 'Color Picker',
            'sep',
            { tools: ['Rectangle', 'Filled Rect', 'Ellipse', 'Filled Ellipse'], label: 'Shapes' },
            'sep',
            { tools: ['Rect Select', 'Ellipse Select'], label: 'Select' },
            'Free Transform',
            'sep',
            'Mirror',
            'Text',
        ];

        for (const item of layout) {
            if (item === 'sep') {
                const sep = document.createElement('div');
                sep.className = 'toolbar-sep';
                this.container.insertBefore(sep, colorSelector);
                continue;
            }

            if (typeof item === 'string') {
                // Single tool button
                const tool = this.tools.find(t => t.name === item);
                if (!tool) continue;
                const btn = this._createButton(tool);
                btn.addEventListener('click', () => {
                    this._closeFlyout();
                    this.setActiveTool(tool.name);
                });
                btn.addEventListener('mouseenter', () => {
                    if (this._openFlyout) this._hideFlyout();
                });
                this.container.insertBefore(btn, colorSelector);
                this._buttons.push({ btn, toolName: tool.name });
            } else {
                // Flyout group
                this._createFlyoutGroup(item, colorSelector);
            }
        }
    }

    _createButton(tool) {
        const btn = document.createElement('button');
        btn.className = 'tool-btn';
        btn.title = tool.name + (tool.shortcut ? ` (${tool.shortcut})` : '');

        const img = document.createElement('img');
        img.src = (0,_constants_js__WEBPACK_IMPORTED_MODULE_0__.withVersion)(tool.icon);
        img.className = 'tool-icon';
        img.draggable = false;
        btn.appendChild(img);

        if (tool.shortcut) {
            const hint = document.createElement('span');
            hint.className = 'shortcut-hint';
            hint.textContent = this._formatShortcutHint(tool.shortcut);
            btn.appendChild(hint);
        }

        return btn;
    }

    _formatShortcutHint(shortcut) {
        if (shortcut.length === 1) return shortcut;
        if (shortcut.startsWith('Shift+')) return 's' + shortcut.slice(6);
        if (shortcut.startsWith('Ctrl+')) return 'c' + shortcut.slice(5);
        if (shortcut.startsWith('Alt+')) return 'a' + shortcut.slice(4);
        return shortcut;
    }

    _createFlyoutGroup(group, colorSelector) {
        const wrapper = document.createElement('div');
        wrapper.className = 'tool-group';

        // The main button shows the first tool (or the currently selected one from the group)
        const firstTool = this.tools.find(t => t.name === group.tools[0]);
        if (!firstTool) return;

        const mainBtn = this._createButton(firstTool);
        // Add triangle indicator
        const tri = document.createElement('span');
        tri.className = 'group-indicator';
        tri.textContent = '\u25E2'; // small triangle
        mainBtn.appendChild(tri);

        wrapper.appendChild(mainBtn);

        // Flyout panel
        const flyout = document.createElement('div');
        flyout.className = 'tool-flyout';

        for (const toolName of group.tools) {
            const tool = this.tools.find(t => t.name === toolName);
            if (!tool) continue;

            const flyBtn = this._createButton(tool);
            // Add label text for flyout items
            const label = document.createElement('span');
            label.className = 'flyout-label';
            label.textContent = tool.name;
            flyBtn.classList.add('flyout-btn');
            flyBtn.appendChild(label);

            flyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._closeFlyout();
                // Update the main button to show this tool's icon
                this._updateGroupButton(mainBtn, tool);
                this.setActiveTool(tool.name);
            });

            flyout.appendChild(flyBtn);
            this._buttons.push({ btn: flyBtn, toolName: tool.name, mainBtn });
        }

        wrapper.appendChild(flyout);

        mainBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (flyout === this._openFlyout) {
                this._closeFlyout();
            } else {
                this._hideFlyout();
                flyout.classList.add('open');
                this._openFlyout = flyout;
                this._flyoutBrowsing = true;
            }
            // Always activate the tool shown on the group button
            const entry = this._buttons.find(b => b.btn === mainBtn && b.isGroupMain);
            if (entry) this.setActiveTool(entry.toolName);
        });

        // Hover to switch flyout when in browsing mode
        wrapper.addEventListener('mouseenter', () => {
            if (this._flyoutBrowsing) {
                this._hideFlyout();
                flyout.classList.add('open');
                this._openFlyout = flyout;
            }
        });

        this.container.insertBefore(wrapper, colorSelector);
        // Also track the main button for active highlighting
        this._buttons.push({ btn: mainBtn, toolName: firstTool.name, isGroupMain: true, groupTools: group.tools });
    }

    _updateGroupButton(mainBtn, tool) {
        // Preserve the group indicator and shortcut hint, replace icon
        mainBtn.innerHTML = '';
        const img = document.createElement('img');
        img.src = (0,_constants_js__WEBPACK_IMPORTED_MODULE_0__.withVersion)(tool.icon);
        img.className = 'tool-icon';
        img.draggable = false;
        mainBtn.appendChild(img);
        mainBtn.title = tool.name + (tool.shortcut ? ` (${tool.shortcut})` : '');
        if (tool.shortcut) {
            const hint = document.createElement('span');
            hint.className = 'shortcut-hint';
            hint.textContent = this._formatShortcutHint(tool.shortcut);
            mainBtn.appendChild(hint);
        }
        const tri = document.createElement('span');
        tri.className = 'group-indicator';
        tri.textContent = '\u25E2';
        mainBtn.appendChild(tri);

        // Update the main button's tracked tool name
        for (const entry of this._buttons) {
            if (entry.btn === mainBtn && entry.isGroupMain) {
                entry.toolName = tool.name;
                break;
            }
        }
    }

    _closeFlyout() {
        if (this._openFlyout) {
            this._openFlyout.classList.remove('open');
            this._openFlyout = null;
        }
        this._flyoutBrowsing = false;
    }

    _hideFlyout() {
        // Hide visually but stay in browsing mode
        if (this._openFlyout) {
            this._openFlyout.classList.remove('open');
            this._openFlyout = null;
        }
    }

    updateEnabledState() {
        const layer = this.doc.getActiveLayer();
        const isText = layer && layer.type === 'text';
        const multiSelected = this.doc.selectedLayerIndices.size >= 2;

        // Text layer: only Move and Text allowed
        // Multi-selected: only Move allowed
        const alwaysEnabled = ['Move'];
        const textEnabled = ['Move', 'Text'];

        if (this._locked) return;
        this._disabledTools.clear();
        for (const tool of this.tools) {
            let disabled = false;
            if (multiSelected) {
                disabled = !alwaysEnabled.includes(tool.name);
            } else if (isText) {
                disabled = !textEnabled.includes(tool.name);
            }
            if (disabled) this._disabledTools.add(tool.name);
        }

        for (const entry of this._buttons) {
            if (entry.isGroupMain) {
                const anyEnabled = entry.groupTools.some(n => !this._disabledTools.has(n));
                entry.btn.disabled = !anyEnabled;
            } else {
                entry.btn.disabled = this._disabledTools.has(entry.toolName);
            }
        }

        // If current tool got disabled, switch to Move
        if (this.activeTool && this._disabledTools.has(this.activeTool.name)) {
            this.setActiveTool('Move');
        }
    }

    setLocked(locked) {
        this._locked = locked;
        for (const entry of this._buttons) {
            entry.btn.disabled = locked || this._disabledTools.has(entry.toolName);
        }
    }

    setActiveTool(name) {
        if (this._locked) return;
        for (const entry of this._buttons) {
            if (entry.isGroupMain) {
                const isActive = entry.groupTools.includes(name);
                entry.btn.classList.toggle('active', isActive);
                // Update group button icon to show the selected tool
                if (isActive && entry.toolName !== name) {
                    const tool = this.tools.find(t => t.name === name);
                    if (tool) this._updateGroupButton(entry.btn, tool);
                }
            } else {
                entry.btn.classList.toggle('active', entry.toolName === name);
            }
        }
        const tool = this.tools.find(t => t.name === name);
        if (tool) {
            if (this.activeTool && this.activeTool.deactivate) {
                this.activeTool.deactivate();
            }
            this.activeTool = tool;
            this.bus.emit('tool-changed', tool);
        }
    }
}


/***/ },

/***/ "./js/ui/dialogHelpers.js"
/*!********************************!*\
  !*** ./js/ui/dialogHelpers.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   INPUT_STYLE: () => (/* binding */ INPUT_STYLE),
/* harmony export */   ROW_STYLE: () => (/* binding */ ROW_STYLE),
/* harmony export */   createDitherRow: () => (/* binding */ createDitherRow)
/* harmony export */ });
/**
 * Shared styles and DOM helpers for modal dialogs.
 */

const INPUT_STYLE = 'width:100%;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);font-size:13px;box-sizing:border-box;';

const ROW_STYLE = 'display:flex;align-items:center;gap:8px;';

const SELECT_STYLE = 'background:var(--bg-input);border:1px solid var(--border);border-radius:2px;color:var(--text);padding:2px 4px;font-size:12px;';

const DITHER_OPTIONS = [
    ['none', 'None'],
    ['floyd-steinberg', 'Floyd-Steinberg'],
    ['ordered', 'Ordered (Bayer)'],
];

/**
 * Creates a dither mode <select> with label, wrapped in a row div.
 * Returns { row, select } where select.value gives the chosen mode.
 */
function createDitherRow() {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;';
    const label = document.createElement('label');
    label.textContent = 'Dithering:';
    const select = document.createElement('select');
    select.style.cssText = SELECT_STYLE;
    for (const [val, text] of DITHER_OPTIONS) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = text;
        select.appendChild(opt);
    }
    row.appendChild(label);
    row.appendChild(select);
    return { row, select };
}


/***/ },

/***/ "./js/util/gif.js"
/*!************************!*\
  !*** ./js/util/gif.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportGIF: () => (/* binding */ exportGIF)
/* harmony export */ });
/* harmony import */ var _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Renderer.js */ "./js/render/Renderer.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");



/**
 * GIF89a animation encoder for indexed-color documents.
 * Supports 256-color palette, per-frame delay, transparency, and infinite looping.
 */
function exportGIF(doc, options = {}) {
    const scale = options.scale || 1;
    const loopCount = options.loopCount ?? 0; // 0 = infinite
    const outWidth = doc.width * scale;
    const outHeight = doc.height * scale;
    const { palette } = doc;
    const frames = doc.frames;
    const frameIndices = options.frameIndices || frames.map((_, i) => i);
    const numFrames = frameIndices.length;

    // Find a palette index to use as transparent color.
    // Scan all frames' layer data to find an unused index; fall back to 255.
    const usedIndices = new Uint8Array(256);
    for (const fi of frameIndices) {
        const frame = frames[fi];
        if (!frame || !frame.layerData) continue;
        for (const ld of frame.layerData) {
            for (let i = 0; i < ld.data.length; i++) {
                const v = ld.data[i];
                if (v !== _constants_js__WEBPACK_IMPORTED_MODULE_1__.TRANSPARENT && v < 256) usedIndices[v] = 1;
            }
        }
    }
    let transparentIndex = 255;
    for (let i = 255; i >= 0; i--) {
        if (!usedIndices[i]) { transparentIndex = i; break; }
    }

    // Build reverse lookup: "r,g,b" -> palette index
    const colorToIndex = new Map();
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        const key = (r << 16) | (g << 8) | b;
        if (!colorToIndex.has(key)) {
            colorToIndex.set(key, i);
        }
    }

    // Collect all output bytes
    const chunks = [];
    const write = (data) => chunks.push(data instanceof Uint8Array ? data : new Uint8Array(data));
    const writeStr = (s) => write(s.split('').map(c => c.charCodeAt(0)));

    // --- Header ---
    writeStr('GIF89a');

    // --- Logical Screen Descriptor ---
    write([
        outWidth & 0xFF, (outWidth >> 8) & 0xFF,
        outHeight & 0xFF, (outHeight >> 8) & 0xFF,
        0xF7, // GCT flag=1, color res=7 (8 bits), sort=0, GCT size=7 (256 colors)
        0,    // background color index
        0,    // pixel aspect ratio
    ]);

    // --- Global Color Table (256 × RGB) ---
    const gct = new Uint8Array(768);
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        gct[i * 3] = r;
        gct[i * 3 + 1] = g;
        gct[i * 3 + 2] = b;
    }
    write(gct);

    // --- Netscape Application Extension (infinite loop) ---
    write([
        0x21, 0xFF, // extension introducer, app extension label
        0x0B,       // block size
    ]);
    writeStr('NETSCAPE2.0');
    write([
        0x03, // sub-block size
        0x01, // sub-block ID
        loopCount & 0xFF, (loopCount >> 8) & 0xFF, // loop count (0 = infinite)
        0x00, // block terminator
    ]);

    // Save current state
    const savedActiveIndex = doc.activeFrameIndex;
    const savedLayers = doc.layers.map(l => ({
        data: l.data, opacity: l.opacity, textData: l.textData,
        offsetX: l.offsetX, offsetY: l.offsetY,
        width: l.width, height: l.height,
    }));

    // --- Frames ---
    const renderer = new _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__.Renderer(doc);
    for (let fi = 0; fi < numFrames; fi++) {
        const frameIdx = frameIndices[fi];
        // Load frame data into layers
        doc._restoreLayersFromFrame(frames[frameIdx]);

        // Composite to RGBA
        const imageData = renderer.composite();
        const rgba = imageData.data;

        // Map RGBA pixels back to palette indices, with optional scaling
        const indices = new Uint8Array(outWidth * outHeight);
        for (let oy = 0; oy < outHeight; oy++) {
            const sy = Math.floor(oy / scale);
            for (let ox = 0; ox < outWidth; ox++) {
                const sx = Math.floor(ox / scale);
                const srcOff = (sy * doc.width + sx) * 4;
                const a = rgba[srcOff + 3];
                const dstIdx = oy * outWidth + ox;
                if (a < 128) {
                    indices[dstIdx] = transparentIndex;
                } else {
                    const key = (rgba[srcOff] << 16) | (rgba[srcOff + 1] << 8) | rgba[srcOff + 2];
                    indices[dstIdx] = colorToIndex.get(key) ?? 0;
                }
            }
        }

        // Delay in centiseconds (GIF uses 1/100s units)
        const delayCs = Math.max(1, Math.round((frames[frameIdx].delay || 100) / 10));

        // --- Graphic Control Extension ---
        write([
            0x21, 0xF9, // extension introducer, GCE label
            0x04,       // block size
            0x09,       // packed: disposal=2 (restore to bg), no user input, transparency=1
            delayCs & 0xFF, (delayCs >> 8) & 0xFF, // delay
            transparentIndex, // transparent color index
            0x00,       // block terminator
        ]);

        // --- Image Descriptor ---
        write([
            0x2C, // image separator
            0, 0, // left
            0, 0, // top
            outWidth & 0xFF, (outWidth >> 8) & 0xFF,
            outHeight & 0xFF, (outHeight >> 8) & 0xFF,
            0x00, // no local color table, not interlaced
        ]);

        // --- LZW Image Data ---
        const minCodeSize = 8; // 256 colors
        write([minCodeSize]);
        const lzwData = lzwEncode(indices, minCodeSize);
        // Write as sub-blocks (max 255 bytes each)
        let pos = 0;
        while (pos < lzwData.length) {
            const blockSize = Math.min(255, lzwData.length - pos);
            write([blockSize]);
            write(lzwData.subarray(pos, pos + blockSize));
            pos += blockSize;
        }
        write([0x00]); // block terminator
    }

    // Restore original state
    for (let i = 0; i < doc.layers.length && i < savedLayers.length; i++) {
        const s = savedLayers[i];
        doc.layers[i].data = s.data;
        doc.layers[i].opacity = s.opacity;
        doc.layers[i].textData = s.textData;
        doc.layers[i].offsetX = s.offsetX;
        doc.layers[i].offsetY = s.offsetY;
        doc.layers[i].width = s.width;
        doc.layers[i].height = s.height;
    }
    doc.activeFrameIndex = savedActiveIndex;

    // --- GIF Trailer ---
    write([0x3B]);

    // Combine all chunks into a single blob
    const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
    const result = new Uint8Array(totalSize);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }

    return new Blob([result], { type: 'image/gif' });
}

/**
 * LZW encoder for GIF image data.
 * Takes an array of palette indices and the minimum code size.
 * Returns a Uint8Array of packed LZW codes.
 */
function lzwEncode(indices, minCodeSize) {
    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;

    // Output bit stream
    const output = [];
    let curByte = 0;
    let curBits = 0;

    function writeBits(code, numBits) {
        curByte |= (code << curBits);
        curBits += numBits;
        while (curBits >= 8) {
            output.push(curByte & 0xFF);
            curByte >>= 8;
            curBits -= 8;
        }
    }

    // Initialize
    let codeSize = minCodeSize + 1;
    let nextCode = eoiCode + 1;
    const maxTableSize = 4096; // 12-bit max

    // Code table: use a trie for efficient prefix lookup
    // Each node: Map<index, childNode>
    // We represent nodes as objects with a .children map and a .code
    function initTable() {
        const table = [];
        for (let i = 0; i < clearCode; i++) {
            table[i] = { code: i, children: new Map() };
        }
        return table;
    }

    let table = initTable();

    // Emit clear code
    writeBits(clearCode, codeSize);

    if (indices.length === 0) {
        writeBits(eoiCode, codeSize);
        if (curBits > 0) output.push(curByte & 0xFF);
        return new Uint8Array(output);
    }

    let current = table[indices[0]];

    for (let i = 1; i < indices.length; i++) {
        const pixel = indices[i];
        const child = current.children.get(pixel);

        if (child) {
            // Extend the current string
            current = child;
        } else {
            // Output the code for current string
            writeBits(current.code, codeSize);

            // Add new string to table
            if (nextCode < maxTableSize) {
                current.children.set(pixel, { code: nextCode, children: new Map() });
                nextCode++;
                // Increase code size if needed
                if (nextCode > (1 << codeSize) && codeSize < 12) {
                    codeSize++;
                }
            } else {
                // Table full, emit clear code and reset
                writeBits(clearCode, codeSize);
                table = initTable();
                nextCode = eoiCode + 1;
                codeSize = minCodeSize + 1;
            }

            // Start new string with current pixel
            current = table[pixel];
        }
    }

    // Output the last string
    writeBits(current.code, codeSize);

    // End of information
    writeBits(eoiCode, codeSize);

    // Flush remaining bits
    if (curBits > 0) {
        output.push(curByte & 0xFF);
    }

    return new Uint8Array(output);
}


/***/ },

/***/ "./js/util/io.js"
/*!***********************!*\
  !*** ./js/util/io.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   downloadBlob: () => (/* binding */ downloadBlob),
/* harmony export */   exportBMP: () => (/* binding */ exportBMP),
/* harmony export */   exportICO: () => (/* binding */ exportICO),
/* harmony export */   exportPAL: () => (/* binding */ exportPAL),
/* harmony export */   exportPCX: () => (/* binding */ exportPCX),
/* harmony export */   exportPNG: () => (/* binding */ exportPNG),
/* harmony export */   getValidICOLayers: () => (/* binding */ getValidICOLayers),
/* harmony export */   importBMP: () => (/* binding */ importBMP),
/* harmony export */   importPAL: () => (/* binding */ importPAL),
/* harmony export */   importPCX: () => (/* binding */ importPCX),
/* harmony export */   loadPix8: () => (/* binding */ loadPix8),
/* harmony export */   savePix8: () => (/* binding */ savePix8)
/* harmony export */ });
/* harmony import */ var _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../model/ImageDocument.js */ "./js/model/ImageDocument.js");
/* harmony import */ var _model_Layer_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../model/Layer.js */ "./js/model/Layer.js");
/* harmony import */ var _model_Palette_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../model/Palette.js */ "./js/model/Palette.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");





// ─── PIX8 Project Format ─────────────────────────────────────────────────

function savePix8(doc) {
    const meta = {
        version: 1,
        width: doc.width,
        height: doc.height,
        palette: doc.palette.export(),
        layers: doc.layers.map(l => ({
            name: l.name,
            visible: l.visible,
            locked: l.locked,
            opacity: l.opacity,
            width: l.width,
            height: l.height,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            type: l.type || 'raster',
            textData: l.textData || null,
            isFixedSize: l.isFixedSize || false,
        })),
        activeLayerIndex: doc.activeLayerIndex,
        fgColorIndex: doc.fgColorIndex,
        bgColorIndex: doc.bgColorIndex,
        animationEnabled: doc.animationEnabled,
        onionSkinning: doc.onionSkinning,
        onionOpacity: doc.onionOpacity,
        onionExtended: doc.onionExtended,
        frames: doc.animationEnabled ? doc.frames.map(f => ({
            tag: f.tag,
            delay: f.delay,
            layerData: f.layerData.map(ld => ({
                opacity: ld.opacity,
                textData: ld.textData,
                offsetX: ld.offsetX,
                offsetY: ld.offsetY,
                width: ld.width,
                height: ld.height,
            })),
        })) : [],
        activeFrameIndex: doc.activeFrameIndex,
    };

    const metaJson = JSON.stringify(meta);
    const metaBytes = new TextEncoder().encode(metaJson);

    // Calculate total size: 4 bytes meta length + meta + base layer data + frame pixel data
    let totalLayerBytes = 0;
    for (const layer of doc.layers) {
        totalLayerBytes += layer.width * layer.height * 2;
    }

    let totalFrameBytes = 0;
    if (doc.animationEnabled) {
        for (const frame of doc.frames) {
            for (const ld of frame.layerData) {
                totalFrameBytes += ld.data.length * 2;
            }
        }
    }

    const totalSize = 4 + metaBytes.length + totalLayerBytes + totalFrameBytes;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    view.setUint32(0, metaBytes.length, true);
    bytes.set(metaBytes, 4);

    let offset = 4 + metaBytes.length;
    for (const layer of doc.layers) {
        const u8View = new Uint8Array(layer.data.buffer, layer.data.byteOffset, layer.data.byteLength);
        bytes.set(u8View, offset);
        offset += layer.width * layer.height * 2;
    }

    // Write frame pixel data
    if (doc.animationEnabled) {
        for (const frame of doc.frames) {
            for (const ld of frame.layerData) {
                const u8View = new Uint8Array(ld.data.buffer, ld.data.byteOffset, ld.data.byteLength);
                bytes.set(u8View, offset);
                offset += ld.data.length * 2;
            }
        }
    }

    return new Blob([buffer], { type: 'application/octet-stream' });
}

function loadPix8(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);

    const metaLen = view.getUint32(0, true);
    const metaJson = new TextDecoder().decode(bytes.slice(4, 4 + metaLen));
    const meta = JSON.parse(metaJson);

    const doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__.ImageDocument(meta.width, meta.height);
    doc.palette.import(meta.palette);
    doc.fgColorIndex = meta.fgColorIndex;
    doc.bgColorIndex = meta.bgColorIndex;

    // Remove default layer
    doc.layers = [];

    let offset = 4 + metaLen;
    for (const layerMeta of meta.layers) {
        // Per-layer dimensions (fall back to doc dimensions for old files)
        const lw = layerMeta.width ?? meta.width;
        const lh = layerMeta.height ?? meta.height;
        const layer = new _model_Layer_js__WEBPACK_IMPORTED_MODULE_1__.Layer(layerMeta.name, lw, lh);
        layer.visible = layerMeta.visible;
        layer.locked = layerMeta.locked;
        layer.opacity = layerMeta.opacity ?? 1;
        layer.offsetX = layerMeta.offsetX ?? 0;
        layer.offsetY = layerMeta.offsetY ?? 0;
        layer.type = layerMeta.type || 'raster';
        layer.textData = layerMeta.textData || null;
        layer.isFixedSize = !!layerMeta.isFixedSize;
        const layerByteSize = lw * lh * 2;
        const u8View = new Uint8Array(layer.data.buffer, layer.data.byteOffset, layer.data.byteLength);
        u8View.set(bytes.slice(offset, offset + layerByteSize));
        offset += layerByteSize;
        doc.layers.push(layer);
    }

    doc.activeLayerIndex = meta.activeLayerIndex || 0;
    doc.selectedLayerIndices.add(doc.activeLayerIndex);

    // Load animation frames
    if (meta.animationEnabled && meta.frames && meta.frames.length > 0) {
        doc.animationEnabled = true;
        doc.onionSkinning = !!meta.onionSkinning;
        doc.onionOpacity = meta.onionOpacity ?? 50;
        doc.onionExtended = !!meta.onionExtended;
        doc.activeFrameIndex = meta.activeFrameIndex || 0;
        doc.frames = meta.frames.map(frameMeta => {
            const frame = {
                tag: frameMeta.tag || '',
                delay: frameMeta.delay || 100,
                layerData: frameMeta.layerData.map((ldMeta, li) => {
                    const lw = ldMeta.width ?? meta.layers[li]?.width ?? meta.width;
                    const lh = ldMeta.height ?? meta.layers[li]?.height ?? meta.height;
                    const pixelCount = lw * lh;
                    const data = new Uint16Array(pixelCount);
                    const u8View = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
                    u8View.set(bytes.slice(offset, offset + pixelCount * 2));
                    offset += pixelCount * 2;
                    return {
                        data,
                        opacity: ldMeta.opacity ?? 1,
                        textData: ldMeta.textData || null,
                        offsetX: ldMeta.offsetX ?? 0,
                        offsetY: ldMeta.offsetY ?? 0,
                        width: lw,
                        height: lh,
                    };
                }),
            };
            return frame;
        });
        // Load the active frame into layers
        if (doc.frames[doc.activeFrameIndex]) {
            doc._restoreLayersFromFrame(doc.frames[doc.activeFrameIndex]);
        }
    }

    return doc;
}

// ─── BMP (8-bit, 256 colors) ────────────────────────────────────────────

function exportBMP(doc) {
    const flat = doc.flattenToLayer();
    const w = doc.width;
    const h = doc.height;

    // Row padding: rows must be multiple of 4 bytes
    const rowStride = Math.ceil(w / 4) * 4;
    const pixelDataSize = rowStride * h;
    const paletteSize = 256 * 4; // RGBX per entry
    const headerSize = 14 + 40; // BMP header + DIB header
    const fileSize = headerSize + paletteSize + pixelDataSize;

    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // BMP File Header (14 bytes)
    bytes[0] = 0x42; bytes[1] = 0x4D; // 'BM'
    view.setUint32(2, fileSize, true);
    view.setUint16(6, 0, true); // reserved
    view.setUint16(8, 0, true); // reserved
    view.setUint32(10, headerSize + paletteSize, true); // pixel data offset

    // DIB Header (BITMAPINFOHEADER, 40 bytes)
    view.setUint32(14, 40, true); // header size
    view.setInt32(18, w, true);
    view.setInt32(22, h, true); // positive = bottom-up
    view.setUint16(26, 1, true); // color planes
    view.setUint16(28, 8, true); // bits per pixel
    view.setUint32(30, 0, true); // compression (none)
    view.setUint32(34, pixelDataSize, true);
    view.setInt32(38, 2835, true); // h resolution (72 DPI)
    view.setInt32(42, 2835, true); // v resolution
    view.setUint32(46, 256, true); // colors used
    view.setUint32(50, 256, true); // important colors

    // Color table (256 entries, 4 bytes each: B, G, R, 0)
    let off = 54;
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = doc.palette.getColor(i);
        bytes[off++] = b;
        bytes[off++] = g;
        bytes[off++] = r;
        bytes[off++] = 0;
    }

    // Pixel data (bottom-to-top); TRANSPARENT pixels become index 0
    const pixelOffset = headerSize + paletteSize;
    for (let y = 0; y < h; y++) {
        const srcRow = h - 1 - y; // BMP is bottom-up
        const dstRowStart = pixelOffset + y * rowStride;
        for (let x = 0; x < w; x++) {
            const v = flat.getPixel(x, srcRow);
            bytes[dstRowStart + x] = v === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT ? 0 : v;
        }
        // Padding bytes remain 0
    }

    return new Blob([buffer], { type: 'image/bmp' });
}

function importBMP(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const bytes = new Uint8Array(arrayBuffer);

    // Validate BMP signature
    if (bytes[0] !== 0x42 || bytes[1] !== 0x4D) {
        throw new Error('Not a valid BMP file');
    }

    const pixelDataOffset = view.getUint32(10, true);
    const dibHeaderSize = view.getUint32(14, true);
    const w = view.getInt32(18, true);
    const h = Math.abs(view.getInt32(22, true));
    const topDown = view.getInt32(22, true) < 0;
    const bpp = view.getUint16(28, true);

    if (bpp !== 8) {
        throw new Error('Only 8-bit BMP files are supported');
    }

    const doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__.ImageDocument(w, h);

    // Read palette (starts at offset 54 for 40-byte DIB header)
    const paletteOffset = 14 + dibHeaderSize;
    for (let i = 0; i < 256; i++) {
        const off = paletteOffset + i * 4;
        const b = bytes[off];
        const g = bytes[off + 1];
        const r = bytes[off + 2];
        doc.palette.setColor(i, r, g, b);
    }

    // Read pixels
    const rowStride = Math.ceil(w / 4) * 4;
    const layer = doc.getActiveLayer();
    for (let y = 0; y < h; y++) {
        const srcRow = topDown ? y : (h - 1 - y);
        const rowStart = pixelDataOffset + srcRow * rowStride;
        for (let x = 0; x < w; x++) {
            layer.setPixel(x, y, bytes[rowStart + x]);
        }
    }

    return doc;
}

// ─── PCX (8-bit, 256 colors, RLE) ───────────────────────────────────────

function exportPCX(doc) {
    const flat = doc.flattenToLayer();
    const w = doc.width;
    const h = doc.height;

    // RLE encode pixel data
    const rleData = [];
    const bytesPerLine = w % 2 === 0 ? w : w + 1; // must be even

    for (let y = 0; y < h; y++) {
        let x = 0;
        while (x < bytesPerLine) {
            const rawVal = x < w ? flat.getPixel(x, y) : 0;
            const val = rawVal === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT ? 0 : rawVal;
            let count = 1;
            while (count < 63 && (x + count) < bytesPerLine) {
                const nextRaw = (x + count) < w ? flat.getPixel(x + count, y) : 0;
                const nextVal = nextRaw === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT ? 0 : nextRaw;
                if (nextVal !== val) break;
                count++;
            }

            if (count > 1 || (val & 0xC0) === 0xC0) {
                rleData.push(0xC0 | count);
                rleData.push(val);
            } else {
                rleData.push(val);
            }
            x += count;
        }
    }

    // Total size: 128 header + RLE data + 1 marker + 768 palette
    const totalSize = 128 + rleData.length + 1 + 768;
    const buffer = new ArrayBuffer(totalSize);
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);

    // PCX Header (128 bytes)
    bytes[0] = 0x0A;  // manufacturer
    bytes[1] = 5;     // version 5 (with 256-color palette)
    bytes[2] = 1;     // RLE encoding
    bytes[3] = 8;     // bits per pixel per plane

    // Window: xMin, yMin, xMax, yMax
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, w - 1, true);
    view.setUint16(10, h - 1, true);

    // DPI
    view.setUint16(12, 72, true);
    view.setUint16(14, 72, true);

    // 16-color palette (48 bytes at offset 16) — unused for 256-color
    // Reserved byte
    bytes[64] = 0;
    // Num planes
    bytes[65] = 1;
    // Bytes per line
    view.setUint16(66, bytesPerLine, true);
    // Palette type (1 = color)
    view.setUint16(68, 1, true);

    // RLE data
    let off = 128;
    for (const b of rleData) {
        bytes[off++] = b;
    }

    // 256-color palette marker
    bytes[off++] = 0x0C;

    // 256-color palette (768 bytes: R, G, B)
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = doc.palette.getColor(i);
        bytes[off++] = r;
        bytes[off++] = g;
        bytes[off++] = b;
    }

    return new Blob([buffer], { type: 'application/octet-stream' });
}

function importPCX(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);

    if (bytes[0] !== 0x0A) {
        throw new Error('Not a valid PCX file');
    }

    const bpp = bytes[3];
    const numPlanes = bytes[65];
    if (bpp !== 8 || numPlanes !== 1) {
        throw new Error('Only 8-bit single-plane PCX files are supported');
    }

    const xMin = view.getUint16(4, true);
    const yMin = view.getUint16(6, true);
    const xMax = view.getUint16(8, true);
    const yMax = view.getUint16(10, true);
    const w = xMax - xMin + 1;
    const h = yMax - yMin + 1;
    const bytesPerLine = view.getUint16(66, true);

    const doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_0__.ImageDocument(w, h);

    // Read 256-color palette from end of file
    const palOffset = arrayBuffer.byteLength - 768;
    if (bytes[palOffset - 1] === 0x0C) {
        for (let i = 0; i < 256; i++) {
            const off = palOffset + i * 3;
            doc.palette.setColor(i, bytes[off], bytes[off + 1], bytes[off + 2]);
        }
    }

    // Decode RLE pixel data
    const layer = doc.getActiveLayer();
    let srcOff = 128;
    for (let y = 0; y < h; y++) {
        let x = 0;
        while (x < bytesPerLine) {
            let byte = bytes[srcOff++];
            let count = 1;
            let value = byte;

            if ((byte & 0xC0) === 0xC0) {
                count = byte & 0x3F;
                value = bytes[srcOff++];
            }

            for (let c = 0; c < count; c++) {
                if (x < w) {
                    layer.setPixel(x, y, value);
                }
                x++;
            }
        }
    }

    return doc;
}

// ─── PNG Export ──────────────────────────────────────────────────────────

function exportPNG(doc, renderer) {
    const imageData = renderer.composite();
    const canvas = document.createElement('canvas');
    canvas.width = doc.width;
    canvas.height = doc.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png');
    });
}

// ─── PAL Format ─────────────────────────────────────────────────────────
// 6-bit: raw 768 bytes (256 × RGB, values 0-63)
// 8-bit: JASC-PAL text format (256 × RGB, values 0-255)

function exportPAL(palette, is6bit) {
    if (is6bit) {
        const data = new Uint8Array(768);
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = palette.getColor(i);
            data[i * 3]     = Math.round(r / 4);
            data[i * 3 + 1] = Math.round(g / 4);
            data[i * 3 + 2] = Math.round(b / 4);
        }
        return new Blob([data], { type: 'application/octet-stream' });
    }
    let text = 'JASC-PAL\r\n0100\r\n256\r\n';
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        text += `${r} ${g} ${b}\r\n`;
    }
    return new Blob([text], { type: 'text/plain' });
}

function importPAL(bytes) {
    // Raw 768-byte 6-bit PAL
    if (bytes.length === 768) {
        const colors = [];
        for (let i = 0; i < 256; i++) {
            colors.push([bytes[i * 3] * 4, bytes[i * 3 + 1] * 4, bytes[i * 3 + 2] * 4]);
        }
        return colors;
    }
    // JASC-PAL text format
    const text = new TextDecoder().decode(bytes);
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines[0] !== 'JASC-PAL') return null;
    const count = parseInt(lines[2]) || 256;
    const colors = [];
    for (let i = 0; i < count && i + 3 < lines.length; i++) {
        const parts = lines[i + 3].trim().split(/\s+/).map(Number);
        if (parts.length >= 3) {
            colors.push([parts[0], parts[1], parts[2]]);
        }
    }
    while (colors.length < 256) colors.push([0, 0, 0]);
    return colors;
}

// ─── ICO (Windows Icon) ─────────────────────────────────────────────────

const VALID_ICO_SIZES = new Set([16, 24, 32, 48, 64, 128, 256]);

function getValidICOLayers(doc) {
    const result = [];
    for (let i = 0; i < doc.layers.length; i++) {
        const layer = doc.layers[i];
        if (layer.isFixedSize && layer.width === layer.height && VALID_ICO_SIZES.has(layer.width)) {
            result.push({ index: i, layer, size: layer.width });
        }
    }
    return result;
}

function exportICO(doc, layerIndices) {
    const count = layerIndices.length;
    const headerSize = 6;
    const dirSize = 16 * count;

    // Build each image entry (BMP DIB + palette + pixels + AND mask)
    const entries = [];
    for (const idx of layerIndices) {
        const layer = doc.layers[idx];
        const w = layer.width;
        const h = layer.height;
        const rowStride = Math.ceil(w / 4) * 4; // pixel rows padded to 4 bytes
        const andRowStride = Math.ceil(w / 32) * 4; // AND mask rows padded to 4 bytes
        const pixelDataSize = rowStride * h;
        const andMaskSize = andRowStride * h;
        const paletteSize = 256 * 4;
        const dibHeaderSize = 40;
        const totalSize = dibHeaderSize + paletteSize + pixelDataSize + andMaskSize;

        const buffer = new ArrayBuffer(totalSize);
        const view = new DataView(buffer);
        const bytes = new Uint8Array(buffer);

        // BITMAPINFOHEADER (40 bytes)
        view.setUint32(0, 40, true);             // header size
        view.setInt32(4, w, true);               // width
        view.setInt32(8, h * 2, true);           // height (doubled for ICO: XOR + AND)
        view.setUint16(12, 1, true);             // color planes
        view.setUint16(14, 8, true);             // bits per pixel
        view.setUint32(16, 0, true);             // compression (none)
        view.setUint32(20, pixelDataSize + andMaskSize, true); // image size
        view.setInt32(24, 0, true);              // h resolution
        view.setInt32(28, 0, true);              // v resolution
        view.setUint32(32, 256, true);           // colors used
        view.setUint32(36, 0, true);             // important colors

        // Color table (256 entries: B, G, R, 0)
        let off = 40;
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = doc.palette.getColor(i);
            bytes[off++] = b;
            bytes[off++] = g;
            bytes[off++] = r;
            bytes[off++] = 0;
        }

        // Pixel data (bottom-to-top, TRANSPARENT → index 0)
        const pixelOffset = dibHeaderSize + paletteSize;
        for (let y = 0; y < h; y++) {
            const srcRow = h - 1 - y; // BMP is bottom-up
            const dstRowStart = pixelOffset + y * rowStride;
            for (let x = 0; x < w; x++) {
                const v = layer.getPixel(x, srcRow);
                bytes[dstRowStart + x] = v === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT ? 0 : v;
            }
        }

        // AND mask (1-bit, bottom-to-top: 1 = transparent, 0 = opaque)
        const andOffset = pixelOffset + pixelDataSize;
        for (let y = 0; y < h; y++) {
            const srcRow = h - 1 - y;
            const dstRowStart = andOffset + y * andRowStride;
            for (let x = 0; x < w; x++) {
                const v = layer.getPixel(x, srcRow);
                if (v === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT) {
                    bytes[dstRowStart + (x >> 3)] |= (0x80 >> (x & 7));
                }
            }
        }

        entries.push({ buffer, w, h });
    }

    // Compute offsets
    const totalFileSize = headerSize + dirSize + entries.reduce((s, e) => s + e.buffer.byteLength, 0);
    const fileBuffer = new ArrayBuffer(totalFileSize);
    const fileView = new DataView(fileBuffer);
    const fileBytes = new Uint8Array(fileBuffer);

    // ICO header
    fileView.setUint16(0, 0, true);       // reserved
    fileView.setUint16(2, 1, true);       // type: 1 = ICO
    fileView.setUint16(4, count, true);   // image count

    // Directory entries + image data
    let dataOffset = headerSize + dirSize;
    for (let i = 0; i < count; i++) {
        const e = entries[i];
        const dirOff = headerSize + i * 16;
        fileBytes[dirOff + 0] = e.w >= 256 ? 0 : e.w;  // width (0 = 256)
        fileBytes[dirOff + 1] = e.h >= 256 ? 0 : e.h;  // height (0 = 256)
        fileBytes[dirOff + 2] = 0;                       // color count (0 = 256+)
        fileBytes[dirOff + 3] = 0;                       // reserved
        fileView.setUint16(dirOff + 4, 1, true);         // color planes
        fileView.setUint16(dirOff + 6, 8, true);         // bits per pixel
        fileView.setUint32(dirOff + 8, e.buffer.byteLength, true);  // image size
        fileView.setUint32(dirOff + 12, dataOffset, true);          // data offset

        fileBytes.set(new Uint8Array(e.buffer), dataOffset);
        dataOffset += e.buffer.byteLength;
    }

    return new Blob([fileBuffer], { type: 'image/x-icon' });
}

// ─── File download helper ───────────────────────────────────────────────

async function downloadBlob(blob, filename) {
    if (window.electronAPI) {
        const ext = filename.split('.').pop().toLowerCase();
        const filters = [{ name: ext.toUpperCase() + ' files', extensions: [ext] }];
        const filePath = await window.electronAPI.showSaveDialog({
            defaultPath: filename,
            filters,
        });
        if (filePath) {
            const arrayBuffer = await blob.arrayBuffer();
            await window.electronAPI.saveFile(filePath, arrayBuffer);
        }
        return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}


/***/ },

/***/ "./js/util/math.js"
/*!*************************!*\
  !*** ./js/util/math.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bresenhamLine: () => (/* binding */ bresenhamLine),
/* harmony export */   clamp: () => (/* binding */ clamp),
/* harmony export */   ellipseFilled: () => (/* binding */ ellipseFilled),
/* harmony export */   ellipseOutline: () => (/* binding */ ellipseOutline),
/* harmony export */   pointInPolygon: () => (/* binding */ pointInPolygon),
/* harmony export */   rectFilled: () => (/* binding */ rectFilled),
/* harmony export */   rectOutline: () => (/* binding */ rectOutline),
/* harmony export */   snapEndpoint: () => (/* binding */ snapEndpoint)
/* harmony export */ });
/**
 * Snap an endpoint to the nearest 22.5-degree angle from a start point.
 */
function snapEndpoint(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return { x: x1, y: y1 };
    const snap = 22.5 * Math.PI / 180;
    const angle = Math.round(Math.atan2(dy, dx) / snap) * snap;
    return {
        x: Math.round(x0 + dist * Math.cos(angle)),
        y: Math.round(y0 + dist * Math.sin(angle)),
    };
}

function clamp(val, min, max) {
    return val < min ? min : val > max ? max : val;
}

/**
 * Bresenham's line algorithm. Calls callback(x, y) for each pixel.
 */
function bresenhamLine(x0, y0, x1, y1, callback) {
    x0 = Math.round(x0);
    y0 = Math.round(y0);
    x1 = Math.round(x1);
    y1 = Math.round(y1);

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
        callback(x0, y0);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x0 += sx; }
        if (e2 < dx) { err += dx; y0 += sy; }
    }
}

/**
 * Midpoint ellipse algorithm. Calls callback(x, y) for each pixel on the outline.
 */
function ellipseOutline(cx, cy, rx, ry, callback) {
    if (rx <= 0 || ry <= 0) {
        callback(cx, cy);
        return;
    }

    const rxSq = rx * rx;
    const rySq = ry * ry;
    const twoRxSq = 2 * rxSq;
    const twoRySq = 2 * rySq;

    let x = 0;
    let y = ry;
    let px = 0;
    let py = twoRxSq * y;

    // Plot four symmetric points
    function plot4(x, y) {
        callback(cx + x, cy + y);
        callback(cx - x, cy + y);
        callback(cx + x, cy - y);
        callback(cx - x, cy - y);
    }

    // Region 1
    let p = Math.round(rySq - rxSq * ry + 0.25 * rxSq);
    while (px < py) {
        plot4(x, y);
        x++;
        px += twoRySq;
        if (p < 0) {
            p += rySq + px;
        } else {
            y--;
            py -= twoRxSq;
            p += rySq + px - py;
        }
    }

    // Region 2
    p = Math.round(rySq * (x + 0.5) * (x + 0.5) + rxSq * (y - 1) * (y - 1) - rxSq * rySq);
    while (y >= 0) {
        plot4(x, y);
        y--;
        py -= twoRxSq;
        if (p > 0) {
            p += rxSq - py;
        } else {
            x++;
            px += twoRySq;
            p += rxSq - py + px;
        }
    }
}

/**
 * Filled ellipse: calls callback(x, y) for every pixel inside.
 */
function ellipseFilled(cx, cy, rx, ry, callback) {
    if (rx <= 0 || ry <= 0) {
        callback(cx, cy);
        return;
    }

    for (let y = -ry; y <= ry; y++) {
        // Calculate x extent for this scanline
        const xExtent = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
        for (let x = -xExtent; x <= xExtent; x++) {
            callback(cx + x, cy + y);
        }
    }
}

/**
 * Rectangle outline: calls callback(x, y) for border pixels.
 */
function rectOutline(x0, y0, x1, y1, callback) {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let x = minX; x <= maxX; x++) {
        callback(x, minY);
        callback(x, maxY);
    }
    for (let y = minY + 1; y < maxY; y++) {
        callback(minX, y);
        callback(maxX, y);
    }
}

/**
 * Filled rectangle: calls callback(x, y) for every pixel inside.
 */
function rectFilled(x0, y0, x1, y1, callback) {
    const minX = Math.min(x0, x1);
    const maxX = Math.max(x0, x1);
    const minY = Math.min(y0, y1);
    const maxY = Math.max(y0, y1);

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            callback(x, y);
        }
    }
}

/**
 * Point-in-polygon test (ray casting).
 */
function pointInPolygon(x, y, vertices) {
    let inside = false;
    const n = vertices.length;
    for (let i = 0, j = n - 1; i < n; j = i++) {
        const xi = vertices[i][0], yi = vertices[i][1];
        const xj = vertices[j][0], yj = vertices[j][1];

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}


/***/ },

/***/ "./js/util/quantize.js"
/*!*****************************!*\
  !*** ./js/util/quantize.js ***!
  \*****************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mapToPalette: () => (/* binding */ mapToPalette),
/* harmony export */   medianCut: () => (/* binding */ medianCut),
/* harmony export */   quantizeImage: () => (/* binding */ quantizeImage)
/* harmony export */ });
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../constants.js */ "./js/constants.js");


// ─── Color Deduplication ────────────────────────────────────────────────

function _deduplicateColors(colors, threshold) {
    const threshSq = threshold * threshold;
    const merged = [];
    const used = new Uint8Array(colors.length);
    // Sort by count descending so dominant colors absorb minor variants
    const sorted = colors.map((c, i) => ({ ...c, _idx: i }));
    sorted.sort((a, b) => (b.count || 1) - (a.count || 1));

    for (const entry of sorted) {
        if (used[entry._idx]) continue;
        let rSum = entry.color[0] * (entry.count || 1);
        let gSum = entry.color[1] * (entry.count || 1);
        let bSum = entry.color[2] * (entry.count || 1);
        let totalW = entry.count || 1;

        for (const other of sorted) {
            if (used[other._idx] || other._idx === entry._idx) continue;
            const dr = entry.color[0] - other.color[0];
            const dg = entry.color[1] - other.color[1];
            const db = entry.color[2] - other.color[2];
            if (dr * dr + dg * dg + db * db <= threshSq) {
                const w = other.count || 1;
                rSum += other.color[0] * w;
                gSum += other.color[1] * w;
                bSum += other.color[2] * w;
                totalW += w;
                used[other._idx] = 1;
            }
        }
        used[entry._idx] = 1;
        merged.push({
            color: [Math.round(rSum / totalW), Math.round(gSum / totalW), Math.round(bSum / totalW)],
            count: totalW,
        });
    }
    return merged;
}

// ─── Median Cut ─────────────────────────────────────────────────────────

function medianCut(colors, n) {
    // Merge near-identical colors (distance <= 4) before splitting
    colors = _deduplicateColors(colors, 4);
    if (colors.length <= n) return colors;

    let buckets = [colors];

    while (buckets.length < n) {
        let bestBucket = 0, bestRange = -1, bestChannel = 0;
        for (let bi = 0; bi < buckets.length; bi++) {
            const bucket = buckets[bi];
            if (bucket.length < 2) continue;
            for (let ch = 0; ch < 3; ch++) {
                let min = 255, max = 0;
                for (const c of bucket) {
                    if (c.color[ch] < min) min = c.color[ch];
                    if (c.color[ch] > max) max = c.color[ch];
                }
                if (max - min > bestRange) {
                    bestRange = max - min;
                    bestBucket = bi;
                    bestChannel = ch;
                }
            }
        }

        if (bestRange <= 0) break;

        const bucket = buckets[bestBucket];
        bucket.sort((a, b) => a.color[bestChannel] - b.color[bestChannel]);
        const mid = Math.floor(bucket.length / 2);
        buckets.splice(bestBucket, 1, bucket.slice(0, mid), bucket.slice(mid));
    }

    return buckets.map(bucket => {
        let totalW = 0, rSum = 0, gSum = 0, bSum = 0;
        for (const c of bucket) {
            const w = c.count || 1;
            totalW += w;
            rSum += c.color[0] * w;
            gSum += c.color[1] * w;
            bSum += c.color[2] * w;
        }
        return {
            color: [
                Math.round(rSum / totalW),
                Math.round(gSum / totalW),
                Math.round(bSum / totalW)
            ]
        };
    });
}

// ─── Nearest Color ──────────────────────────────────────────────────────

function nearestColorIndex(r, g, b, palette) {
    let bestDist = Infinity, bestI = 0;
    for (let i = 0; i < palette.length; i++) {
        const [pr, pg, pb] = palette[i];
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dist < bestDist) { bestDist = dist; bestI = i; }
    }
    return bestI;
}

// ─── Bayer Matrix (4x4) ────────────────────────────────────────────────

const BAYER4 = [
     0,  8,  2, 10,
    12,  4, 14,  6,
     3, 11,  1,  9,
    15,  7, 13,  5
];

// ─── Quantize RGBA to Indexed ───────────────────────────────────────────

/**
 * Quantize a truecolor image to indexed color.
 * @param {Uint8ClampedArray} rgbaData - RGBA pixel data
 * @param {number} width
 * @param {number} height
 * @param {number} numColors - target palette size (1-256)
 * @param {string} ditherMode - 'none', 'floyd-steinberg', or 'ordered'
 * @returns {{ palette: number[][], indices: Uint16Array }}
 */
function quantizeImage(rgbaData, width, height, numColors, ditherMode) {
    // Collect unique colors with counts
    const colorMap = new Map();
    const pixelCount = width * height;
    for (let i = 0; i < pixelCount; i++) {
        const off = i * 4;
        if (rgbaData[off + 3] < 128) continue; // skip transparent
        const key = (rgbaData[off] << 16) | (rgbaData[off + 1] << 8) | rgbaData[off + 2];
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    const colors = [];
    for (const [key, count] of colorMap) {
        colors.push({
            color: [(key >> 16) & 0xFF, (key >> 8) & 0xFF, key & 0xFF],
            count
        });
    }

    const reps = medianCut(colors, numColors);
    const palette = reps.map(r => r.color);

    const indices = mapToPalette(rgbaData, width, height, palette, ditherMode);
    return { palette, indices };
}

/**
 * Map RGBA pixels to an existing palette.
 * @param {Uint8ClampedArray} rgbaData - RGBA pixel data
 * @param {number} width
 * @param {number} height
 * @param {number[][]} palette - array of [r,g,b]
 * @param {string} ditherMode - 'none', 'floyd-steinberg', or 'ordered'
 * @returns {Uint16Array} palette indices (TRANSPARENT for alpha < 128)
 */
function mapToPalette(rgbaData, width, height, palette, ditherMode) {
    const indices = new Uint16Array(width * height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

    if (ditherMode === 'floyd-steinberg') {
        return _ditherFloydSteinberg(rgbaData, width, height, palette);
    } else if (ditherMode === 'ordered') {
        return _ditherOrdered(rgbaData, width, height, palette);
    }

    // No dithering
    for (let i = 0; i < width * height; i++) {
        const off = i * 4;
        if (rgbaData[off + 3] < 128) { indices[i] = _constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT; continue; }
        indices[i] = nearestColorIndex(rgbaData[off], rgbaData[off + 1], rgbaData[off + 2], palette);
    }
    return indices;
}

// ─── Floyd-Steinberg Error Diffusion ────────────────────────────────────

function _ditherFloydSteinberg(rgbaData, width, height, palette) {
    const indices = new Uint16Array(width * height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);
    // Work with float error buffer
    const errR = new Float32Array(width * height);
    const errG = new Float32Array(width * height);
    const errB = new Float32Array(width * height);

    // Initialize from source
    for (let i = 0; i < width * height; i++) {
        const off = i * 4;
        errR[i] = rgbaData[off];
        errG[i] = rgbaData[off + 1];
        errB[i] = rgbaData[off + 2];
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const off = i * 4;
            if (rgbaData[off + 3] < 128) continue;

            const r = Math.max(0, Math.min(255, Math.round(errR[i])));
            const g = Math.max(0, Math.min(255, Math.round(errG[i])));
            const b = Math.max(0, Math.min(255, Math.round(errB[i])));

            const ci = nearestColorIndex(r, g, b, palette);
            indices[i] = ci;

            const [pr, pg, pb] = palette[ci];
            const er = r - pr, eg = g - pg, eb = b - pb;

            // Distribute error
            if (x + 1 < width) {
                const j = i + 1;
                errR[j] += er * 7 / 16;
                errG[j] += eg * 7 / 16;
                errB[j] += eb * 7 / 16;
            }
            if (y + 1 < height) {
                if (x > 0) {
                    const j = i + width - 1;
                    errR[j] += er * 3 / 16;
                    errG[j] += eg * 3 / 16;
                    errB[j] += eb * 3 / 16;
                }
                {
                    const j = i + width;
                    errR[j] += er * 5 / 16;
                    errG[j] += eg * 5 / 16;
                    errB[j] += eb * 5 / 16;
                }
                if (x + 1 < width) {
                    const j = i + width + 1;
                    errR[j] += er * 1 / 16;
                    errG[j] += eg * 1 / 16;
                    errB[j] += eb * 1 / 16;
                }
            }
        }
    }
    return indices;
}

// ─── Ordered (Bayer) Dithering ──────────────────────────────────────────

function _ditherOrdered(rgbaData, width, height, palette) {
    const indices = new Uint16Array(width * height).fill(_constants_js__WEBPACK_IMPORTED_MODULE_0__.TRANSPARENT);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = y * width + x;
            const off = i * 4;
            if (rgbaData[off + 3] < 128) { continue; }

            const threshold = (BAYER4[(y & 3) * 4 + (x & 3)] / 16 - 0.5) * 64;
            const r = Math.max(0, Math.min(255, rgbaData[off] + threshold));
            const g = Math.max(0, Math.min(255, rgbaData[off + 1] + threshold));
            const b = Math.max(0, Math.min(255, rgbaData[off + 2] + threshold));

            indices[i] = nearestColorIndex(r, g, b, palette);
        }
    }
    return indices;
}


/***/ },

/***/ "./js/util/spx.js"
/*!************************!*\
  !*** ./js/util/spx.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportSPX: () => (/* binding */ exportSPX),
/* harmony export */   exportSPXZip: () => (/* binding */ exportSPXZip)
/* harmony export */ });
/* harmony import */ var _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../render/Renderer.js */ "./js/render/Renderer.js");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jszip */ "./node_modules/jszip/dist/jszip.min.js");
/* harmony import */ var jszip__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jszip__WEBPACK_IMPORTED_MODULE_1__);



const MAX_PCX_W = 320;
const MAX_PCX_H = 200;
 
/**
 * Export SPX (Sprite XML) + PCX sprite sheet(s).
 *
 * Each frame is cropped to its non-transparent bounding box to produce
 * the smallest possible PCX(s). Frames are packed using a skyline
 * algorithm to minimize total area. PCX files are capped at 320x200
 * (VGA); when a sheet fills up, a new PCX is started. Tag groups are
 * never split across PCX files.
 *
 * Returns { spxBlob, pcxFiles: [{ blob, filename }] }.
 */
function exportSPX(doc, options = {}) {
    const name = options.name || 'sprite';

    doc.saveCurrentFrame();

    // --- 1. Composite and crop each frame ---
    const renderer = new _render_Renderer_js__WEBPACK_IMPORTED_MODULE_0__.Renderer(doc);
    const frames = doc.frames;
    const frameW = doc.width;
    const frameH = doc.height;

    const savedLayers = doc.layers.map(l => ({
        data: l.data, opacity: l.opacity, textData: l.textData,
        offsetX: l.offsetX, offsetY: l.offsetY,
        width: l.width, height: l.height,
    }));
    const savedActiveIndex = doc.activeFrameIndex;

    const palette = doc.palette;
    const colorToIndex = new Map();
    for (let i = 0; i < 256; i++) {
        const [r, g, b] = palette.getColor(i);
        const key = (r << 16) | (g << 8) | b;
        if (!colorToIndex.has(key)) colorToIndex.set(key, i);
    }

    const croppedFrames = [];

    for (let fi = 0; fi < frames.length; fi++) {
        doc._restoreLayersFromFrame(frames[fi]);
        const imageData = renderer.composite();
        const rgba = imageData.data;

        let minX = frameW, minY = frameH, maxX = -1, maxY = -1;
        for (let y = 0; y < frameH; y++) {
            for (let x = 0; x < frameW; x++) {
                if (rgba[(y * frameW + x) * 4 + 3] >= 128) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }

        if (maxX < 0) {
            croppedFrames.push({
                tag: frames[fi].tag,
                delay: frames[fi].delay || 100,
                offsetX: 0, offsetY: 0,
                cropW: 1, cropH: 1,
                pixels: new Uint8Array([0]),
            });
        } else {
            const cropW = maxX - minX + 1;
            const cropH = maxY - minY + 1;
            const pixels = new Uint8Array(cropW * cropH);
            for (let y = 0; y < cropH; y++) {
                for (let x = 0; x < cropW; x++) {
                    const srcOff = ((minY + y) * frameW + (minX + x)) * 4;
                    const a = rgba[srcOff + 3];
                    if (a < 128) {
                        pixels[y * cropW + x] = 0;
                    } else {
                        const key = (rgba[srcOff] << 16) | (rgba[srcOff + 1] << 8) | rgba[srcOff + 2];
                        pixels[y * cropW + x] = colorToIndex.get(key) ?? 0;
                    }
                }
            }
            croppedFrames.push({
                tag: frames[fi].tag,
                delay: frames[fi].delay || 100,
                offsetX: minX, offsetY: minY,
                cropW, cropH,
                pixels,
            });
        }
    }

    // Restore layers
    for (let i = 0; i < doc.layers.length && i < savedLayers.length; i++) {
        const s = savedLayers[i];
        doc.layers[i].data = s.data;
        doc.layers[i].opacity = s.opacity;
        doc.layers[i].textData = s.textData;
        doc.layers[i].offsetX = s.offsetX;
        doc.layers[i].offsetY = s.offsetY;
        doc.layers[i].width = s.width;
        doc.layers[i].height = s.height;
    }
    doc.activeFrameIndex = savedActiveIndex;

    // --- 2. Build tag groups ---
    const tagGroups = [];
    for (let i = 0; i < croppedFrames.length; i++) {
        if (croppedFrames[i].tag) {
            tagGroups.push({ tag: croppedFrames[i].tag, start: i });
        }
    }
    if (tagGroups.length === 0) {
        tagGroups.push({ tag: name, start: 0 });
    }
    for (let g = 0; g < tagGroups.length; g++) {
        const nextStart = g + 1 < tagGroups.length ? tagGroups[g + 1].start : croppedFrames.length;
        tagGroups[g].frames = croppedFrames.slice(tagGroups[g].start, nextStart);
    }

    // --- 3. Deduplicate identical frames ---
    // Frames with identical pixel data share the same sheet position.
    const uniqueFrames = []; // frames that need their own slot
    const dupeMap = new Map(); // hash -> first frame with that hash

    for (const cf of croppedFrames) {
        // Hash: dimensions + pixel content
        let hash = `${cf.cropW}x${cf.cropH}:`;
        const px = cf.pixels;
        // Simple FNV-1a-like hash of pixel data
        let h = 2166136261;
        for (let i = 0; i < px.length; i++) {
            h ^= px[i];
            h = Math.imul(h, 16777619);
        }
        hash += h >>> 0;

        const existing = dupeMap.get(hash);
        if (existing && existing.cropW === cf.cropW && existing.cropH === cf.cropH &&
            existing.pixels.length === px.length && existing.pixels.every((v, i) => v === px[i])) {
            // Duplicate — will copy position after packing
            cf._dupeOf = existing;
        } else {
            dupeMap.set(hash, cf);
            uniqueFrames.push(cf);
        }
    }

    // --- 4. Skyline pack unique frames into PCX sheets (max 320x200) ---
    // Sort by height descending for better packing.
    const sortedUnique = uniqueFrames.map(cf => ({ cf }));
    sortedUnique.sort((a, b) => (b.cf.cropH - a.cf.cropH) || (b.cf.cropW - a.cf.cropW));

    const packers = [];

    for (const { cf } of sortedUnique) {
        let placed = false;
        // Try to fit in existing sheets
        for (let si = 0; si < packers.length; si++) {
            const pos = packers[si].insert(cf.cropW, cf.cropH);
            if (pos) {
                cf.sheetX = pos.x;
                cf.sheetY = pos.y;
                cf.imageIndex = si;
                placed = true;
                break;
            }
        }
        if (!placed) {
            // Start a new sheet
            const packer = new SkylinePacker(MAX_PCX_W, MAX_PCX_H);
            const pos = packer.insert(cf.cropW, cf.cropH);
            if (pos) {
                cf.sheetX = pos.x;
                cf.sheetY = pos.y;
                cf.imageIndex = packers.length;
            } else {
                // Frame larger than max sheet — force it (shouldn't happen with typical sprites)
                cf.sheetX = 0;
                cf.sheetY = 0;
                cf.imageIndex = packers.length;
            }
            packers.push(packer);
        }
    }

    // Copy positions from originals to duplicate frames
    for (const cf of croppedFrames) {
        if (cf._dupeOf) {
            cf.sheetX = cf._dupeOf.sheetX;
            cf.sheetY = cf._dupeOf.sheetY;
            cf.imageIndex = cf._dupeOf.imageIndex;
        }
    }

    // Check tag group coherence: all frames in a group must be in the same image.
    // If split, move the minority to the majority's sheet (best-effort).
    for (const group of tagGroups) {
        const imageCounts = new Map();
        for (const cf of group.frames) {
            imageCounts.set(cf.imageIndex, (imageCounts.get(cf.imageIndex) || 0) + 1);
        }
        if (imageCounts.size > 1) {
            // Find the image with the most frames from this group
            let bestImg = 0, bestCount = 0;
            for (const [img, count] of imageCounts) {
                if (count > bestCount) { bestImg = img; bestCount = count; }
            }
            // Re-pack stray frames into the majority sheet
            for (const cf of group.frames) {
                if (cf.imageIndex !== bestImg) {
                    const pos = packers[bestImg].insert(cf.cropW, cf.cropH);
                    if (pos) {
                        cf.sheetX = pos.x;
                        cf.sheetY = pos.y;
                        cf.imageIndex = bestImg;
                    }
                    // If it doesn't fit, leave it (edge case)
                }
            }
        }
        group.imageIndex = group.frames[0].imageIndex;
    }

    // --- 4. Build PCX files ---
    const pcxFiles = [];

    for (let si = 0; si < packers.length; si++) {
        const packer = packers[si];
        const sheetW = packer.usedWidth();
        const sheetH = packer.usedHeight();
        if (sheetW === 0 || sheetH === 0) continue;

        const bytesPerLine = sheetW % 2 === 0 ? sheetW : sheetW + 1;

        // Blit frames into sheet
        const pixels = new Uint8Array(bytesPerLine * sheetH);
        for (const cf of croppedFrames) {
            if (cf.imageIndex !== si) continue;
            for (let y = 0; y < cf.cropH; y++) {
                for (let x = 0; x < cf.cropW; x++) {
                    pixels[(cf.sheetY + y) * bytesPerLine + (cf.sheetX + x)] =
                        cf.pixels[y * cf.cropW + x];
                }
            }
        }

        // RLE encode
        const rleData = [];
        for (let y = 0; y < sheetH; y++) {
            let x = 0;
            while (x < bytesPerLine) {
                const val = pixels[y * bytesPerLine + x];
                let count = 1;
                while (count < 63 && (x + count) < bytesPerLine) {
                    if (pixels[y * bytesPerLine + x + count] !== val) break;
                    count++;
                }
                if (count > 1 || (val & 0xC0) === 0xC0) {
                    rleData.push(0xC0 | count);
                    rleData.push(val);
                } else {
                    rleData.push(val);
                }
                x += count;
            }
        }

        // Build PCX buffer
        const totalSize = 128 + rleData.length + 1 + 768;
        const pcxBuf = new ArrayBuffer(totalSize);
        const pcxBytes = new Uint8Array(pcxBuf);
        const pcxView = new DataView(pcxBuf);

        pcxBytes[0] = 0x0A;
        pcxBytes[1] = 5;
        pcxBytes[2] = 1;
        pcxBytes[3] = 8;
        pcxView.setUint16(4, 0, true);
        pcxView.setUint16(6, 0, true);
        pcxView.setUint16(8, sheetW - 1, true);
        pcxView.setUint16(10, sheetH - 1, true);
        pcxView.setUint16(12, 72, true);
        pcxView.setUint16(14, 72, true);
        pcxBytes[64] = 0;
        pcxBytes[65] = 1;
        pcxView.setUint16(66, bytesPerLine, true);
        pcxView.setUint16(68, 1, true);

        let off = 128;
        for (const b of rleData) pcxBytes[off++] = b;
        pcxBytes[off++] = 0x0C;
        for (let i = 0; i < 256; i++) {
            const [r, g, b] = palette.getColor(i);
            pcxBytes[off++] = r;
            pcxBytes[off++] = g;
            pcxBytes[off++] = b;
        }

        const suffix = packers.length > 1 ? `${si + 1}` : '';
        const filename = (name + suffix + '.PCX').toUpperCase();
        pcxFiles.push({
            blob: new Blob([pcxBuf], { type: 'application/octet-stream' }),
            filename,
            imageName: name + suffix,
        });
    }

    // --- 5. Build SPX XML ---
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sprite-xml>\n';

    for (let pi = 0; pi < pcxFiles.length; pi++) {
        const pf = pcxFiles[pi];
        const palAttr = pi === 0 ? ` palette="${esc(name)}"` : '';
        xml += `  <image name="${esc(pf.imageName)}" path="${esc(pf.filename)}"${palAttr} />\n`;
    }
    xml += '\n';

    for (const group of tagGroups) {
        const spriteName = group.tag;
        const imageName = pcxFiles[group.imageIndex].imageName;
        const totalMs = group.frames.reduce((sum, f) => sum + f.delay, 0);
        const totalSec = (totalMs / 1000).toFixed(2);
        const allSameDelay = group.frames.every(f => f.delay === group.frames[0].delay);

        xml += `  <sprite name="${esc(spriteName)}" image="${esc(imageName)}" width="${frameW}" height="${frameH}" duration="${totalSec}">\n`;

        for (const cf of group.frames) {
            const attrs = [`x="${cf.sheetX}"`, `y="${cf.sheetY}"`];

            if (cf.cropW !== frameW || cf.cropH !== frameH) {
                attrs.push(`width="${cf.cropW}"`);
                attrs.push(`height="${cf.cropH}"`);
            }

            if (cf.offsetX !== 0) attrs.push(`offset-x="${cf.offsetX}"`);
            if (cf.offsetY !== 0) attrs.push(`offset-y="${cf.offsetY}"`);

            if (!allSameDelay) {
                attrs.push(`duration="${(cf.delay / 1000).toFixed(2)}"`);
            }

            xml += `    <frame ${attrs.join(' ')} />\n`;
        }

        xml += '  </sprite>\n\n';
    }

    xml += '</sprite-xml>\n';

    const spxBlob = new Blob([xml], { type: 'application/xml' });
    return { spxBlob, pcxFiles };
}

/**
 * Skyline Bottom-Left bin packer.
 * Tracks the top edge ("skyline") of placed rectangles and inserts
 * new rectangles at the position that minimizes wasted vertical space.
 */
class SkylinePacker {
    constructor(maxW, maxH) {
        this.maxW = maxW;
        this.maxH = maxH;
        this.skyline = [{ x: 0, y: 0, w: maxW }];
        this._usedW = 0;
        this._usedH = 0;
    }

    insert(rw, rh) {
        // Find the best position: the skyline span where placing the rect
        // results in the lowest top edge (y + rh).
        let bestY = Infinity;
        let bestIdx = -1;
        let bestX = 0;

        for (let i = 0; i < this.skyline.length; i++) {
            const result = this._fitAt(i, rw, rh);
            if (result !== null && result.y + rh < bestY) {
                bestY = result.y + rh;
                bestIdx = i;
                bestX = this.skyline[i].x;
            }
        }

        if (bestIdx === -1) return null; // doesn't fit

        // Place the rectangle
        const placed = { x: bestX, y: bestY - rh };

        // Track used bounds
        if (bestX + rw > this._usedW) this._usedW = bestX + rw;
        if (bestY > this._usedH) this._usedH = bestY;

        // Update skyline: add new segment for placed rect
        const newSeg = { x: bestX, y: bestY, w: rw };

        // Remove segments covered by the new rect
        const rightEdge = bestX + rw;
        const newSkyline = [];
        let i = 0;

        // Segments entirely before the new rect
        while (i < this.skyline.length && this.skyline[i].x + this.skyline[i].w <= bestX) {
            newSkyline.push(this.skyline[i]);
            i++;
        }

        // Segment partially before
        if (i < this.skyline.length && this.skyline[i].x < bestX) {
            newSkyline.push({ x: this.skyline[i].x, y: this.skyline[i].y, w: bestX - this.skyline[i].x });
        }

        // The new segment
        newSkyline.push(newSeg);

        // Skip covered segments
        while (i < this.skyline.length && this.skyline[i].x + this.skyline[i].w <= rightEdge) {
            i++;
        }

        // Segment partially after
        if (i < this.skyline.length && this.skyline[i].x < rightEdge) {
            const seg = this.skyline[i];
            const overlap = rightEdge - seg.x;
            newSkyline.push({ x: rightEdge, y: seg.y, w: seg.w - overlap });
            i++;
        }

        // Remaining segments
        while (i < this.skyline.length) {
            newSkyline.push(this.skyline[i]);
            i++;
        }

        this.skyline = this._merge(newSkyline);
        return placed;
    }

    // Check if a rect of size rw x rh fits starting at skyline segment idx
    _fitAt(idx, rw, rh) {
        const startX = this.skyline[idx].x;
        if (startX + rw > this.maxW) return null;

        let maxY = 0;
        let widthLeft = rw;
        let i = idx;

        while (widthLeft > 0 && i < this.skyline.length) {
            if (this.skyline[i].y > maxY) maxY = this.skyline[i].y;
            if (maxY + rh > this.maxH) return null;
            widthLeft -= this.skyline[i].w;
            // First segment may only partially overlap
            if (i === idx) {
                widthLeft += (this.skyline[i].x - startX);
            }
            i++;
        }

        if (widthLeft > 0) return null; // ran out of skyline width
        return { y: maxY };
    }

    // Merge adjacent segments with the same y
    _merge(segs) {
        if (segs.length <= 1) return segs;
        const merged = [segs[0]];
        for (let i = 1; i < segs.length; i++) {
            const last = merged[merged.length - 1];
            if (segs[i].y === last.y) {
                last.w += segs[i].w;
            } else {
                merged.push(segs[i]);
            }
        }
        return merged;
    }

    usedWidth() { return this._usedW; }
    usedHeight() { return this._usedH; }
}

/**
 * Export SPX + PCX(s) as a single ZIP file.
 */
async function exportSPXZip(doc, options = {}) {
    const name = options.name || 'sprite';
    const { spxBlob, pcxFiles } = exportSPX(doc, options);

    const zip = new (jszip__WEBPACK_IMPORTED_MODULE_1___default())();
    zip.file(name + '.spx', spxBlob);
    for (const pf of pcxFiles) {
        zip.file(pf.filename, pf.blob);
    }

    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/***/ },

/***/ "./node_modules/jszip/dist/jszip.min.js"
/*!**********************************************!*\
  !*** ./node_modules/jszip/dist/jszip.min.js ***!
  \**********************************************/
(module, __unused_webpack_exports, __webpack_require__) {

/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function(e){if(true)module.exports=e();else // removed by dead control flow
{}}(function(){return function s(a,o,h){function u(r,e){if(!o[r]){if(!a[r]){var t=undefined;if(!e&&t)return require(r,!0);if(l)return l(r,!0);var n=new Error("Cannot find module '"+r+"'");throw n.code="MODULE_NOT_FOUND",n}var i=o[r]={exports:{}};a[r][0].call(i.exports,function(e){var t=a[r][1][e];return u(t||e)},i,i.exports,s,a,o,h)}return o[r].exports}for(var l=undefined,e=0;e<h.length;e++)u(h[e]);return u}({1:[function(e,t,r){"use strict";var d=e("./utils"),c=e("./support"),p="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";r.encode=function(e){for(var t,r,n,i,s,a,o,h=[],u=0,l=e.length,f=l,c="string"!==d.getTypeOf(e);u<e.length;)f=l-u,n=c?(t=e[u++],r=u<l?e[u++]:0,u<l?e[u++]:0):(t=e.charCodeAt(u++),r=u<l?e.charCodeAt(u++):0,u<l?e.charCodeAt(u++):0),i=t>>2,s=(3&t)<<4|r>>4,a=1<f?(15&r)<<2|n>>6:64,o=2<f?63&n:64,h.push(p.charAt(i)+p.charAt(s)+p.charAt(a)+p.charAt(o));return h.join("")},r.decode=function(e){var t,r,n,i,s,a,o=0,h=0,u="data:";if(e.substr(0,u.length)===u)throw new Error("Invalid base64 input, it looks like a data url.");var l,f=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,"")).length/4;if(e.charAt(e.length-1)===p.charAt(64)&&f--,e.charAt(e.length-2)===p.charAt(64)&&f--,f%1!=0)throw new Error("Invalid base64 input, bad content length.");for(l=c.uint8array?new Uint8Array(0|f):new Array(0|f);o<e.length;)t=p.indexOf(e.charAt(o++))<<2|(i=p.indexOf(e.charAt(o++)))>>4,r=(15&i)<<4|(s=p.indexOf(e.charAt(o++)))>>2,n=(3&s)<<6|(a=p.indexOf(e.charAt(o++))),l[h++]=t,64!==s&&(l[h++]=r),64!==a&&(l[h++]=n);return l}},{"./support":30,"./utils":32}],2:[function(e,t,r){"use strict";var n=e("./external"),i=e("./stream/DataWorker"),s=e("./stream/Crc32Probe"),a=e("./stream/DataLengthProbe");function o(e,t,r,n,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=r,this.compression=n,this.compressedContent=i}o.prototype={getContentWorker:function(){var e=new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")),t=this;return e.on("end",function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw new Error("Bug : uncompressed data size mismatch")}),e},getCompressedWorker:function(){return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize",this.compressedSize).withStreamInfo("uncompressedSize",this.uncompressedSize).withStreamInfo("crc32",this.crc32).withStreamInfo("compression",this.compression)}},o.createWorkerFrom=function(e,t,r){return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression",t)},t.exports=o},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,r){"use strict";var n=e("./stream/GenericWorker");r.STORE={magic:"\0\0",compressWorker:function(){return new n("STORE compression")},uncompressWorker:function(){return new n("STORE decompression")}},r.DEFLATE=e("./flate")},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,r){"use strict";var n=e("./utils");var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t){return void 0!==e&&e.length?"string"!==n.getTypeOf(e)?function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}(0|t,e,e.length,0):function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t.charCodeAt(a))];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,r){"use strict";r.base64=!1,r.binary=!1,r.dir=!1,r.createFolders=!0,r.date=null,r.compression=null,r.compressionOptions=null,r.comment=null,r.unixPermissions=null,r.dosPermissions=null},{}],6:[function(e,t,r){"use strict";var n=null;n="undefined"!=typeof Promise?Promise:e("lie"),t.exports={Promise:n}},{lie:37}],7:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Uint32Array,i=e("pako"),s=e("./utils"),a=e("./stream/GenericWorker"),o=n?"uint8array":"array";function h(e,t){a.call(this,"FlateWorker/"+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}r.magic="\b\0",s.inherits(h,a),h.prototype.processChunk=function(e){this.meta=e.meta,null===this._pako&&this._createPako(),this._pako.push(s.transformTo(o,e.data),!1)},h.prototype.flush=function(){a.prototype.flush.call(this),null===this._pako&&this._createPako(),this._pako.push([],!0)},h.prototype.cleanUp=function(){a.prototype.cleanUp.call(this),this._pako=null},h.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var t=this;this._pako.onData=function(e){t.push({data:e,meta:t.meta})}},r.compressWorker=function(e){return new h("Deflate",e)},r.uncompressWorker=function(){return new h("Inflate",{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,r){"use strict";function A(e,t){var r,n="";for(r=0;r<t;r++)n+=String.fromCharCode(255&e),e>>>=8;return n}function n(e,t,r,n,i,s){var a,o,h=e.file,u=e.compression,l=s!==O.utf8encode,f=I.transformTo("string",s(h.name)),c=I.transformTo("string",O.utf8encode(h.name)),d=h.comment,p=I.transformTo("string",s(d)),m=I.transformTo("string",O.utf8encode(d)),_=c.length!==h.name.length,g=m.length!==d.length,b="",v="",y="",w=h.dir,k=h.date,x={crc32:0,compressedSize:0,uncompressedSize:0};t&&!r||(x.crc32=e.crc32,x.compressedSize=e.compressedSize,x.uncompressedSize=e.uncompressedSize);var S=0;t&&(S|=8),l||!_&&!g||(S|=2048);var z=0,C=0;w&&(z|=16),"UNIX"===i?(C=798,z|=function(e,t){var r=e;return e||(r=t?16893:33204),(65535&r)<<16}(h.unixPermissions,w)):(C=20,z|=function(e){return 63&(e||0)}(h.dosPermissions)),a=k.getUTCHours(),a<<=6,a|=k.getUTCMinutes(),a<<=5,a|=k.getUTCSeconds()/2,o=k.getUTCFullYear()-1980,o<<=4,o|=k.getUTCMonth()+1,o<<=5,o|=k.getUTCDate(),_&&(v=A(1,1)+A(B(f),4)+c,b+="up"+A(v.length,2)+v),g&&(y=A(1,1)+A(B(p),4)+m,b+="uc"+A(y.length,2)+y);var E="";return E+="\n\0",E+=A(S,2),E+=u.magic,E+=A(a,2),E+=A(o,2),E+=A(x.crc32,4),E+=A(x.compressedSize,4),E+=A(x.uncompressedSize,4),E+=A(f.length,2),E+=A(b.length,2),{fileRecord:R.LOCAL_FILE_HEADER+E+f+b,dirRecord:R.CENTRAL_FILE_HEADER+A(C,2)+E+A(p.length,2)+"\0\0\0\0"+A(z,4)+A(n,4)+f+b+p}}var I=e("../utils"),i=e("../stream/GenericWorker"),O=e("../utf8"),B=e("../crc32"),R=e("../signature");function s(e,t,r,n){i.call(this,"ZipFileWorker"),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=r,this.encodeFileName=n,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}I.inherits(s,i),s.prototype.push=function(e){var t=e.meta.percent||0,r=this.entriesCount,n=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,i.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:r?(t+100*(r-n-1))/r:100}}))},s.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var r=n(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:r.fileRecord,meta:{percent:0}})}else this.accumulate=!0},s.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,r=n(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(r.dirRecord),t)this.push({data:function(e){return R.DATA_DESCRIPTOR+A(e.crc32,4)+A(e.compressedSize,4)+A(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:r.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},s.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var r=this.bytesWritten-e,n=function(e,t,r,n,i){var s=I.transformTo("string",i(n));return R.CENTRAL_DIRECTORY_END+"\0\0\0\0"+A(e,2)+A(e,2)+A(t,4)+A(r,4)+A(s.length,2)+s}(this.dirRecords.length,r,e,this.zipComment,this.encodeFileName);this.push({data:n,meta:{percent:100}})},s.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},s.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on("error",function(e){t.error(e)}),this},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},s.prototype.error=function(e){var t=this._sources;if(!i.prototype.error.call(this,e))return!1;for(var r=0;r<t.length;r++)try{t[r].error(e)}catch(e){}return!0},s.prototype.lock=function(){i.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=s},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,r){"use strict";var u=e("../compressions"),n=e("./ZipFileWorker");r.generateWorker=function(e,a,t){var o=new n(a.streamFiles,t,a.platform,a.encodeFileName),h=0;try{e.forEach(function(e,t){h++;var r=function(e,t){var r=e||t,n=u[r];if(!n)throw new Error(r+" is not a valid compression method !");return n}(t.options.compression,a.compression),n=t.options.compressionOptions||a.compressionOptions||{},i=t.dir,s=t.date;t._compressWorker(r,n).withStreamInfo("file",{name:e,dir:i,date:s,comment:t.comment||"",unixPermissions:t.unixPermissions,dosPermissions:t.dosPermissions}).pipe(o)}),o.entriesCount=h}catch(e){o.error(e)}return o}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,r){"use strict";function n(){if(!(this instanceof n))return new n;if(arguments.length)throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");this.files=Object.create(null),this.comment=null,this.root="",this.clone=function(){var e=new n;for(var t in this)"function"!=typeof this[t]&&(e[t]=this[t]);return e}}(n.prototype=e("./object")).loadAsync=e("./load"),n.support=e("./support"),n.defaults=e("./defaults"),n.version="3.10.1",n.loadAsync=function(e,t){return(new n).loadAsync(e,t)},n.external=e("./external"),t.exports=n},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,r){"use strict";var u=e("./utils"),i=e("./external"),n=e("./utf8"),s=e("./zipEntries"),a=e("./stream/Crc32Probe"),l=e("./nodejsUtils");function f(n){return new i.Promise(function(e,t){var r=n.decompressed.getContentWorker().pipe(new a);r.on("error",function(e){t(e)}).on("end",function(){r.streamInfo.crc32!==n.decompressed.crc32?t(new Error("Corrupted zip : CRC32 mismatch")):e()}).resume()})}t.exports=function(e,o){var h=this;return o=u.extend(o||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:n.utf8decode}),l.isNode&&l.isStream(e)?i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")):u.prepareContent("the loaded zip file",e,!0,o.optimizedBinaryString,o.base64).then(function(e){var t=new s(o);return t.load(e),t}).then(function(e){var t=[i.Promise.resolve(e)],r=e.files;if(o.checkCRC32)for(var n=0;n<r.length;n++)t.push(f(r[n]));return i.Promise.all(t)}).then(function(e){for(var t=e.shift(),r=t.files,n=0;n<r.length;n++){var i=r[n],s=i.fileNameStr,a=u.resolve(i.fileNameStr);h.file(a,i.decompressed,{binary:!0,optimizedBinaryString:!0,date:i.date,dir:i.dir,comment:i.fileCommentStr.length?i.fileCommentStr:null,unixPermissions:i.unixPermissions,dosPermissions:i.dosPermissions,createFolders:o.createFolders}),i.dir||(h.file(a).unsafeOriginalName=s)}return t.zipComment.length&&(h.comment=t.zipComment),h})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../stream/GenericWorker");function s(e,t){i.call(this,"Nodejs stream input adapter for "+e),this._upstreamEnded=!1,this._bindStream(t)}n.inherits(s,i),s.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on("data",function(e){t.push({data:e,meta:{percent:0}})}).on("error",function(e){t.isPaused?this.generatedError=e:t.error(e)}).on("end",function(){t.isPaused?t._upstreamEnded=!0:t.end()})},s.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=s},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,r){"use strict";var i=e("readable-stream").Readable;function n(e,t,r){i.call(this,t),this._helper=e;var n=this;e.on("data",function(e,t){n.push(e)||n._helper.pause(),r&&r(t)}).on("error",function(e){n.emit("error",e)}).on("end",function(){n.push(null)})}e("../utils").inherits(n,i),n.prototype._read=function(){this._helper.resume()},t.exports=n},{"../utils":32,"readable-stream":16}],14:[function(e,t,r){"use strict";t.exports={isNode:"undefined"!=typeof Buffer,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if("number"==typeof e)throw new Error('The "data" argument must not be a number');return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&"function"==typeof e.on&&"function"==typeof e.pause&&"function"==typeof e.resume}}},{}],15:[function(e,t,r){"use strict";function s(e,t,r){var n,i=u.getTypeOf(t),s=u.extend(r||{},f);s.date=s.date||new Date,null!==s.compression&&(s.compression=s.compression.toUpperCase()),"string"==typeof s.unixPermissions&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=g(e)),s.createFolders&&(n=_(e))&&b.call(this,n,!0);var a="string"===i&&!1===s.binary&&!1===s.base64;r&&void 0!==r.binary||(s.binary=!a),(t instanceof c&&0===t.uncompressedSize||s.dir||!t||0===t.length)&&(s.base64=!1,s.binary=!0,t="",s.compression="STORE",i="string");var o=null;o=t instanceof c||t instanceof l?t:p.isNode&&p.isStream(t)?new m(e,t):u.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var h=new d(e,o,s);this.files[e]=h}var i=e("./utf8"),u=e("./utils"),l=e("./stream/GenericWorker"),a=e("./stream/StreamHelper"),f=e("./defaults"),c=e("./compressedObject"),d=e("./zipObject"),o=e("./generate"),p=e("./nodejsUtils"),m=e("./nodejs/NodejsStreamInputAdapter"),_=function(e){"/"===e.slice(-1)&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf("/");return 0<t?e.substring(0,t):""},g=function(e){return"/"!==e.slice(-1)&&(e+="/"),e},b=function(e,t){return t=void 0!==t?t:f.createFolders,e=g(e),this.files[e]||s.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function h(e){return"[object RegExp]"===Object.prototype.toString.call(e)}var n={load:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},forEach:function(e){var t,r,n;for(t in this.files)n=this.files[t],(r=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(r,n)},filter:function(r){var n=[];return this.forEach(function(e,t){r(e,t)&&n.push(t)}),n},file:function(e,t,r){if(1!==arguments.length)return e=this.root+e,s.call(this,e,t,r),this;if(h(e)){var n=e;return this.filter(function(e,t){return!t.dir&&n.test(e)})}var i=this.files[this.root+e];return i&&!i.dir?i:null},folder:function(r){if(!r)return this;if(h(r))return this.filter(function(e,t){return t.dir&&r.test(e)});var e=this.root+r,t=b.call(this,e),n=this.clone();return n.root=t.name,n},remove:function(r){r=this.root+r;var e=this.files[r];if(e||("/"!==r.slice(-1)&&(r+="/"),e=this.files[r]),e&&!e.dir)delete this.files[r];else for(var t=this.filter(function(e,t){return t.name.slice(0,r.length)===r}),n=0;n<t.length;n++)delete this.files[t[n].name];return this},generate:function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},generateInternalStream:function(e){var t,r={};try{if((r=u.extend(e||{},{streamFiles:!1,compression:"STORE",compressionOptions:null,type:"",platform:"DOS",comment:null,mimeType:"application/zip",encodeFileName:i.utf8encode})).type=r.type.toLowerCase(),r.compression=r.compression.toUpperCase(),"binarystring"===r.type&&(r.type="string"),!r.type)throw new Error("No output type specified.");u.checkSupport(r.type),"darwin"!==r.platform&&"freebsd"!==r.platform&&"linux"!==r.platform&&"sunos"!==r.platform||(r.platform="UNIX"),"win32"===r.platform&&(r.platform="DOS");var n=r.comment||this.comment||"";t=o.generateWorker(this,r,n)}catch(e){(t=new l("error")).error(e)}return new a(t,r.type||"string",r.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e=e||{}).type||(e.type="nodebuffer"),this.generateInternalStream(e).toNodejsStream(t)}};t.exports=n},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,r){"use strict";t.exports=e("stream")},{stream:void 0}],17:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.length-4;0<=s;--s)if(this.data[s]===t&&this.data[s+1]===r&&this.data[s+2]===n&&this.data[s+3]===i)return s-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),r=e.charCodeAt(1),n=e.charCodeAt(2),i=e.charCodeAt(3),s=this.readData(4);return t===s[0]&&r===s[1]&&n===s[2]&&i===s[3]},i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,r){"use strict";var n=e("../utils");function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw new Error("End of data reached (data length = "+this.length+", asked index = "+e+"). Corrupted zip ?")},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,r=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)r=(r<<8)+this.byteAt(t);return this.index+=e,r},readString:function(e){return n.transformTo("string",this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,r){"use strict";var n=e("./Uint8ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,r){"use strict";var n=e("./DataReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,r){"use strict";var n=e("./ArrayReader");function i(e){n.call(this,e)}e("../utils").inherits(i,n),i.prototype.readData=function(e){if(this.checkOffset(e),0===e)return new Uint8Array(0);var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,r){"use strict";var n=e("../utils"),i=e("../support"),s=e("./ArrayReader"),a=e("./StringReader"),o=e("./NodeBufferReader"),h=e("./Uint8ArrayReader");t.exports=function(e){var t=n.getTypeOf(e);return n.checkSupport(t),"string"!==t||i.uint8array?"nodebuffer"===t?new o(e):i.uint8array?new h(n.transformTo("uint8array",e)):new s(n.transformTo("array",e)):new a(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,r){"use strict";r.LOCAL_FILE_HEADER="PK",r.CENTRAL_FILE_HEADER="PK",r.CENTRAL_DIRECTORY_END="PK",r.ZIP64_CENTRAL_DIRECTORY_LOCATOR="PK",r.ZIP64_CENTRAL_DIRECTORY_END="PK",r.DATA_DESCRIPTOR="PK\b"},{}],24:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../utils");function s(e){n.call(this,"ConvertWorker to "+e),this.destType=e}i.inherits(s,n),s.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=s},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,r){"use strict";var n=e("./GenericWorker"),i=e("../crc32");function s(){n.call(this,"Crc32Probe"),this.withStreamInfo("crc32",0)}e("../utils").inherits(s,n),s.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=s},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataLengthProbe for "+e),this.propName=e,this.withStreamInfo(e,0)}n.inherits(s,i),s.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=s},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,r){"use strict";var n=e("../utils"),i=e("./GenericWorker");function s(e){i.call(this,"DataWorker");var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type="",this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=n.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}n.inherits(s,i),s.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},s.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,n.delay(this._tickAndRepeat,[],this)),!0)},s.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(n.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},s.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case"string":e=this.data.substring(this.index,t);break;case"uint8array":e=this.data.subarray(this.index,t);break;case"array":case"nodebuffer":e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=s},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,r){"use strict";function n(e){this.name=e||"default",this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}n.prototype={push:function(e){this.emit("data",e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit("end"),this.cleanUp(),this.isFinished=!0}catch(e){this.emit("error",e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit("error",e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var r=0;r<this._listeners[e].length;r++)this._listeners[e][r].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on("data",function(e){t.processChunk(e)}),e.on("end",function(){t.end()}),e.on("error",function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw new Error("The stream '"+this+"' has already been used.");this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e="Worker "+this.name;return this.previous?this.previous+" -> "+e:e}},t.exports=n},{}],29:[function(e,t,r){"use strict";var h=e("../utils"),i=e("./ConvertWorker"),s=e("./GenericWorker"),u=e("../base64"),n=e("../support"),a=e("../external"),o=null;if(n.nodestream)try{o=e("../nodejs/NodejsStreamOutputAdapter")}catch(e){}function l(e,o){return new a.Promise(function(t,r){var n=[],i=e._internalType,s=e._outputType,a=e._mimeType;e.on("data",function(e,t){n.push(e),o&&o(t)}).on("error",function(e){n=[],r(e)}).on("end",function(){try{var e=function(e,t,r){switch(e){case"blob":return h.newBlob(h.transformTo("arraybuffer",t),r);case"base64":return u.encode(t);default:return h.transformTo(e,t)}}(s,function(e,t){var r,n=0,i=null,s=0;for(r=0;r<t.length;r++)s+=t[r].length;switch(e){case"string":return t.join("");case"array":return Array.prototype.concat.apply([],t);case"uint8array":for(i=new Uint8Array(s),r=0;r<t.length;r++)i.set(t[r],n),n+=t[r].length;return i;case"nodebuffer":return Buffer.concat(t);default:throw new Error("concat : unsupported type '"+e+"'")}}(i,n),a);t(e)}catch(e){r(e)}n=[]}).resume()})}function f(e,t,r){var n=t;switch(t){case"blob":case"arraybuffer":n="uint8array";break;case"base64":n="string"}try{this._internalType=n,this._outputType=t,this._mimeType=r,h.checkSupport(n),this._worker=e.pipe(new i(n)),e.lock()}catch(e){this._worker=new s("error"),this._worker.error(e)}}f.prototype={accumulate:function(e){return l(this,e)},on:function(e,t){var r=this;return"data"===e?this._worker.on(e,function(e){t.call(r,e.data,e.meta)}):this._worker.on(e,function(){h.delay(t,arguments,r)}),this},resume:function(){return h.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(h.checkSupport("nodestream"),"nodebuffer"!==this._outputType)throw new Error(this._outputType+" is not supported by this method");return new o(this,{objectMode:"nodebuffer"!==this._outputType},e)}},t.exports=f},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,r){"use strict";if(r.base64=!0,r.array=!0,r.string=!0,r.arraybuffer="undefined"!=typeof ArrayBuffer&&"undefined"!=typeof Uint8Array,r.nodebuffer="undefined"!=typeof Buffer,r.uint8array="undefined"!=typeof Uint8Array,"undefined"==typeof ArrayBuffer)r.blob=!1;else{var n=new ArrayBuffer(0);try{r.blob=0===new Blob([n],{type:"application/zip"}).size}catch(e){try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(n),r.blob=0===i.getBlob("application/zip").size}catch(e){r.blob=!1}}}try{r.nodestream=!!e("readable-stream").Readable}catch(e){r.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,s){"use strict";for(var o=e("./utils"),h=e("./support"),r=e("./nodejsUtils"),n=e("./stream/GenericWorker"),u=new Array(256),i=0;i<256;i++)u[i]=252<=i?6:248<=i?5:240<=i?4:224<=i?3:192<=i?2:1;u[254]=u[254]=1;function a(){n.call(this,"utf-8 decode"),this.leftOver=null}function l(){n.call(this,"utf-8 encode")}s.utf8encode=function(e){return h.nodebuffer?r.newBufferFrom(e,"utf-8"):function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=h.uint8array?new Uint8Array(o):new Array(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t}(e)},s.utf8decode=function(e){return h.nodebuffer?o.transformTo("nodebuffer",e).toString("utf-8"):function(e){var t,r,n,i,s=e.length,a=new Array(2*s);for(t=r=0;t<s;)if((n=e[t++])<128)a[r++]=n;else if(4<(i=u[n]))a[r++]=65533,t+=i-1;else{for(n&=2===i?31:3===i?15:7;1<i&&t<s;)n=n<<6|63&e[t++],i--;1<i?a[r++]=65533:n<65536?a[r++]=n:(n-=65536,a[r++]=55296|n>>10&1023,a[r++]=56320|1023&n)}return a.length!==r&&(a.subarray?a=a.subarray(0,r):a.length=r),o.applyFromCharCode(a)}(e=o.transformTo(h.uint8array?"uint8array":"array",e))},o.inherits(a,n),a.prototype.processChunk=function(e){var t=o.transformTo(h.uint8array?"uint8array":"array",e.data);if(this.leftOver&&this.leftOver.length){if(h.uint8array){var r=t;(t=new Uint8Array(r.length+this.leftOver.length)).set(this.leftOver,0),t.set(r,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var n=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}(t),i=t;n!==t.length&&(h.uint8array?(i=t.subarray(0,n),this.leftOver=t.subarray(n,t.length)):(i=t.slice(0,n),this.leftOver=t.slice(n,t.length))),this.push({data:s.utf8decode(i),meta:e.meta})},a.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:s.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},s.Utf8DecodeWorker=a,o.inherits(l,n),l.prototype.processChunk=function(e){this.push({data:s.utf8encode(e.data),meta:e.meta})},s.Utf8EncodeWorker=l},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,a){"use strict";var o=e("./support"),h=e("./base64"),r=e("./nodejsUtils"),u=e("./external");function n(e){return e}function l(e,t){for(var r=0;r<e.length;++r)t[r]=255&e.charCodeAt(r);return t}e("setimmediate"),a.newBlob=function(t,r){a.checkSupport("blob");try{return new Blob([t],{type:r})}catch(e){try{var n=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return n.append(t),n.getBlob(r)}catch(e){throw new Error("Bug : can't construct the Blob.")}}};var i={stringifyByChunk:function(e,t,r){var n=[],i=0,s=e.length;if(s<=r)return String.fromCharCode.apply(null,e);for(;i<s;)"array"===t||"nodebuffer"===t?n.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+r,s)))):n.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+r,s)))),i+=r;return n.join("")},stringifyByChar:function(e){for(var t="",r=0;r<e.length;r++)t+=String.fromCharCode(e[r]);return t},applyCanBeUsed:{uint8array:function(){try{return o.uint8array&&1===String.fromCharCode.apply(null,new Uint8Array(1)).length}catch(e){return!1}}(),nodebuffer:function(){try{return o.nodebuffer&&1===String.fromCharCode.apply(null,r.allocBuffer(1)).length}catch(e){return!1}}()}};function s(e){var t=65536,r=a.getTypeOf(e),n=!0;if("uint8array"===r?n=i.applyCanBeUsed.uint8array:"nodebuffer"===r&&(n=i.applyCanBeUsed.nodebuffer),n)for(;1<t;)try{return i.stringifyByChunk(e,r,t)}catch(e){t=Math.floor(t/2)}return i.stringifyByChar(e)}function f(e,t){for(var r=0;r<e.length;r++)t[r]=e[r];return t}a.applyFromCharCode=s;var c={};c.string={string:n,array:function(e){return l(e,new Array(e.length))},arraybuffer:function(e){return c.string.uint8array(e).buffer},uint8array:function(e){return l(e,new Uint8Array(e.length))},nodebuffer:function(e){return l(e,r.allocBuffer(e.length))}},c.array={string:s,array:n,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(e)}},c.arraybuffer={string:function(e){return s(new Uint8Array(e))},array:function(e){return f(new Uint8Array(e),new Array(e.byteLength))},arraybuffer:n,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return r.newBufferFrom(new Uint8Array(e))}},c.uint8array={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:n,nodebuffer:function(e){return r.newBufferFrom(e)}},c.nodebuffer={string:s,array:function(e){return f(e,new Array(e.length))},arraybuffer:function(e){return c.nodebuffer.uint8array(e).buffer},uint8array:function(e){return f(e,new Uint8Array(e.length))},nodebuffer:n},a.transformTo=function(e,t){if(t=t||"",!e)return t;a.checkSupport(e);var r=a.getTypeOf(t);return c[r][e](t)},a.resolve=function(e){for(var t=e.split("/"),r=[],n=0;n<t.length;n++){var i=t[n];"."===i||""===i&&0!==n&&n!==t.length-1||(".."===i?r.pop():r.push(i))}return r.join("/")},a.getTypeOf=function(e){return"string"==typeof e?"string":"[object Array]"===Object.prototype.toString.call(e)?"array":o.nodebuffer&&r.isBuffer(e)?"nodebuffer":o.uint8array&&e instanceof Uint8Array?"uint8array":o.arraybuffer&&e instanceof ArrayBuffer?"arraybuffer":void 0},a.checkSupport=function(e){if(!o[e.toLowerCase()])throw new Error(e+" is not supported by this platform")},a.MAX_VALUE_16BITS=65535,a.MAX_VALUE_32BITS=-1,a.pretty=function(e){var t,r,n="";for(r=0;r<(e||"").length;r++)n+="\\x"+((t=e.charCodeAt(r))<16?"0":"")+t.toString(16).toUpperCase();return n},a.delay=function(e,t,r){setImmediate(function(){e.apply(r||null,t||[])})},a.inherits=function(e,t){function r(){}r.prototype=t.prototype,e.prototype=new r},a.extend=function(){var e,t,r={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&void 0===r[t]&&(r[t]=arguments[e][t]);return r},a.prepareContent=function(r,e,n,i,s){return u.Promise.resolve(e).then(function(n){return o.blob&&(n instanceof Blob||-1!==["[object File]","[object Blob]"].indexOf(Object.prototype.toString.call(n)))&&"undefined"!=typeof FileReader?new u.Promise(function(t,r){var e=new FileReader;e.onload=function(e){t(e.target.result)},e.onerror=function(e){r(e.target.error)},e.readAsArrayBuffer(n)}):n}).then(function(e){var t=a.getTypeOf(e);return t?("arraybuffer"===t?e=a.transformTo("uint8array",e):"string"===t&&(s?e=h.decode(e):n&&!0!==i&&(e=function(e){return l(e,o.uint8array?new Uint8Array(e.length):new Array(e.length))}(e))),e):u.Promise.reject(new Error("Can't read the data of '"+r+"'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),i=e("./utils"),s=e("./signature"),a=e("./zipEntry"),o=e("./support");function h(e){this.files=[],this.loadOptions=e}h.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw new Error("Corrupted zip or bug: unexpected signature ("+i.pretty(t)+", expected "+i.pretty(e)+")")}},isSignature:function(e,t){var r=this.reader.index;this.reader.setIndex(e);var n=this.reader.readString(4)===t;return this.reader.setIndex(r),n},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=o.uint8array?"uint8array":"array",r=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(r)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,r,n=this.zip64EndOfCentralSize-44;0<n;)e=this.reader.readInt(2),t=this.reader.readInt(4),r=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:r}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw new Error("Multi-volumes zip are not supported")},readLocalFiles:function(){var e,t;for(e=0;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(s.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e=new a({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&0!==this.centralDirRecords&&0===this.files.length)throw new Error("Corrupted zip or bug: expected "+this.centralDirRecords+" records in central dir, got "+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);if(e<0)throw!this.isSignature(0,s.LOCAL_FILE_HEADER)?new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html"):new Error("Corrupted zip: can't find end of central directory");this.reader.setIndex(e);var t=e;if(this.checkSignature(s.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");if(this.reader.setIndex(e),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,s.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var r=this.centralDirOffset+this.centralDirSize;this.zip64&&(r+=20,r+=12+this.zip64EndOfCentralSize);var n=t-r;if(0<n)this.isSignature(t,s.CENTRAL_FILE_HEADER)||(this.reader.zero=n);else if(n<0)throw new Error("Corrupted zip: missing "+Math.abs(n)+" bytes.")},prepareReader:function(e){this.reader=n(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=h},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,r){"use strict";var n=e("./reader/readerFor"),s=e("./utils"),i=e("./compressedObject"),a=e("./crc32"),o=e("./utf8"),h=e("./compressions"),u=e("./support");function l(e,t){this.options=e,this.loadOptions=t}l.prototype={isEncrypted:function(){return 1==(1&this.bitFlag)},useUTF8:function(){return 2048==(2048&this.bitFlag)},readLocalPart:function(e){var t,r;if(e.skip(22),this.fileNameLength=e.readInt(2),r=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(r),-1===this.compressedSize||-1===this.uncompressedSize)throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");if(null===(t=function(e){for(var t in h)if(Object.prototype.hasOwnProperty.call(h,t)&&h[t].magic===e)return h[t];return null}(this.compressionMethod)))throw new Error("Corrupted zip : compression "+s.pretty(this.compressionMethod)+" unknown (inner file : "+s.transformTo("string",this.fileName)+")");this.decompressed=new i(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw new Error("Encrypted zip are not supported");e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),0==e&&(this.dosPermissions=63&this.externalFileAttributes),3==e&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||"/"!==this.fileNameStr.slice(-1)||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=n(this.extraFields[1].value);this.uncompressedSize===s.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===s.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===s.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===s.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,r,n,i=e.index+this.extraFieldsLength;for(this.extraFields||(this.extraFields={});e.index+4<i;)t=e.readInt(2),r=e.readInt(2),n=e.readData(r),this.extraFields[t]={id:t,length:r,value:n};e.setIndex(i)},handleUTF8:function(){var e=u.uint8array?"uint8array":"array";if(this.useUTF8())this.fileNameStr=o.utf8decode(this.fileName),this.fileCommentStr=o.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(null!==t)this.fileNameStr=t;else{var r=s.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(r)}var n=this.findExtraFieldUnicodeComment();if(null!==n)this.fileCommentStr=n;else{var i=s.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(i)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileName)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=n(e.value);return 1!==t.readInt(1)?null:a(this.fileComment)!==t.readInt(4)?null:o.utf8decode(t.readData(e.length-5))}return null}},t.exports=l},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,r){"use strict";function n(e,t,r){this.name=e,this.dir=r.dir,this.date=r.date,this.comment=r.comment,this.unixPermissions=r.unixPermissions,this.dosPermissions=r.dosPermissions,this._data=t,this._dataBinary=r.binary,this.options={compression:r.compression,compressionOptions:r.compressionOptions}}var s=e("./stream/StreamHelper"),i=e("./stream/DataWorker"),a=e("./utf8"),o=e("./compressedObject"),h=e("./stream/GenericWorker");n.prototype={internalStream:function(e){var t=null,r="string";try{if(!e)throw new Error("No output type specified.");var n="string"===(r=e.toLowerCase())||"text"===r;"binarystring"!==r&&"text"!==r||(r="string"),t=this._decompressWorker();var i=!this._dataBinary;i&&!n&&(t=t.pipe(new a.Utf8EncodeWorker)),!i&&n&&(t=t.pipe(new a.Utf8DecodeWorker))}catch(e){(t=new h("error")).error(e)}return new s(t,r,"")},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||"nodebuffer").toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof o&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var r=this._decompressWorker();return this._dataBinary||(r=r.pipe(new a.Utf8EncodeWorker)),o.createWorkerFrom(r,e,t)},_decompressWorker:function(){return this._data instanceof o?this._data.getContentWorker():this._data instanceof h?this._data:new i(this._data)}};for(var u=["asText","asBinary","asNodeBuffer","asUint8Array","asArrayBuffer"],l=function(){throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.")},f=0;f<u.length;f++)n.prototype[u[f]]=l;t.exports=n},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,l,t){(function(t){"use strict";var r,n,e=t.MutationObserver||t.WebKitMutationObserver;if(e){var i=0,s=new e(u),a=t.document.createTextNode("");s.observe(a,{characterData:!0}),r=function(){a.data=i=++i%2}}else if(t.setImmediate||void 0===t.MessageChannel)r="document"in t&&"onreadystatechange"in t.document.createElement("script")?function(){var e=t.document.createElement("script");e.onreadystatechange=function(){u(),e.onreadystatechange=null,e.parentNode.removeChild(e),e=null},t.document.documentElement.appendChild(e)}:function(){setTimeout(u,0)};else{var o=new t.MessageChannel;o.port1.onmessage=u,r=function(){o.port2.postMessage(0)}}var h=[];function u(){var e,t;n=!0;for(var r=h.length;r;){for(t=h,h=[],e=-1;++e<r;)t[e]();r=h.length}n=!1}l.exports=function(e){1!==h.push(e)||n||r()}}).call(this,"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],37:[function(e,t,r){"use strict";var i=e("immediate");function u(){}var l={},s=["REJECTED"],a=["FULFILLED"],n=["PENDING"];function o(e){if("function"!=typeof e)throw new TypeError("resolver must be a function");this.state=n,this.queue=[],this.outcome=void 0,e!==u&&d(this,e)}function h(e,t,r){this.promise=e,"function"==typeof t&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),"function"==typeof r&&(this.onRejected=r,this.callRejected=this.otherCallRejected)}function f(t,r,n){i(function(){var e;try{e=r(n)}catch(e){return l.reject(t,e)}e===t?l.reject(t,new TypeError("Cannot resolve promise with itself")):l.resolve(t,e)})}function c(e){var t=e&&e.then;if(e&&("object"==typeof e||"function"==typeof e)&&"function"==typeof t)return function(){t.apply(e,arguments)}}function d(t,e){var r=!1;function n(e){r||(r=!0,l.reject(t,e))}function i(e){r||(r=!0,l.resolve(t,e))}var s=p(function(){e(i,n)});"error"===s.status&&n(s.value)}function p(e,t){var r={};try{r.value=e(t),r.status="success"}catch(e){r.status="error",r.value=e}return r}(t.exports=o).prototype.finally=function(t){if("function"!=typeof t)return this;var r=this.constructor;return this.then(function(e){return r.resolve(t()).then(function(){return e})},function(e){return r.resolve(t()).then(function(){throw e})})},o.prototype.catch=function(e){return this.then(null,e)},o.prototype.then=function(e,t){if("function"!=typeof e&&this.state===a||"function"!=typeof t&&this.state===s)return this;var r=new this.constructor(u);this.state!==n?f(r,this.state===a?e:t,this.outcome):this.queue.push(new h(r,e,t));return r},h.prototype.callFulfilled=function(e){l.resolve(this.promise,e)},h.prototype.otherCallFulfilled=function(e){f(this.promise,this.onFulfilled,e)},h.prototype.callRejected=function(e){l.reject(this.promise,e)},h.prototype.otherCallRejected=function(e){f(this.promise,this.onRejected,e)},l.resolve=function(e,t){var r=p(c,t);if("error"===r.status)return l.reject(e,r.value);var n=r.value;if(n)d(e,n);else{e.state=a,e.outcome=t;for(var i=-1,s=e.queue.length;++i<s;)e.queue[i].callFulfilled(t)}return e},l.reject=function(e,t){e.state=s,e.outcome=t;for(var r=-1,n=e.queue.length;++r<n;)e.queue[r].callRejected(t);return e},o.resolve=function(e){if(e instanceof this)return e;return l.resolve(new this(u),e)},o.reject=function(e){var t=new this(u);return l.reject(t,e)},o.all=function(e){var r=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var n=e.length,i=!1;if(!n)return this.resolve([]);var s=new Array(n),a=0,t=-1,o=new this(u);for(;++t<n;)h(e[t],t);return o;function h(e,t){r.resolve(e).then(function(e){s[t]=e,++a!==n||i||(i=!0,l.resolve(o,s))},function(e){i||(i=!0,l.reject(o,e))})}},o.race=function(e){var t=this;if("[object Array]"!==Object.prototype.toString.call(e))return this.reject(new TypeError("must be an array"));var r=e.length,n=!1;if(!r)return this.resolve([]);var i=-1,s=new this(u);for(;++i<r;)a=e[i],t.resolve(a).then(function(e){n||(n=!0,l.resolve(s,e))},function(e){n||(n=!0,l.reject(s,e))});var a;return s}},{immediate:36}],38:[function(e,t,r){"use strict";var n={};(0,e("./lib/utils/common").assign)(n,e("./lib/deflate"),e("./lib/inflate"),e("./lib/zlib/constants")),t.exports=n},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,r){"use strict";var a=e("./zlib/deflate"),o=e("./utils/common"),h=e("./utils/strings"),i=e("./zlib/messages"),s=e("./zlib/zstream"),u=Object.prototype.toString,l=0,f=-1,c=0,d=8;function p(e){if(!(this instanceof p))return new p(e);this.options=o.assign({level:f,method:d,chunkSize:16384,windowBits:15,memLevel:8,strategy:c,to:""},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var r=a.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(r!==l)throw new Error(i[r]);if(t.header&&a.deflateSetHeader(this.strm,t.header),t.dictionary){var n;if(n="string"==typeof t.dictionary?h.string2buf(t.dictionary):"[object ArrayBuffer]"===u.call(t.dictionary)?new Uint8Array(t.dictionary):t.dictionary,(r=a.deflateSetDictionary(this.strm,n))!==l)throw new Error(i[r]);this._dict_set=!0}}function n(e,t){var r=new p(t);if(r.push(e,!0),r.err)throw r.msg||i[r.err];return r.result}p.prototype.push=function(e,t){var r,n,i=this.strm,s=this.options.chunkSize;if(this.ended)return!1;n=t===~~t?t:!0===t?4:0,"string"==typeof e?i.input=h.string2buf(e):"[object ArrayBuffer]"===u.call(e)?i.input=new Uint8Array(e):i.input=e,i.next_in=0,i.avail_in=i.input.length;do{if(0===i.avail_out&&(i.output=new o.Buf8(s),i.next_out=0,i.avail_out=s),1!==(r=a.deflate(i,n))&&r!==l)return this.onEnd(r),!(this.ended=!0);0!==i.avail_out&&(0!==i.avail_in||4!==n&&2!==n)||("string"===this.options.to?this.onData(h.buf2binstring(o.shrinkBuf(i.output,i.next_out))):this.onData(o.shrinkBuf(i.output,i.next_out)))}while((0<i.avail_in||0===i.avail_out)&&1!==r);return 4===n?(r=a.deflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===l):2!==n||(this.onEnd(l),!(i.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Deflate=p,r.deflate=n,r.deflateRaw=function(e,t){return(t=t||{}).raw=!0,n(e,t)},r.gzip=function(e,t){return(t=t||{}).gzip=!0,n(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,r){"use strict";var c=e("./zlib/inflate"),d=e("./utils/common"),p=e("./utils/strings"),m=e("./zlib/constants"),n=e("./zlib/messages"),i=e("./zlib/zstream"),s=e("./zlib/gzheader"),_=Object.prototype.toString;function a(e){if(!(this instanceof a))return new a(e);this.options=d.assign({chunkSize:16384,windowBits:0,to:""},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,0===t.windowBits&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&0==(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new i,this.strm.avail_out=0;var r=c.inflateInit2(this.strm,t.windowBits);if(r!==m.Z_OK)throw new Error(n[r]);this.header=new s,c.inflateGetHeader(this.strm,this.header)}function o(e,t){var r=new a(t);if(r.push(e,!0),r.err)throw r.msg||n[r.err];return r.result}a.prototype.push=function(e,t){var r,n,i,s,a,o,h=this.strm,u=this.options.chunkSize,l=this.options.dictionary,f=!1;if(this.ended)return!1;n=t===~~t?t:!0===t?m.Z_FINISH:m.Z_NO_FLUSH,"string"==typeof e?h.input=p.binstring2buf(e):"[object ArrayBuffer]"===_.call(e)?h.input=new Uint8Array(e):h.input=e,h.next_in=0,h.avail_in=h.input.length;do{if(0===h.avail_out&&(h.output=new d.Buf8(u),h.next_out=0,h.avail_out=u),(r=c.inflate(h,m.Z_NO_FLUSH))===m.Z_NEED_DICT&&l&&(o="string"==typeof l?p.string2buf(l):"[object ArrayBuffer]"===_.call(l)?new Uint8Array(l):l,r=c.inflateSetDictionary(this.strm,o)),r===m.Z_BUF_ERROR&&!0===f&&(r=m.Z_OK,f=!1),r!==m.Z_STREAM_END&&r!==m.Z_OK)return this.onEnd(r),!(this.ended=!0);h.next_out&&(0!==h.avail_out&&r!==m.Z_STREAM_END&&(0!==h.avail_in||n!==m.Z_FINISH&&n!==m.Z_SYNC_FLUSH)||("string"===this.options.to?(i=p.utf8border(h.output,h.next_out),s=h.next_out-i,a=p.buf2string(h.output,i),h.next_out=s,h.avail_out=u-s,s&&d.arraySet(h.output,h.output,i,s,0),this.onData(a)):this.onData(d.shrinkBuf(h.output,h.next_out)))),0===h.avail_in&&0===h.avail_out&&(f=!0)}while((0<h.avail_in||0===h.avail_out)&&r!==m.Z_STREAM_END);return r===m.Z_STREAM_END&&(n=m.Z_FINISH),n===m.Z_FINISH?(r=c.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,r===m.Z_OK):n!==m.Z_SYNC_FLUSH||(this.onEnd(m.Z_OK),!(h.avail_out=0))},a.prototype.onData=function(e){this.chunks.push(e)},a.prototype.onEnd=function(e){e===m.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=d.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},r.Inflate=a,r.inflate=o,r.inflateRaw=function(e,t){return(t=t||{}).raw=!0,o(e,t)},r.ungzip=o},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,r){"use strict";var n="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;r.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var r=t.shift();if(r){if("object"!=typeof r)throw new TypeError(r+"must be non-object");for(var n in r)r.hasOwnProperty(n)&&(e[n]=r[n])}}return e},r.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,r,n,i){if(t.subarray&&e.subarray)e.set(t.subarray(r,r+n),i);else for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){var t,r,n,i,s,a;for(t=n=0,r=e.length;t<r;t++)n+=e[t].length;for(a=new Uint8Array(n),t=i=0,r=e.length;t<r;t++)s=e[t],a.set(s,i),i+=s.length;return a}},s={arraySet:function(e,t,r,n,i){for(var s=0;s<n;s++)e[i+s]=t[r+s]},flattenChunks:function(e){return[].concat.apply([],e)}};r.setTyped=function(e){e?(r.Buf8=Uint8Array,r.Buf16=Uint16Array,r.Buf32=Int32Array,r.assign(r,i)):(r.Buf8=Array,r.Buf16=Array,r.Buf32=Array,r.assign(r,s))},r.setTyped(n)},{}],42:[function(e,t,r){"use strict";var h=e("./common"),i=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(e){i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(e){s=!1}for(var u=new h.Buf8(256),n=0;n<256;n++)u[n]=252<=n?6:248<=n?5:240<=n?4:224<=n?3:192<=n?2:1;function l(e,t){if(t<65537&&(e.subarray&&s||!e.subarray&&i))return String.fromCharCode.apply(null,h.shrinkBuf(e,t));for(var r="",n=0;n<t;n++)r+=String.fromCharCode(e[n]);return r}u[254]=u[254]=1,r.string2buf=function(e){var t,r,n,i,s,a=e.length,o=0;for(i=0;i<a;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),o+=r<128?1:r<2048?2:r<65536?3:4;for(t=new h.Buf8(o),i=s=0;s<o;i++)55296==(64512&(r=e.charCodeAt(i)))&&i+1<a&&56320==(64512&(n=e.charCodeAt(i+1)))&&(r=65536+(r-55296<<10)+(n-56320),i++),r<128?t[s++]=r:(r<2048?t[s++]=192|r>>>6:(r<65536?t[s++]=224|r>>>12:(t[s++]=240|r>>>18,t[s++]=128|r>>>12&63),t[s++]=128|r>>>6&63),t[s++]=128|63&r);return t},r.buf2binstring=function(e){return l(e,e.length)},r.binstring2buf=function(e){for(var t=new h.Buf8(e.length),r=0,n=t.length;r<n;r++)t[r]=e.charCodeAt(r);return t},r.buf2string=function(e,t){var r,n,i,s,a=t||e.length,o=new Array(2*a);for(r=n=0;r<a;)if((i=e[r++])<128)o[n++]=i;else if(4<(s=u[i]))o[n++]=65533,r+=s-1;else{for(i&=2===s?31:3===s?15:7;1<s&&r<a;)i=i<<6|63&e[r++],s--;1<s?o[n++]=65533:i<65536?o[n++]=i:(i-=65536,o[n++]=55296|i>>10&1023,o[n++]=56320|1023&i)}return l(o,n)},r.utf8border=function(e,t){var r;for((t=t||e.length)>e.length&&(t=e.length),r=t-1;0<=r&&128==(192&e[r]);)r--;return r<0?t:0===r?t:r+u[e[r]]>t?r:t}},{"./common":41}],43:[function(e,t,r){"use strict";t.exports=function(e,t,r,n){for(var i=65535&e|0,s=e>>>16&65535|0,a=0;0!==r;){for(r-=a=2e3<r?2e3:r;s=s+(i=i+t[n++]|0)|0,--a;);i%=65521,s%=65521}return i|s<<16|0}},{}],44:[function(e,t,r){"use strict";t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,r){"use strict";var o=function(){for(var e,t=[],r=0;r<256;r++){e=r;for(var n=0;n<8;n++)e=1&e?3988292384^e>>>1:e>>>1;t[r]=e}return t}();t.exports=function(e,t,r,n){var i=o,s=n+r;e^=-1;for(var a=n;a<s;a++)e=e>>>8^i[255&(e^t[a])];return-1^e}},{}],46:[function(e,t,r){"use strict";var h,c=e("../utils/common"),u=e("./trees"),d=e("./adler32"),p=e("./crc32"),n=e("./messages"),l=0,f=4,m=0,_=-2,g=-1,b=4,i=2,v=8,y=9,s=286,a=30,o=19,w=2*s+1,k=15,x=3,S=258,z=S+x+1,C=42,E=113,A=1,I=2,O=3,B=4;function R(e,t){return e.msg=n[t],t}function T(e){return(e<<1)-(4<e?9:0)}function D(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,r=t.pending;r>e.avail_out&&(r=e.avail_out),0!==r&&(c.arraySet(e.output,t.pending_buf,t.pending_out,r,e.next_out),e.next_out+=r,t.pending_out+=r,e.total_out+=r,e.avail_out-=r,t.pending-=r,0===t.pending&&(t.pending_out=0))}function N(e,t){u._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function U(e,t){e.pending_buf[e.pending++]=t}function P(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function L(e,t){var r,n,i=e.max_chain_length,s=e.strstart,a=e.prev_length,o=e.nice_match,h=e.strstart>e.w_size-z?e.strstart-(e.w_size-z):0,u=e.window,l=e.w_mask,f=e.prev,c=e.strstart+S,d=u[s+a-1],p=u[s+a];e.prev_length>=e.good_match&&(i>>=2),o>e.lookahead&&(o=e.lookahead);do{if(u[(r=t)+a]===p&&u[r+a-1]===d&&u[r]===u[s]&&u[++r]===u[s+1]){s+=2,r++;do{}while(u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&u[++s]===u[++r]&&s<c);if(n=S-(c-s),s=c-S,a<n){if(e.match_start=t,o<=(a=n))break;d=u[s+a-1],p=u[s+a]}}}while((t=f[t&l])>h&&0!=--i);return a<=e.lookahead?a:e.lookahead}function j(e){var t,r,n,i,s,a,o,h,u,l,f=e.w_size;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=f+(f-z)){for(c.arraySet(e.window,e.window,f,f,0),e.match_start-=f,e.strstart-=f,e.block_start-=f,t=r=e.hash_size;n=e.head[--t],e.head[t]=f<=n?n-f:0,--r;);for(t=r=f;n=e.prev[--t],e.prev[t]=f<=n?n-f:0,--r;);i+=f}if(0===e.strm.avail_in)break;if(a=e.strm,o=e.window,h=e.strstart+e.lookahead,u=i,l=void 0,l=a.avail_in,u<l&&(l=u),r=0===l?0:(a.avail_in-=l,c.arraySet(o,a.input,a.next_in,l,h),1===a.state.wrap?a.adler=d(a.adler,o,l,h):2===a.state.wrap&&(a.adler=p(a.adler,o,l,h)),a.next_in+=l,a.total_in+=l,l),e.lookahead+=r,e.lookahead+e.insert>=x)for(s=e.strstart-e.insert,e.ins_h=e.window[s],e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[s+x-1])&e.hash_mask,e.prev[s&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=s,s++,e.insert--,!(e.lookahead+e.insert<x)););}while(e.lookahead<z&&0!==e.strm.avail_in)}function Z(e,t){for(var r,n;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!==r&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r)),e.match_length>=x)if(n=u._tr_tally(e,e.strstart-e.match_start,e.match_length-x),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=x){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,0!=--e.match_length;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask;else n=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function W(e,t){for(var r,n,i;;){if(e.lookahead<z){if(j(e),e.lookahead<z&&t===l)return A;if(0===e.lookahead)break}if(r=0,e.lookahead>=x&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=x-1,0!==r&&e.prev_length<e.max_lazy_match&&e.strstart-r<=e.w_size-z&&(e.match_length=L(e,r),e.match_length<=5&&(1===e.strategy||e.match_length===x&&4096<e.strstart-e.match_start)&&(e.match_length=x-1)),e.prev_length>=x&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-x,n=u._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-x),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+x-1])&e.hash_mask,r=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),0!=--e.prev_length;);if(e.match_available=0,e.match_length=x-1,e.strstart++,n&&(N(e,!1),0===e.strm.avail_out))return A}else if(e.match_available){if((n=u._tr_tally(e,0,e.window[e.strstart-1]))&&N(e,!1),e.strstart++,e.lookahead--,0===e.strm.avail_out)return A}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=u._tr_tally(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<x-1?e.strstart:x-1,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}function M(e,t,r,n,i){this.good_length=e,this.max_lazy=t,this.nice_length=r,this.max_chain=n,this.func=i}function H(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=v,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new c.Buf16(2*w),this.dyn_dtree=new c.Buf16(2*(2*a+1)),this.bl_tree=new c.Buf16(2*(2*o+1)),D(this.dyn_ltree),D(this.dyn_dtree),D(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new c.Buf16(k+1),this.heap=new c.Buf16(2*s+1),D(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new c.Buf16(2*s+1),D(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function G(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=i,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?C:E,e.adler=2===t.wrap?0:1,t.last_flush=l,u._tr_init(t),m):R(e,_)}function K(e){var t=G(e);return t===m&&function(e){e.window_size=2*e.w_size,D(e.head),e.max_lazy_match=h[e.level].max_lazy,e.good_match=h[e.level].good_length,e.nice_match=h[e.level].nice_length,e.max_chain_length=h[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=x-1,e.match_available=0,e.ins_h=0}(e.state),t}function Y(e,t,r,n,i,s){if(!e)return _;var a=1;if(t===g&&(t=6),n<0?(a=0,n=-n):15<n&&(a=2,n-=16),i<1||y<i||r!==v||n<8||15<n||t<0||9<t||s<0||b<s)return R(e,_);8===n&&(n=9);var o=new H;return(e.state=o).strm=e,o.wrap=a,o.gzhead=null,o.w_bits=n,o.w_size=1<<o.w_bits,o.w_mask=o.w_size-1,o.hash_bits=i+7,o.hash_size=1<<o.hash_bits,o.hash_mask=o.hash_size-1,o.hash_shift=~~((o.hash_bits+x-1)/x),o.window=new c.Buf8(2*o.w_size),o.head=new c.Buf16(o.hash_size),o.prev=new c.Buf16(o.w_size),o.lit_bufsize=1<<i+6,o.pending_buf_size=4*o.lit_bufsize,o.pending_buf=new c.Buf8(o.pending_buf_size),o.d_buf=1*o.lit_bufsize,o.l_buf=3*o.lit_bufsize,o.level=t,o.strategy=s,o.method=r,K(e)}h=[new M(0,0,0,0,function(e,t){var r=65535;for(r>e.pending_buf_size-5&&(r=e.pending_buf_size-5);;){if(e.lookahead<=1){if(j(e),0===e.lookahead&&t===l)return A;if(0===e.lookahead)break}e.strstart+=e.lookahead,e.lookahead=0;var n=e.block_start+r;if((0===e.strstart||e.strstart>=n)&&(e.lookahead=e.strstart-n,e.strstart=n,N(e,!1),0===e.strm.avail_out))return A;if(e.strstart-e.block_start>=e.w_size-z&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):(e.strstart>e.block_start&&(N(e,!1),e.strm.avail_out),A)}),new M(4,4,8,4,Z),new M(4,5,16,8,Z),new M(4,6,32,32,Z),new M(4,4,16,16,W),new M(8,16,32,32,W),new M(8,16,128,128,W),new M(8,32,128,256,W),new M(32,128,258,1024,W),new M(32,258,258,4096,W)],r.deflateInit=function(e,t){return Y(e,t,v,15,8,0)},r.deflateInit2=Y,r.deflateReset=K,r.deflateResetKeep=G,r.deflateSetHeader=function(e,t){return e&&e.state?2!==e.state.wrap?_:(e.state.gzhead=t,m):_},r.deflate=function(e,t){var r,n,i,s;if(!e||!e.state||5<t||t<0)return e?R(e,_):_;if(n=e.state,!e.output||!e.input&&0!==e.avail_in||666===n.status&&t!==f)return R(e,0===e.avail_out?-5:_);if(n.strm=e,r=n.last_flush,n.last_flush=t,n.status===C)if(2===n.wrap)e.adler=0,U(n,31),U(n,139),U(n,8),n.gzhead?(U(n,(n.gzhead.text?1:0)+(n.gzhead.hcrc?2:0)+(n.gzhead.extra?4:0)+(n.gzhead.name?8:0)+(n.gzhead.comment?16:0)),U(n,255&n.gzhead.time),U(n,n.gzhead.time>>8&255),U(n,n.gzhead.time>>16&255),U(n,n.gzhead.time>>24&255),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,255&n.gzhead.os),n.gzhead.extra&&n.gzhead.extra.length&&(U(n,255&n.gzhead.extra.length),U(n,n.gzhead.extra.length>>8&255)),n.gzhead.hcrc&&(e.adler=p(e.adler,n.pending_buf,n.pending,0)),n.gzindex=0,n.status=69):(U(n,0),U(n,0),U(n,0),U(n,0),U(n,0),U(n,9===n.level?2:2<=n.strategy||n.level<2?4:0),U(n,3),n.status=E);else{var a=v+(n.w_bits-8<<4)<<8;a|=(2<=n.strategy||n.level<2?0:n.level<6?1:6===n.level?2:3)<<6,0!==n.strstart&&(a|=32),a+=31-a%31,n.status=E,P(n,a),0!==n.strstart&&(P(n,e.adler>>>16),P(n,65535&e.adler)),e.adler=1}if(69===n.status)if(n.gzhead.extra){for(i=n.pending;n.gzindex<(65535&n.gzhead.extra.length)&&(n.pending!==n.pending_buf_size||(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending!==n.pending_buf_size));)U(n,255&n.gzhead.extra[n.gzindex]),n.gzindex++;n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),n.gzindex===n.gzhead.extra.length&&(n.gzindex=0,n.status=73)}else n.status=73;if(73===n.status)if(n.gzhead.name){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.name.length?255&n.gzhead.name.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.gzindex=0,n.status=91)}else n.status=91;if(91===n.status)if(n.gzhead.comment){i=n.pending;do{if(n.pending===n.pending_buf_size&&(n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),F(e),i=n.pending,n.pending===n.pending_buf_size)){s=1;break}s=n.gzindex<n.gzhead.comment.length?255&n.gzhead.comment.charCodeAt(n.gzindex++):0,U(n,s)}while(0!==s);n.gzhead.hcrc&&n.pending>i&&(e.adler=p(e.adler,n.pending_buf,n.pending-i,i)),0===s&&(n.status=103)}else n.status=103;if(103===n.status&&(n.gzhead.hcrc?(n.pending+2>n.pending_buf_size&&F(e),n.pending+2<=n.pending_buf_size&&(U(n,255&e.adler),U(n,e.adler>>8&255),e.adler=0,n.status=E)):n.status=E),0!==n.pending){if(F(e),0===e.avail_out)return n.last_flush=-1,m}else if(0===e.avail_in&&T(t)<=T(r)&&t!==f)return R(e,-5);if(666===n.status&&0!==e.avail_in)return R(e,-5);if(0!==e.avail_in||0!==n.lookahead||t!==l&&666!==n.status){var o=2===n.strategy?function(e,t){for(var r;;){if(0===e.lookahead&&(j(e),0===e.lookahead)){if(t===l)return A;break}if(e.match_length=0,r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):3===n.strategy?function(e,t){for(var r,n,i,s,a=e.window;;){if(e.lookahead<=S){if(j(e),e.lookahead<=S&&t===l)return A;if(0===e.lookahead)break}if(e.match_length=0,e.lookahead>=x&&0<e.strstart&&(n=a[i=e.strstart-1])===a[++i]&&n===a[++i]&&n===a[++i]){s=e.strstart+S;do{}while(n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&n===a[++i]&&i<s);e.match_length=S-(s-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=x?(r=u._tr_tally(e,1,e.match_length-x),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(r=u._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),r&&(N(e,!1),0===e.strm.avail_out))return A}return e.insert=0,t===f?(N(e,!0),0===e.strm.avail_out?O:B):e.last_lit&&(N(e,!1),0===e.strm.avail_out)?A:I}(n,t):h[n.level].func(n,t);if(o!==O&&o!==B||(n.status=666),o===A||o===O)return 0===e.avail_out&&(n.last_flush=-1),m;if(o===I&&(1===t?u._tr_align(n):5!==t&&(u._tr_stored_block(n,0,0,!1),3===t&&(D(n.head),0===n.lookahead&&(n.strstart=0,n.block_start=0,n.insert=0))),F(e),0===e.avail_out))return n.last_flush=-1,m}return t!==f?m:n.wrap<=0?1:(2===n.wrap?(U(n,255&e.adler),U(n,e.adler>>8&255),U(n,e.adler>>16&255),U(n,e.adler>>24&255),U(n,255&e.total_in),U(n,e.total_in>>8&255),U(n,e.total_in>>16&255),U(n,e.total_in>>24&255)):(P(n,e.adler>>>16),P(n,65535&e.adler)),F(e),0<n.wrap&&(n.wrap=-n.wrap),0!==n.pending?m:1)},r.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==C&&69!==t&&73!==t&&91!==t&&103!==t&&t!==E&&666!==t?R(e,_):(e.state=null,t===E?R(e,-3):m):_},r.deflateSetDictionary=function(e,t){var r,n,i,s,a,o,h,u,l=t.length;if(!e||!e.state)return _;if(2===(s=(r=e.state).wrap)||1===s&&r.status!==C||r.lookahead)return _;for(1===s&&(e.adler=d(e.adler,t,l,0)),r.wrap=0,l>=r.w_size&&(0===s&&(D(r.head),r.strstart=0,r.block_start=0,r.insert=0),u=new c.Buf8(r.w_size),c.arraySet(u,t,l-r.w_size,r.w_size,0),t=u,l=r.w_size),a=e.avail_in,o=e.next_in,h=e.input,e.avail_in=l,e.next_in=0,e.input=t,j(r);r.lookahead>=x;){for(n=r.strstart,i=r.lookahead-(x-1);r.ins_h=(r.ins_h<<r.hash_shift^r.window[n+x-1])&r.hash_mask,r.prev[n&r.w_mask]=r.head[r.ins_h],r.head[r.ins_h]=n,n++,--i;);r.strstart=n,r.lookahead=x-1,j(r)}return r.strstart+=r.lookahead,r.block_start=r.strstart,r.insert=r.lookahead,r.lookahead=0,r.match_length=r.prev_length=x-1,r.match_available=0,e.next_in=o,e.input=h,e.avail_in=a,r.wrap=s,m},r.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,r){"use strict";t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}},{}],48:[function(e,t,r){"use strict";t.exports=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C;r=e.state,n=e.next_in,z=e.input,i=n+(e.avail_in-5),s=e.next_out,C=e.output,a=s-(t-e.avail_out),o=s+(e.avail_out-257),h=r.dmax,u=r.wsize,l=r.whave,f=r.wnext,c=r.window,d=r.hold,p=r.bits,m=r.lencode,_=r.distcode,g=(1<<r.lenbits)-1,b=(1<<r.distbits)-1;e:do{p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=m[d&g];t:for(;;){if(d>>>=y=v>>>24,p-=y,0===(y=v>>>16&255))C[s++]=65535&v;else{if(!(16&y)){if(0==(64&y)){v=m[(65535&v)+(d&(1<<y)-1)];continue t}if(32&y){r.mode=12;break e}e.msg="invalid literal/length code",r.mode=30;break e}w=65535&v,(y&=15)&&(p<y&&(d+=z[n++]<<p,p+=8),w+=d&(1<<y)-1,d>>>=y,p-=y),p<15&&(d+=z[n++]<<p,p+=8,d+=z[n++]<<p,p+=8),v=_[d&b];r:for(;;){if(d>>>=y=v>>>24,p-=y,!(16&(y=v>>>16&255))){if(0==(64&y)){v=_[(65535&v)+(d&(1<<y)-1)];continue r}e.msg="invalid distance code",r.mode=30;break e}if(k=65535&v,p<(y&=15)&&(d+=z[n++]<<p,(p+=8)<y&&(d+=z[n++]<<p,p+=8)),h<(k+=d&(1<<y)-1)){e.msg="invalid distance too far back",r.mode=30;break e}if(d>>>=y,p-=y,(y=s-a)<k){if(l<(y=k-y)&&r.sane){e.msg="invalid distance too far back",r.mode=30;break e}if(S=c,(x=0)===f){if(x+=u-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}}else if(f<y){if(x+=u+f-y,(y-=f)<w){for(w-=y;C[s++]=c[x++],--y;);if(x=0,f<w){for(w-=y=f;C[s++]=c[x++],--y;);x=s-k,S=C}}}else if(x+=f-y,y<w){for(w-=y;C[s++]=c[x++],--y;);x=s-k,S=C}for(;2<w;)C[s++]=S[x++],C[s++]=S[x++],C[s++]=S[x++],w-=3;w&&(C[s++]=S[x++],1<w&&(C[s++]=S[x++]))}else{for(x=s-k;C[s++]=C[x++],C[s++]=C[x++],C[s++]=C[x++],2<(w-=3););w&&(C[s++]=C[x++],1<w&&(C[s++]=C[x++]))}break}}break}}while(n<i&&s<o);n-=w=p>>3,d&=(1<<(p-=w<<3))-1,e.next_in=n,e.next_out=s,e.avail_in=n<i?i-n+5:5-(n-i),e.avail_out=s<o?o-s+257:257-(s-o),r.hold=d,r.bits=p}},{}],49:[function(e,t,r){"use strict";var I=e("../utils/common"),O=e("./adler32"),B=e("./crc32"),R=e("./inffast"),T=e("./inftrees"),D=1,F=2,N=0,U=-2,P=1,n=852,i=592;function L(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function s(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new I.Buf16(320),this.work=new I.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function a(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg="",t.wrap&&(e.adler=1&t.wrap),t.mode=P,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new I.Buf32(n),t.distcode=t.distdyn=new I.Buf32(i),t.sane=1,t.back=-1,N):U}function o(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,a(e)):U}function h(e,t){var r,n;return e&&e.state?(n=e.state,t<0?(r=0,t=-t):(r=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?U:(null!==n.window&&n.wbits!==t&&(n.window=null),n.wrap=r,n.wbits=t,o(e))):U}function u(e,t){var r,n;return e?(n=new s,(e.state=n).window=null,(r=h(e,t))!==N&&(e.state=null),r):U}var l,f,c=!0;function j(e){if(c){var t;for(l=new I.Buf32(512),f=new I.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(T(D,e.lens,0,288,l,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;T(F,e.lens,0,32,f,0,e.work,{bits:5}),c=!1}e.lencode=l,e.lenbits=9,e.distcode=f,e.distbits=5}function Z(e,t,r,n){var i,s=e.state;return null===s.window&&(s.wsize=1<<s.wbits,s.wnext=0,s.whave=0,s.window=new I.Buf8(s.wsize)),n>=s.wsize?(I.arraySet(s.window,t,r-s.wsize,s.wsize,0),s.wnext=0,s.whave=s.wsize):(n<(i=s.wsize-s.wnext)&&(i=n),I.arraySet(s.window,t,r-n,i,s.wnext),(n-=i)?(I.arraySet(s.window,t,r-n,n,0),s.wnext=n,s.whave=s.wsize):(s.wnext+=i,s.wnext===s.wsize&&(s.wnext=0),s.whave<s.wsize&&(s.whave+=i))),0}r.inflateReset=o,r.inflateReset2=h,r.inflateResetKeep=a,r.inflateInit=function(e){return u(e,15)},r.inflateInit2=u,r.inflate=function(e,t){var r,n,i,s,a,o,h,u,l,f,c,d,p,m,_,g,b,v,y,w,k,x,S,z,C=0,E=new I.Buf8(4),A=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&0!==e.avail_in)return U;12===(r=e.state).mode&&(r.mode=13),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,f=o,c=h,x=N;e:for(;;)switch(r.mode){case P:if(0===r.wrap){r.mode=13;break}for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(2&r.wrap&&35615===u){E[r.check=0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0),l=u=0,r.mode=2;break}if(r.flags=0,r.head&&(r.head.done=!1),!(1&r.wrap)||(((255&u)<<8)+(u>>8))%31){e.msg="incorrect header check",r.mode=30;break}if(8!=(15&u)){e.msg="unknown compression method",r.mode=30;break}if(l-=4,k=8+(15&(u>>>=4)),0===r.wbits)r.wbits=k;else if(k>r.wbits){e.msg="invalid window size",r.mode=30;break}r.dmax=1<<k,e.adler=r.check=1,r.mode=512&u?10:12,l=u=0;break;case 2:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.flags=u,8!=(255&r.flags)){e.msg="unknown compression method",r.mode=30;break}if(57344&r.flags){e.msg="unknown header flags set",r.mode=30;break}r.head&&(r.head.text=u>>8&1),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=3;case 3:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.time=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,E[2]=u>>>16&255,E[3]=u>>>24&255,r.check=B(r.check,E,4,0)),l=u=0,r.mode=4;case 4:for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.head&&(r.head.xflags=255&u,r.head.os=u>>8),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0,r.mode=5;case 5:if(1024&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length=u,r.head&&(r.head.extra_len=u),512&r.flags&&(E[0]=255&u,E[1]=u>>>8&255,r.check=B(r.check,E,2,0)),l=u=0}else r.head&&(r.head.extra=null);r.mode=6;case 6:if(1024&r.flags&&(o<(d=r.length)&&(d=o),d&&(r.head&&(k=r.head.extra_len-r.length,r.head.extra||(r.head.extra=new Array(r.head.extra_len)),I.arraySet(r.head.extra,n,s,d,k)),512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,r.length-=d),r.length))break e;r.length=0,r.mode=7;case 7:if(2048&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.name+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.name=null);r.length=0,r.mode=8;case 8:if(4096&r.flags){if(0===o)break e;for(d=0;k=n[s+d++],r.head&&k&&r.length<65536&&(r.head.comment+=String.fromCharCode(k)),k&&d<o;);if(512&r.flags&&(r.check=B(r.check,n,d,s)),o-=d,s+=d,k)break e}else r.head&&(r.head.comment=null);r.mode=9;case 9:if(512&r.flags){for(;l<16;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(65535&r.check)){e.msg="header crc mismatch",r.mode=30;break}l=u=0}r.head&&(r.head.hcrc=r.flags>>9&1,r.head.done=!0),e.adler=r.check=0,r.mode=12;break;case 10:for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}e.adler=r.check=L(u),l=u=0,r.mode=11;case 11:if(0===r.havedict)return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,2;e.adler=r.check=1,r.mode=12;case 12:if(5===t||6===t)break e;case 13:if(r.last){u>>>=7&l,l-=7&l,r.mode=27;break}for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}switch(r.last=1&u,l-=1,3&(u>>>=1)){case 0:r.mode=14;break;case 1:if(j(r),r.mode=20,6!==t)break;u>>>=2,l-=2;break e;case 2:r.mode=17;break;case 3:e.msg="invalid block type",r.mode=30}u>>>=2,l-=2;break;case 14:for(u>>>=7&l,l-=7&l;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if((65535&u)!=(u>>>16^65535)){e.msg="invalid stored block lengths",r.mode=30;break}if(r.length=65535&u,l=u=0,r.mode=15,6===t)break e;case 15:r.mode=16;case 16:if(d=r.length){if(o<d&&(d=o),h<d&&(d=h),0===d)break e;I.arraySet(i,n,s,d,a),o-=d,s+=d,h-=d,a+=d,r.length-=d;break}r.mode=12;break;case 17:for(;l<14;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(r.nlen=257+(31&u),u>>>=5,l-=5,r.ndist=1+(31&u),u>>>=5,l-=5,r.ncode=4+(15&u),u>>>=4,l-=4,286<r.nlen||30<r.ndist){e.msg="too many length or distance symbols",r.mode=30;break}r.have=0,r.mode=18;case 18:for(;r.have<r.ncode;){for(;l<3;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.lens[A[r.have++]]=7&u,u>>>=3,l-=3}for(;r.have<19;)r.lens[A[r.have++]]=0;if(r.lencode=r.lendyn,r.lenbits=7,S={bits:r.lenbits},x=T(0,r.lens,0,19,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid code lengths set",r.mode=30;break}r.have=0,r.mode=19;case 19:for(;r.have<r.nlen+r.ndist;){for(;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(b<16)u>>>=_,l-=_,r.lens[r.have++]=b;else{if(16===b){for(z=_+2;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u>>>=_,l-=_,0===r.have){e.msg="invalid bit length repeat",r.mode=30;break}k=r.lens[r.have-1],d=3+(3&u),u>>>=2,l-=2}else if(17===b){for(z=_+3;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=3+(7&(u>>>=_)),u>>>=3,l-=3}else{for(z=_+7;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}l-=_,k=0,d=11+(127&(u>>>=_)),u>>>=7,l-=7}if(r.have+d>r.nlen+r.ndist){e.msg="invalid bit length repeat",r.mode=30;break}for(;d--;)r.lens[r.have++]=k}}if(30===r.mode)break;if(0===r.lens[256]){e.msg="invalid code -- missing end-of-block",r.mode=30;break}if(r.lenbits=9,S={bits:r.lenbits},x=T(D,r.lens,0,r.nlen,r.lencode,0,r.work,S),r.lenbits=S.bits,x){e.msg="invalid literal/lengths set",r.mode=30;break}if(r.distbits=6,r.distcode=r.distdyn,S={bits:r.distbits},x=T(F,r.lens,r.nlen,r.ndist,r.distcode,0,r.work,S),r.distbits=S.bits,x){e.msg="invalid distances set",r.mode=30;break}if(r.mode=20,6===t)break e;case 20:r.mode=21;case 21:if(6<=o&&258<=h){e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,R(e,c),a=e.next_out,i=e.output,h=e.avail_out,s=e.next_in,n=e.input,o=e.avail_in,u=r.hold,l=r.bits,12===r.mode&&(r.back=-1);break}for(r.back=0;g=(C=r.lencode[u&(1<<r.lenbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(g&&0==(240&g)){for(v=_,y=g,w=b;g=(C=r.lencode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,r.length=b,0===g){r.mode=26;break}if(32&g){r.back=-1,r.mode=12;break}if(64&g){e.msg="invalid literal/length code",r.mode=30;break}r.extra=15&g,r.mode=22;case 22:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.length+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}r.was=r.length,r.mode=23;case 23:for(;g=(C=r.distcode[u&(1<<r.distbits)-1])>>>16&255,b=65535&C,!((_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(0==(240&g)){for(v=_,y=g,w=b;g=(C=r.distcode[w+((u&(1<<v+y)-1)>>v)])>>>16&255,b=65535&C,!(v+(_=C>>>24)<=l);){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}u>>>=v,l-=v,r.back+=v}if(u>>>=_,l-=_,r.back+=_,64&g){e.msg="invalid distance code",r.mode=30;break}r.offset=b,r.extra=15&g,r.mode=24;case 24:if(r.extra){for(z=r.extra;l<z;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}r.offset+=u&(1<<r.extra)-1,u>>>=r.extra,l-=r.extra,r.back+=r.extra}if(r.offset>r.dmax){e.msg="invalid distance too far back",r.mode=30;break}r.mode=25;case 25:if(0===h)break e;if(d=c-h,r.offset>d){if((d=r.offset-d)>r.whave&&r.sane){e.msg="invalid distance too far back",r.mode=30;break}p=d>r.wnext?(d-=r.wnext,r.wsize-d):r.wnext-d,d>r.length&&(d=r.length),m=r.window}else m=i,p=a-r.offset,d=r.length;for(h<d&&(d=h),h-=d,r.length-=d;i[a++]=m[p++],--d;);0===r.length&&(r.mode=21);break;case 26:if(0===h)break e;i[a++]=r.length,h--,r.mode=21;break;case 27:if(r.wrap){for(;l<32;){if(0===o)break e;o--,u|=n[s++]<<l,l+=8}if(c-=h,e.total_out+=c,r.total+=c,c&&(e.adler=r.check=r.flags?B(r.check,i,c,a-c):O(r.check,i,c,a-c)),c=h,(r.flags?u:L(u))!==r.check){e.msg="incorrect data check",r.mode=30;break}l=u=0}r.mode=28;case 28:if(r.wrap&&r.flags){for(;l<32;){if(0===o)break e;o--,u+=n[s++]<<l,l+=8}if(u!==(4294967295&r.total)){e.msg="incorrect length check",r.mode=30;break}l=u=0}r.mode=29;case 29:x=1;break e;case 30:x=-3;break e;case 31:return-4;case 32:default:return U}return e.next_out=a,e.avail_out=h,e.next_in=s,e.avail_in=o,r.hold=u,r.bits=l,(r.wsize||c!==e.avail_out&&r.mode<30&&(r.mode<27||4!==t))&&Z(e,e.output,e.next_out,c-e.avail_out)?(r.mode=31,-4):(f-=e.avail_in,c-=e.avail_out,e.total_in+=f,e.total_out+=c,r.total+=c,r.wrap&&c&&(e.adler=r.check=r.flags?B(r.check,i,c,e.next_out-c):O(r.check,i,c,e.next_out-c)),e.data_type=r.bits+(r.last?64:0)+(12===r.mode?128:0)+(20===r.mode||15===r.mode?256:0),(0==f&&0===c||4===t)&&x===N&&(x=-5),x)},r.inflateEnd=function(e){if(!e||!e.state)return U;var t=e.state;return t.window&&(t.window=null),e.state=null,N},r.inflateGetHeader=function(e,t){var r;return e&&e.state?0==(2&(r=e.state).wrap)?U:((r.head=t).done=!1,N):U},r.inflateSetDictionary=function(e,t){var r,n=t.length;return e&&e.state?0!==(r=e.state).wrap&&11!==r.mode?U:11===r.mode&&O(1,t,n,0)!==r.check?-3:Z(e,t,n,n)?(r.mode=31,-4):(r.havedict=1,N):U},r.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,r){"use strict";var D=e("../utils/common"),F=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],N=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],U=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],P=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,r,n,i,s,a,o){var h,u,l,f,c,d,p,m,_,g=o.bits,b=0,v=0,y=0,w=0,k=0,x=0,S=0,z=0,C=0,E=0,A=null,I=0,O=new D.Buf16(16),B=new D.Buf16(16),R=null,T=0;for(b=0;b<=15;b++)O[b]=0;for(v=0;v<n;v++)O[t[r+v]]++;for(k=g,w=15;1<=w&&0===O[w];w--);if(w<k&&(k=w),0===w)return i[s++]=20971520,i[s++]=20971520,o.bits=1,0;for(y=1;y<w&&0===O[y];y++);for(k<y&&(k=y),b=z=1;b<=15;b++)if(z<<=1,(z-=O[b])<0)return-1;if(0<z&&(0===e||1!==w))return-1;for(B[1]=0,b=1;b<15;b++)B[b+1]=B[b]+O[b];for(v=0;v<n;v++)0!==t[r+v]&&(a[B[t[r+v]]++]=v);if(d=0===e?(A=R=a,19):1===e?(A=F,I-=257,R=N,T-=257,256):(A=U,R=P,-1),b=y,c=s,S=v=E=0,l=-1,f=(C=1<<(x=k))-1,1===e&&852<C||2===e&&592<C)return 1;for(;;){for(p=b-S,_=a[v]<d?(m=0,a[v]):a[v]>d?(m=R[T+a[v]],A[I+a[v]]):(m=96,0),h=1<<b-S,y=u=1<<x;i[c+(E>>S)+(u-=h)]=p<<24|m<<16|_|0,0!==u;);for(h=1<<b-1;E&h;)h>>=1;if(0!==h?(E&=h-1,E+=h):E=0,v++,0==--O[b]){if(b===w)break;b=t[r+a[v]]}if(k<b&&(E&f)!==l){for(0===S&&(S=k),c+=y,z=1<<(x=b-S);x+S<w&&!((z-=O[x+S])<=0);)x++,z<<=1;if(C+=1<<x,1===e&&852<C||2===e&&592<C)return 1;i[l=E&f]=k<<24|x<<16|c-s|0}}return 0!==E&&(i[c+E]=b-S<<24|64<<16|0),o.bits=k,0}},{"../utils/common":41}],51:[function(e,t,r){"use strict";t.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],52:[function(e,t,r){"use strict";var i=e("../utils/common"),o=0,h=1;function n(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,a=29,u=256,l=u+1+a,f=30,c=19,_=2*l+1,g=15,d=16,p=7,m=256,b=16,v=17,y=18,w=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],k=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],x=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],S=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],z=new Array(2*(l+2));n(z);var C=new Array(2*f);n(C);var E=new Array(512);n(E);var A=new Array(256);n(A);var I=new Array(a);n(I);var O,B,R,T=new Array(f);function D(e,t,r,n,i){this.static_tree=e,this.extra_bits=t,this.extra_base=r,this.elems=n,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function N(e){return e<256?E[e]:E[256+(e>>>7)]}function U(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function P(e,t,r){e.bi_valid>d-r?(e.bi_buf|=t<<e.bi_valid&65535,U(e,e.bi_buf),e.bi_buf=t>>d-e.bi_valid,e.bi_valid+=r-d):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=r)}function L(e,t,r){P(e,r[2*t],r[2*t+1])}function j(e,t){for(var r=0;r|=1&e,e>>>=1,r<<=1,0<--t;);return r>>>1}function Z(e,t,r){var n,i,s=new Array(g+1),a=0;for(n=1;n<=g;n++)s[n]=a=a+r[n-1]<<1;for(i=0;i<=t;i++){var o=e[2*i+1];0!==o&&(e[2*i]=j(s[o]++,o))}}function W(e){var t;for(t=0;t<l;t++)e.dyn_ltree[2*t]=0;for(t=0;t<f;t++)e.dyn_dtree[2*t]=0;for(t=0;t<c;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*m]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function M(e){8<e.bi_valid?U(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function H(e,t,r,n){var i=2*t,s=2*r;return e[i]<e[s]||e[i]===e[s]&&n[t]<=n[r]}function G(e,t,r){for(var n=e.heap[r],i=r<<1;i<=e.heap_len&&(i<e.heap_len&&H(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!H(t,n,e.heap[i],e.depth));)e.heap[r]=e.heap[i],r=i,i<<=1;e.heap[r]=n}function K(e,t,r){var n,i,s,a,o=0;if(0!==e.last_lit)for(;n=e.pending_buf[e.d_buf+2*o]<<8|e.pending_buf[e.d_buf+2*o+1],i=e.pending_buf[e.l_buf+o],o++,0===n?L(e,i,t):(L(e,(s=A[i])+u+1,t),0!==(a=w[s])&&P(e,i-=I[s],a),L(e,s=N(--n),r),0!==(a=k[s])&&P(e,n-=T[s],a)),o<e.last_lit;);L(e,m,t)}function Y(e,t){var r,n,i,s=t.dyn_tree,a=t.stat_desc.static_tree,o=t.stat_desc.has_stree,h=t.stat_desc.elems,u=-1;for(e.heap_len=0,e.heap_max=_,r=0;r<h;r++)0!==s[2*r]?(e.heap[++e.heap_len]=u=r,e.depth[r]=0):s[2*r+1]=0;for(;e.heap_len<2;)s[2*(i=e.heap[++e.heap_len]=u<2?++u:0)]=1,e.depth[i]=0,e.opt_len--,o&&(e.static_len-=a[2*i+1]);for(t.max_code=u,r=e.heap_len>>1;1<=r;r--)G(e,s,r);for(i=h;r=e.heap[1],e.heap[1]=e.heap[e.heap_len--],G(e,s,1),n=e.heap[1],e.heap[--e.heap_max]=r,e.heap[--e.heap_max]=n,s[2*i]=s[2*r]+s[2*n],e.depth[i]=(e.depth[r]>=e.depth[n]?e.depth[r]:e.depth[n])+1,s[2*r+1]=s[2*n+1]=i,e.heap[1]=i++,G(e,s,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var r,n,i,s,a,o,h=t.dyn_tree,u=t.max_code,l=t.stat_desc.static_tree,f=t.stat_desc.has_stree,c=t.stat_desc.extra_bits,d=t.stat_desc.extra_base,p=t.stat_desc.max_length,m=0;for(s=0;s<=g;s++)e.bl_count[s]=0;for(h[2*e.heap[e.heap_max]+1]=0,r=e.heap_max+1;r<_;r++)p<(s=h[2*h[2*(n=e.heap[r])+1]+1]+1)&&(s=p,m++),h[2*n+1]=s,u<n||(e.bl_count[s]++,a=0,d<=n&&(a=c[n-d]),o=h[2*n],e.opt_len+=o*(s+a),f&&(e.static_len+=o*(l[2*n+1]+a)));if(0!==m){do{for(s=p-1;0===e.bl_count[s];)s--;e.bl_count[s]--,e.bl_count[s+1]+=2,e.bl_count[p]--,m-=2}while(0<m);for(s=p;0!==s;s--)for(n=e.bl_count[s];0!==n;)u<(i=e.heap[--r])||(h[2*i+1]!==s&&(e.opt_len+=(s-h[2*i+1])*h[2*i],h[2*i+1]=s),n--)}}(e,t),Z(s,u,e.bl_count)}function X(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),t[2*(r+1)+1]=65535,n=0;n<=r;n++)i=a,a=t[2*(n+1)+1],++o<h&&i===a||(o<u?e.bl_tree[2*i]+=o:0!==i?(i!==s&&e.bl_tree[2*i]++,e.bl_tree[2*b]++):o<=10?e.bl_tree[2*v]++:e.bl_tree[2*y]++,s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4))}function V(e,t,r){var n,i,s=-1,a=t[1],o=0,h=7,u=4;for(0===a&&(h=138,u=3),n=0;n<=r;n++)if(i=a,a=t[2*(n+1)+1],!(++o<h&&i===a)){if(o<u)for(;L(e,i,e.bl_tree),0!=--o;);else 0!==i?(i!==s&&(L(e,i,e.bl_tree),o--),L(e,b,e.bl_tree),P(e,o-3,2)):o<=10?(L(e,v,e.bl_tree),P(e,o-3,3)):(L(e,y,e.bl_tree),P(e,o-11,7));s=i,u=(o=0)===a?(h=138,3):i===a?(h=6,3):(h=7,4)}}n(T);var q=!1;function J(e,t,r,n){P(e,(s<<1)+(n?1:0),3),function(e,t,r,n){M(e),n&&(U(e,r),U(e,~r)),i.arraySet(e.pending_buf,e.window,t,r,e.pending),e.pending+=r}(e,t,r,!0)}r._tr_init=function(e){q||(function(){var e,t,r,n,i,s=new Array(g+1);for(n=r=0;n<a-1;n++)for(I[n]=r,e=0;e<1<<w[n];e++)A[r++]=n;for(A[r-1]=n,n=i=0;n<16;n++)for(T[n]=i,e=0;e<1<<k[n];e++)E[i++]=n;for(i>>=7;n<f;n++)for(T[n]=i<<7,e=0;e<1<<k[n]-7;e++)E[256+i++]=n;for(t=0;t<=g;t++)s[t]=0;for(e=0;e<=143;)z[2*e+1]=8,e++,s[8]++;for(;e<=255;)z[2*e+1]=9,e++,s[9]++;for(;e<=279;)z[2*e+1]=7,e++,s[7]++;for(;e<=287;)z[2*e+1]=8,e++,s[8]++;for(Z(z,l+1,s),e=0;e<f;e++)C[2*e+1]=5,C[2*e]=j(e,5);O=new D(z,w,u+1,l,g),B=new D(C,k,0,f,g),R=new D(new Array(0),x,0,c,p)}(),q=!0),e.l_desc=new F(e.dyn_ltree,O),e.d_desc=new F(e.dyn_dtree,B),e.bl_desc=new F(e.bl_tree,R),e.bi_buf=0,e.bi_valid=0,W(e)},r._tr_stored_block=J,r._tr_flush_block=function(e,t,r,n){var i,s,a=0;0<e.level?(2===e.strm.data_type&&(e.strm.data_type=function(e){var t,r=4093624447;for(t=0;t<=31;t++,r>>>=1)if(1&r&&0!==e.dyn_ltree[2*t])return o;if(0!==e.dyn_ltree[18]||0!==e.dyn_ltree[20]||0!==e.dyn_ltree[26])return h;for(t=32;t<u;t++)if(0!==e.dyn_ltree[2*t])return h;return o}(e)),Y(e,e.l_desc),Y(e,e.d_desc),a=function(e){var t;for(X(e,e.dyn_ltree,e.l_desc.max_code),X(e,e.dyn_dtree,e.d_desc.max_code),Y(e,e.bl_desc),t=c-1;3<=t&&0===e.bl_tree[2*S[t]+1];t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),i=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=i&&(i=s)):i=s=r+5,r+4<=i&&-1!==t?J(e,t,r,n):4===e.strategy||s===i?(P(e,2+(n?1:0),3),K(e,z,C)):(P(e,4+(n?1:0),3),function(e,t,r,n){var i;for(P(e,t-257,5),P(e,r-1,5),P(e,n-4,4),i=0;i<n;i++)P(e,e.bl_tree[2*S[i]+1],3);V(e,e.dyn_ltree,t-1),V(e,e.dyn_dtree,r-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,a+1),K(e,e.dyn_ltree,e.dyn_dtree)),W(e),n&&M(e)},r._tr_tally=function(e,t,r){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&r,e.last_lit++,0===t?e.dyn_ltree[2*r]++:(e.matches++,t--,e.dyn_ltree[2*(A[r]+u+1)]++,e.dyn_dtree[2*N(t)]++),e.last_lit===e.lit_bufsize-1},r._tr_align=function(e){P(e,2,3),L(e,m,z),function(e){16===e.bi_valid?(U(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,r){"use strict";t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,r){(function(e){!function(r,n){"use strict";if(!r.setImmediate){var i,s,t,a,o=1,h={},u=!1,l=r.document,e=Object.getPrototypeOf&&Object.getPrototypeOf(r);e=e&&e.setTimeout?e:r,i="[object process]"==={}.toString.call(r.process)?function(e){process.nextTick(function(){c(e)})}:function(){if(r.postMessage&&!r.importScripts){var e=!0,t=r.onmessage;return r.onmessage=function(){e=!1},r.postMessage("","*"),r.onmessage=t,e}}()?(a="setImmediate$"+Math.random()+"$",r.addEventListener?r.addEventListener("message",d,!1):r.attachEvent("onmessage",d),function(e){r.postMessage(a+e,"*")}):r.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){c(e.data)},function(e){t.port2.postMessage(e)}):l&&"onreadystatechange"in l.createElement("script")?(s=l.documentElement,function(e){var t=l.createElement("script");t.onreadystatechange=function(){c(e),t.onreadystatechange=null,s.removeChild(t),t=null},s.appendChild(t)}):function(e){setTimeout(c,0,e)},e.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];var n={callback:e,args:t};return h[o]=n,i(o),o++},e.clearImmediate=f}function f(e){delete h[e]}function c(e){if(u)setTimeout(c,0,e);else{var t=h[e];if(t){u=!0;try{!function(e){var t=e.callback,r=e.args;switch(r.length){case 0:t();break;case 1:t(r[0]);break;case 2:t(r[0],r[1]);break;case 3:t(r[0],r[1],r[2]);break;default:t.apply(n,r)}}(t)}finally{f(e),u=!1}}}}function d(e){e.source===r&&"string"==typeof e.data&&0===e.data.indexOf(a)&&c(+e.data.slice(a.length))}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,"undefined"!=typeof __webpack_require__.g?__webpack_require__.g:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[10])(10)});

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!*******************!*\
  !*** ./js/app.js ***!
  \*******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _EventBus_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./EventBus.js */ "./js/EventBus.js");
/* harmony import */ var _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/ImageDocument.js */ "./js/model/ImageDocument.js");
/* harmony import */ var _model_Brush_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./model/Brush.js */ "./js/model/Brush.js");
/* harmony import */ var _constants_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./constants.js */ "./js/constants.js");
/* harmony import */ var _ui_CanvasView_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ui/CanvasView.js */ "./js/ui/CanvasView.js");
/* harmony import */ var _ui_Toolbar_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ui/Toolbar.js */ "./js/ui/Toolbar.js");
/* harmony import */ var _ui_ColorSelector_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./ui/ColorSelector.js */ "./js/ui/ColorSelector.js");
/* harmony import */ var _ui_PalettePanel_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./ui/PalettePanel.js */ "./js/ui/PalettePanel.js");
/* harmony import */ var _ui_LayersPanel_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./ui/LayersPanel.js */ "./js/ui/LayersPanel.js");
/* harmony import */ var _ui_TabBar_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./ui/TabBar.js */ "./js/ui/TabBar.js");
/* harmony import */ var _ui_FramePanel_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./ui/FramePanel.js */ "./js/ui/FramePanel.js");
/* harmony import */ var _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./ui/Dialog.js */ "./js/ui/Dialog.js");
/* harmony import */ var _ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./ui/dialogHelpers.js */ "./js/ui/dialogHelpers.js");
/* harmony import */ var _history_UndoManager_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./history/UndoManager.js */ "./js/history/UndoManager.js");
/* harmony import */ var _tools_BrushTool_js__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./tools/BrushTool.js */ "./js/tools/BrushTool.js");
/* harmony import */ var _tools_RectTool_js__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./tools/RectTool.js */ "./js/tools/RectTool.js");
/* harmony import */ var _tools_FilledRectTool_js__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./tools/FilledRectTool.js */ "./js/tools/FilledRectTool.js");
/* harmony import */ var _tools_EllipseTool_js__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./tools/EllipseTool.js */ "./js/tools/EllipseTool.js");
/* harmony import */ var _tools_FilledEllipseTool_js__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./tools/FilledEllipseTool.js */ "./js/tools/FilledEllipseTool.js");
/* harmony import */ var _tools_FillTool_js__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./tools/FillTool.js */ "./js/tools/FillTool.js");
/* harmony import */ var _tools_RectSelector_js__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./tools/RectSelector.js */ "./js/tools/RectSelector.js");
/* harmony import */ var _tools_EllipseSelector_js__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./tools/EllipseSelector.js */ "./js/tools/EllipseSelector.js");
/* harmony import */ var _tools_FreeTransformTool_js__WEBPACK_IMPORTED_MODULE_22__ = __webpack_require__(/*! ./tools/FreeTransformTool.js */ "./js/tools/FreeTransformTool.js");
/* harmony import */ var _tools_EraserTool_js__WEBPACK_IMPORTED_MODULE_23__ = __webpack_require__(/*! ./tools/EraserTool.js */ "./js/tools/EraserTool.js");
/* harmony import */ var _tools_ColorPickerTool_js__WEBPACK_IMPORTED_MODULE_24__ = __webpack_require__(/*! ./tools/ColorPickerTool.js */ "./js/tools/ColorPickerTool.js");
/* harmony import */ var _tools_MoveTool_js__WEBPACK_IMPORTED_MODULE_25__ = __webpack_require__(/*! ./tools/MoveTool.js */ "./js/tools/MoveTool.js");
/* harmony import */ var _tools_MirrorTool_js__WEBPACK_IMPORTED_MODULE_26__ = __webpack_require__(/*! ./tools/MirrorTool.js */ "./js/tools/MirrorTool.js");
/* harmony import */ var _tools_TextTool_js__WEBPACK_IMPORTED_MODULE_27__ = __webpack_require__(/*! ./tools/TextTool.js */ "./js/tools/TextTool.js");
/* harmony import */ var _ui_MenuManager_js__WEBPACK_IMPORTED_MODULE_28__ = __webpack_require__(/*! ./ui/MenuManager.js */ "./js/ui/MenuManager.js");
/* harmony import */ var _KeyboardManager_js__WEBPACK_IMPORTED_MODULE_29__ = __webpack_require__(/*! ./KeyboardManager.js */ "./js/KeyboardManager.js");
/* harmony import */ var _FileManager_js__WEBPACK_IMPORTED_MODULE_30__ = __webpack_require__(/*! ./FileManager.js */ "./js/FileManager.js");
/* harmony import */ var _ImageOperations_js__WEBPACK_IMPORTED_MODULE_31__ = __webpack_require__(/*! ./ImageOperations.js */ "./js/ImageOperations.js");
































// Mixin modules — methods mixed into App.prototype below





class App {
    constructor() {
        this.bus = new _EventBus_js__WEBPACK_IMPORTED_MODULE_0__.EventBus();
        this.doc = null;
        this.canvasView = null;
        this.toolbar = null;
        this.undoManager = null;
        this.tabBar = null;
        this._tabs = [];
        this._activeTabId = null;
        this._nextTabId = 1;

        this._init(_constants_js__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_DOC_WIDTH, _constants_js__WEBPACK_IMPORTED_MODULE_3__.DEFAULT_DOC_HEIGHT);

        // Warn before closing/refreshing (browser only)
        if (!window.electronAPI) {
            window.addEventListener('beforeunload', (e) => {
                e.preventDefault();
            });
        }
    }

    _showNewDocDialog() {
        const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_11__["default"].create({
            title: 'New Document',
            width: '300px',
            buttons: [
                { label: 'Create', primary: true, onClick: () => {
                    const w = Math.max(1, Math.min(1024, parseInt(wInput.value) || 64));
                    const h = Math.max(1, Math.min(1024, parseInt(hInput.value) || 64));
                    dlg.close();
                    this._init(w, h);
                }},
            ],
            enterButton: 0,
        });

        dlg.body.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:8px 0;';
        dlg.body.innerHTML = `
            <div>
                <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Width (px)</label>
                <input id="new-doc-w" type="number" value="64" min="1" max="1024" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__.INPUT_STYLE}">
            </div>
            <div>
                <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Height (px)</label>
                <input id="new-doc-h" type="number" value="64" min="1" max="1024" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__.INPUT_STYLE}">
            </div>
            <div style="display:flex;gap:8px;">
                <button class="preset-btn" data-w="32" data-h="32" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">32x32</button>
                <button class="preset-btn" data-w="64" data-h="64" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">64x64</button>
                <button class="preset-btn" data-w="128" data-h="128" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">128x128</button>
                <button class="preset-btn" data-w="256" data-h="256" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">256x256</button>
            </div>
        `;

        const wInput = dlg.body.querySelector('#new-doc-w');
        const hInput = dlg.body.querySelector('#new-doc-h');

        for (const btn of dlg.body.querySelectorAll('.preset-btn')) {
            btn.addEventListener('click', () => {
                wInput.value = btn.dataset.w;
                hInput.value = btn.dataset.h;
            });
        }

        dlg.show(wInput);
    }

    _init(width, height) {
        this.doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_1__.ImageDocument(width, height);
        this.undoManager = new _history_UndoManager_js__WEBPACK_IMPORTED_MODULE_13__.UndoManager(this.doc, this.bus);
        this._clipboard = null; // { data, mask, width, height }

        // Canvas view
        this.canvasView = new _ui_CanvasView_js__WEBPACK_IMPORTED_MODULE_4__.CanvasView(this.doc, this.bus);

        // Tools (stored for doc reference updates on tab switch)
        this._tools = [
            new _tools_MoveTool_js__WEBPACK_IMPORTED_MODULE_25__.MoveTool(this.doc, this.bus, this.canvasView),
            new _tools_BrushTool_js__WEBPACK_IMPORTED_MODULE_14__.BrushTool(this.doc, this.bus, this.canvasView),
            new _tools_EraserTool_js__WEBPACK_IMPORTED_MODULE_23__.EraserTool(this.doc, this.bus, this.canvasView),
            new _tools_ColorPickerTool_js__WEBPACK_IMPORTED_MODULE_24__.ColorPickerTool(this.doc, this.bus, this.canvasView),
            new _tools_RectTool_js__WEBPACK_IMPORTED_MODULE_15__.RectTool(this.doc, this.bus, this.canvasView),
            new _tools_FilledRectTool_js__WEBPACK_IMPORTED_MODULE_16__.FilledRectTool(this.doc, this.bus, this.canvasView),
            new _tools_EllipseTool_js__WEBPACK_IMPORTED_MODULE_17__.EllipseTool(this.doc, this.bus, this.canvasView),
            new _tools_FilledEllipseTool_js__WEBPACK_IMPORTED_MODULE_18__.FilledEllipseTool(this.doc, this.bus, this.canvasView),
            new _tools_FillTool_js__WEBPACK_IMPORTED_MODULE_19__.FillTool(this.doc, this.bus, this.canvasView),
            new _tools_RectSelector_js__WEBPACK_IMPORTED_MODULE_20__.RectSelector(this.doc, this.bus, this.canvasView),
            new _tools_EllipseSelector_js__WEBPACK_IMPORTED_MODULE_21__.EllipseSelector(this.doc, this.bus, this.canvasView),
            new _tools_FreeTransformTool_js__WEBPACK_IMPORTED_MODULE_22__.FreeTransformTool(this.doc, this.bus, this.canvasView),
            new _tools_MirrorTool_js__WEBPACK_IMPORTED_MODULE_26__.MirrorTool(this.doc, this.bus, this.canvasView),
            new _tools_TextTool_js__WEBPACK_IMPORTED_MODULE_27__.TextTool(this.doc, this.bus, this.canvasView),
        ];

        this._freeTransformTool = this._tools.find(t => t.name === 'Free Transform');

        // Toolbar
        this.toolbar = new _ui_Toolbar_js__WEBPACK_IMPORTED_MODULE_5__.Toolbar(this._tools, this.bus, this.doc);

        // Wire active tool to canvas view (must be before setActiveTool)
        this.bus.on('tool-changed', (tool) => {
            this._finishToolSwitch(tool);
        });

        this.toolbar.setActiveTool('Brush');

        // UI panels
        this.colorSelector = new _ui_ColorSelector_js__WEBPACK_IMPORTED_MODULE_6__.ColorSelector(this.doc, this.bus);
        this.palettePanel = new _ui_PalettePanel_js__WEBPACK_IMPORTED_MODULE_7__.PalettePanel(this.doc, this.bus, this.undoManager);
        this.layersPanel = new _ui_LayersPanel_js__WEBPACK_IMPORTED_MODULE_8__.LayersPanel(this.doc, this.bus, this.undoManager);
        this.framePanel = new _ui_FramePanel_js__WEBPACK_IMPORTED_MODULE_10__.FramePanel(this.doc, this.bus, this.undoManager);

        // FG/BG color picker via palette editor
        this.bus.on('open-palette-picker', (target) => {
            const initialIdx = target === 'fg' ? this.doc.fgColorIndex : this.doc.bgColorIndex;
            this.palettePanel._openDialog((colorIndex) => {
                if (target === 'fg') {
                    this.doc.fgColorIndex = colorIndex;
                    this.bus.emit('fg-color-changed');
                } else {
                    this.doc.bgColorIndex = colorIndex;
                    this.bus.emit('bg-color-changed');
                }
            }, initialIdx);
        });

        // Undo integration: wrap tool pointer events
        this._wrapUndoIntoCanvasView();

        // Status bar updates
        this.bus.on('cursor-move', (pos) => {
            document.getElementById('status-pos').textContent = `${pos.x}, ${pos.y}`;
        });
        this.bus.on('zoom-changed', (zoom) => {
            document.getElementById('status-zoom').textContent = `${zoom * 100}%`;
        });
        document.getElementById('status-size').textContent = `${width} x ${height}`;
        document.getElementById('status-zoom').textContent = `${this.canvasView.zoom * 100}%`;

        // Re-render on palette/layer changes
        this.bus.on('palette-changed', () => this.canvasView.render());
        this.bus.on('layer-changed', () => this.canvasView.render());
        this.bus.on('active-layer-changed', () => this.canvasView.render());
        this.bus.on('space-tap', () => {
            if (this.doc.animationEnabled) this.framePanel.togglePlayTag();
        });
        this.bus.on('document-changed', () => this.canvasView.render());

        // Live size readout while dragging a resize handle (mask is still the
        // pre-drag selection, so getBounds() would lie — use the preview size).
        this.bus.on('selection-preview-size', ({ w, h }) => {
            const el = document.getElementById('status-selsize');
            if (!el) return;
            el.textContent = `W: ${w} H: ${h}`;
            el.style.display = '';
        });

        // Selection events
        this.bus.on('selection-changed', () => {
            const sel = this.doc.selection;
            this.canvasView.invalidateSelectionEdges();
            const ftActive = this._freeTransformTool && this._freeTransformTool.isTransformActive;
            if (sel.active && !ftActive) {
                this.canvasView.startMarchingAnts();
            } else {
                this.canvasView.stopMarchingAnts();
            }
            this._updateSelectionStatus();
            this.canvasView.render();
        });

        // Text tool dialog
        this.bus.on('show-toast', (msg) => this._showToast(msg));
        this.bus.on('open-text-dialog', (opts) => this._showTextDialog(opts));

        // Keyboard shortcuts
        this._setupKeyboardShortcuts(this._tools);

        // Menu bar
        this._setupMenuBar();

        // Tab bar
        this.tabBar = new _ui_TabBar_js__WEBPACK_IMPORTED_MODULE_9__.TabBar(this.bus);
        this.bus.on('tab-switch', (id) => this._switchTab(id));
        this.bus.on('tab-close', (id) => this._closeTab(id));
        this.bus.on('tab-rename', ({ id, name }) => {
            const tab = this._tabs.find(t => t.id === id);
            if (tab) { tab.name = name; this._renderTabs(); }
        });

        // Create first tab
        this._createTab('Untitled');

        // Mouse wheel on number inputs
        document.addEventListener('wheel', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'number') {
                e.preventDefault();
                const input = e.target;
                const step = parseFloat(input.step) || 1;
                const min = input.min !== '' ? parseFloat(input.min) : -Infinity;
                const max = input.max !== '' ? parseFloat(input.max) : Infinity;
                const val = parseFloat(input.value) || 0;
                const delta = e.deltaY < 0 ? step : -step;
                input.value = Math.max(min, Math.min(max, val + delta));
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, { passive: false });
    }

    // ── Tab Management ──────────────────────────────────────────────

    _createTab(name) {
        const tab = {
            id: this._nextTabId++,
            name,
            doc: this.doc,
            undoStack: this.undoManager.undoStack,
            redoStack: this.undoManager.redoStack,
            zoomIndex: this.canvasView.zoomIndex,
            zoom: this.canvasView.zoom,
            panX: this.canvasView.panX,
            panY: this.canvasView.panY,
        };
        this._tabs.push(tab);
        this._activeTabId = tab.id;
        this._renderTabs();
        return tab;
    }

    _updateSelectionStatus() {
        const el = document.getElementById('status-selsize');
        if (!el) return;
        const bounds = this.doc.selection.active ? this.doc.selection.getBounds() : null;
        if (bounds) {
            const w = bounds.maxX - bounds.minX + 1;
            const h = bounds.maxY - bounds.minY + 1;
            el.textContent = `W: ${w} H: ${h}`;
            el.style.display = '';
        } else {
            el.textContent = '';
            el.style.display = 'none';
        }
    }

    _saveTabState() {
        const tab = this._tabs.find(t => t.id === this._activeTabId);
        if (!tab) return;
        this._endNudge();
        tab.doc = this.doc;
        tab.undoStack = this.undoManager.undoStack;
        tab.redoStack = this.undoManager.redoStack;
        tab.zoomIndex = this.canvasView.zoomIndex;
        tab.zoom = this.canvasView.zoom;
        tab.panX = this.canvasView.panX;
        tab.panY = this.canvasView.panY;
    }

    _loadTabState(tab) {
        // Replace document instance on all components
        this.doc = tab.doc;
        this._setDocOnComponents(tab.doc);

        this.undoManager.undoStack = tab.undoStack;
        this.undoManager.redoStack = tab.redoStack;

        // Restore view state
        this.canvasView.zoomIndex = tab.zoomIndex;
        this.canvasView.zoom = tab.zoom;
        this.canvasView.panX = tab.panX;
        this.canvasView.panY = tab.panY;

        // Recreate offscreen canvas and renderer
        this.canvasView.offscreen.width = tab.doc.width;
        this.canvasView.offscreen.height = tab.doc.height;
        this.canvasView.renderer = new (this.canvasView.renderer.constructor)(this.doc);

        document.getElementById('status-size').textContent = `${tab.doc.width} x ${tab.doc.height}`;
        document.getElementById('status-zoom').textContent = `${tab.zoom * 100}%`;
        this._updateSelectionStatus();

        // Frame panel visibility
        if (tab.doc.animationEnabled) {
            this.framePanel.show();
        } else {
            this.framePanel.hide();
        }

        // Refresh all UI
        this.canvasView.stopMarchingAnts();
        this.bus.emit('palette-changed');
        this.bus.emit('fg-color-changed');
        this.bus.emit('bg-color-changed');
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
        this.bus.emit('selection-changed');
    }

    _setDocOnComponents(doc) {
        this.canvasView.doc = doc;
        this.undoManager.doc = doc;
        this.colorSelector.doc = doc;
        this.palettePanel.doc = doc;
        this.layersPanel.doc = doc;
        this.toolbar.doc = doc;
        this.framePanel.doc = doc;
        for (const tool of this._tools) {
            tool.doc = doc;
        }
    }

    _switchTab(id) {
        if (id === this._activeTabId) return;
        this._saveTabState();
        this._activeTabId = id;
        const tab = this._tabs.find(t => t.id === id);
        if (tab) this._loadTabState(tab);
        this._renderTabs();
    }

    _closeTab(id) {
        if (this._tabs.length <= 1) return;
        const tab = this._tabs.find(t => t.id === id);
        if (!confirm(`Close "${tab ? tab.name : 'tab'}"?`)) return;
        const idx = this._tabs.findIndex(t => t.id === id);
        if (idx < 0) return;
        this._tabs.splice(idx, 1);
        if (id === this._activeTabId) {
            const newIdx = Math.min(idx, this._tabs.length - 1);
            this._activeTabId = this._tabs[newIdx].id;
            this._loadTabState(this._tabs[newIdx]);
        }
        this._renderTabs();
    }

    _getActiveTab() {
        return this._tabs.find(t => t.id === this._activeTabId);
    }

    _renderTabs() {
        this.tabBar.render(this._tabs, this._activeTabId);
    }

    _newDocument() {
        const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_11__["default"].create({
            title: 'New Document',
            width: '300px',
            buttons: [
                { label: 'Cancel' },
                { label: 'Create', primary: true, onClick: () => {
                    const w = Math.max(1, Math.min(1024, parseInt(wInput.value) || 64));
                    const h = Math.max(1, Math.min(1024, parseInt(hInput.value) || 64));
                    dlg.close();
                    this._saveTabState();
                    this.doc = new _model_ImageDocument_js__WEBPACK_IMPORTED_MODULE_1__.ImageDocument(w, h);
                    this._setDocOnComponents(this.doc);
                    this.undoManager.undoStack = [];
                    this.undoManager.redoStack = [];
                    this._clipboard = null;
                    this.canvasView.offscreen.width = w;
                    this.canvasView.offscreen.height = h;
                    this.canvasView.renderer = new (this.canvasView.renderer.constructor)(this.doc);
                    this.canvasView._centerDocument();
                    this.framePanel.hide();
                    this._createTab(nameInput.value.trim() || 'Untitled');
                    this.bus.emit('palette-changed');
                    this.bus.emit('fg-color-changed');
                    this.bus.emit('bg-color-changed');
                    this.bus.emit('layer-changed');
                    this.bus.emit('document-changed');
                    document.getElementById('status-size').textContent = `${w} x ${h}`;
                }},
            ],
            enterButton: 1,
        });

        dlg.body.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:8px 0;';
        dlg.body.innerHTML = `
            <div>
                <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Name</label>
                <input id="new-tab-name" type="text" value="Untitled" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__.INPUT_STYLE}">
            </div>
            <div>
                <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Width (px)</label>
                <input id="new-tab-w" type="number" value="64" min="1" max="1024" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__.INPUT_STYLE}">
            </div>
            <div>
                <label style="display:block;font-size:12px;margin-bottom:4px;color:var(--text-dim);">Height (px)</label>
                <input id="new-tab-h" type="number" value="64" min="1" max="1024" style="${_ui_dialogHelpers_js__WEBPACK_IMPORTED_MODULE_12__.INPUT_STYLE}">
            </div>
            <div style="display:flex;gap:8px;">
                <button class="preset-btn" data-w="32" data-h="32" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">32x32</button>
                <button class="preset-btn" data-w="64" data-h="64" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">64x64</button>
                <button class="preset-btn" data-w="128" data-h="128" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">128x128</button>
                <button class="preset-btn" data-w="256" data-h="256" style="flex:1;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);cursor:pointer;">256x256</button>
            </div>
        `;

        const nameInput = dlg.body.querySelector('#new-tab-name');
        const wInput = dlg.body.querySelector('#new-tab-w');
        const hInput = dlg.body.querySelector('#new-tab-h');

        for (const btn of dlg.body.querySelectorAll('.preset-btn')) {
            btn.addEventListener('click', () => {
                wInput.value = btn.dataset.w;
                hInput.value = btn.dataset.h;
            });
        }

        dlg.show(nameInput);
    }

    // ── Tool Hints ──────────────────────────────────────────────────

    _showStatus(msg) {
        this._showToast(msg);
    }

    _showToast(msg, duration = 1500) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.remove('toast-visible');
        void el.offsetHeight; // force reflow to restart transition
        el.classList.add('toast-visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            el.classList.remove('toast-visible');
        }, duration);
    }

    _getToolHint(name) {
        const hints = {
            'Move':            'Drag to move layer',
            'Brush':           'Draw with brush  |  Right-click: BG color  |  Shift: line mode  |  Ctrl: snap angle',
            'Eraser':          'Erase to transparent  |  Shift: line mode  |  Ctrl: snap angle',
            'Fill':            'Click to flood fill  |  Right-click: BG color',
            'Color Picker':    'Click to pick FG color  |  Right-click: BG color',
            'Rectangle':       'Drag to draw rect  |  Shift: square',
            'Filled Rect':     'Drag to draw filled rect  |  Shift: square',
            'Ellipse':         'Drag to draw ellipse  |  Shift: circle',
            'Filled Ellipse':  'Drag to draw filled ellipse  |  Shift: circle',
            'Rect Select':     'Drag to select  |  Ctrl: add  |  Alt: subtract  |  Shift: square',
            'Ellipse Select':  'Drag to select  |  Ctrl: add  |  Alt: subtract  |  Shift: circle',
            'Free Transform':  'Move, resize, or rotate selection  |  Enter: apply  |  Escape: cancel  |  Ctrl: snap angle',
            'Mirror':          'Click to flip horizontal  |  Shift: flip vertical',
            'Text':            'Click to add text  |  Click text layer to edit',
        };
        return hints[name] || '';
    }

    _finishToolSwitch(tool) {
        const ft = this._freeTransformTool;
        this._endNudge();
        this.canvasView.activeTool = tool;
        document.getElementById('status-tool').textContent = tool.name;
        document.getElementById('status-hint').textContent = this._getToolHint(tool.name);
        if (tool.activate && tool !== ft) {
            tool.activate();
        }
        if (tool === ft && !ft.isTransformActive) {
            const sel = this.doc.selection;
            if (!sel.active) {
                this._showToast('No selection');
                const fallback = this._lastNonTransformTool || 'Rect Select';
                this.toolbar.setActiveTool(fallback);
                return;
            }
            const prev = this._lastNonTransformTool || 'Rect Select';
            ft.activate(prev, this.undoManager);
            this.toolbar.setLocked(true);
        }
        if (tool !== ft) {
            this.toolbar.setLocked(false);
            this._lastNonTransformTool = tool.name;
        }
    }

    _wrapUndoIntoCanvasView() {
        const cv = this.canvasView;
        const origDown = cv._onPointerDown;
        const origUp = cv._onPointerUp;

        // The event listeners in CanvasView use arrow functions that call
        // this._onPointerDown(e) — so replacing the method on the instance works.
        cv._onPointerDown = (e) => {
            const isFreeTransform = cv._activeTool && cv._activeTool.isTransformActive;
            if (e.button === 0 && !cv._spaceDown && cv._activeTool && !isFreeTransform) {
                this._endNudge();
                this.undoManager.beginOperation();
            }
            origDown.call(cv, e);
        };

        cv._onPointerUp = (e) => {
            origUp.call(cv, e);
            const isFreeTransform = cv._activeTool && cv._activeTool.isTransformActive;
            if (!isFreeTransform) {
                this.undoManager.endOperation();
            }
        };
    }

    // Menu, keyboard, file I/O, and image operation methods are mixed in
    // from separate modules — see Object.assign at the bottom of this file.

    _toggleAnimation() {
        if (this.doc.animationEnabled) {
            if (!confirm('Disable animation? Only frame 1 data will be kept.')) return;
            this.doc.disableAnimation();
            this.framePanel.hide();
        } else {
            this.doc.enableAnimation();
            this.framePanel.show();
        }
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
        this.bus.emit('animation-changed');
    }

    _snapshotLayerMeta() {
        return {
            activeIndex: this.doc.activeLayerIndex,
            selected: new Set(this.doc.selectedLayerIndices),
            frames: this.doc.animationEnabled ? this.doc.frames.map(f => ({
                ...f,
                layerData: f.layerData ? f.layerData.map(ld => ({
                    ...ld,
                    data: ld.data.slice(),
                })) : null,
            })) : null,
        };
    }

    _pushLayerAddEntry(layer, insertIndex, before, after) {
        this.undoManager.pushEntry({
            type: 'layer-add',
            insertIndex,
            layer,
            beforeActiveIndex: before.activeIndex,
            afterActiveIndex: after.activeIndex,
            beforeSelected: before.selected,
            afterSelected: after.selected,
            beforeFrames: before.frames,
            afterFrames: after.frames,
        });
    }

    // ── Clipboard Operations ────────────────────────────────────────

    _copy() {
        const sel = this.doc.selection;
        if (!sel.active) return;
        const copied = sel.copyPixels(this.doc.getActiveLayer());
        if (copied) {
            if (copied.data.every(v => v === _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT)) {
                this._showStatus('No content to copy');
                return;
            }
            copied.sourcePalette = this.doc.palette.export();
            this._clipboard = copied;
        }
    }

    _copyMerged() {
        const sel = this.doc.selection;
        if (!sel.active) return;
        const copied = sel.copyPixelsMerged(this.doc.layers);
        if (copied) {
            copied.sourcePalette = this.doc.palette.export();
            this._clipboard = copied;
        }
    }

    _cut() {
        const sel = this.doc.selection;
        if (!sel.active) return;
        this.undoManager.beginOperation();
        const copied = sel.copyPixels(this.doc.getActiveLayer());
        if (copied) {
            copied.sourcePalette = this.doc.palette.export();
            this._clipboard = copied;
        }
        if (!sel.hasFloating()) {
            sel.liftPixels(this.doc.getActiveLayer());
        }
        sel.clear();
        this.undoManager.endOperation();
        this.bus.emit('selection-changed');
        this.bus.emit('layer-changed');
    }

    _pasteAsLayer(originX, originY) {
        if (!this._clipboard) return;
        const cb = this._clipboard;

        // Remap palette indices if pasting from a different palette
        const data = new Uint16Array(cb.data);
        if (cb.sourcePalette) {
            const dstPalette = this.doc.palette.export();
            const remap = new Uint16Array(256);
            for (let i = 0; i < 256; i++) {
                const [sr, sg, sb] = cb.sourcePalette[i];
                let bestDist = Infinity, bestJ = 0;
                for (let j = 0; j < 256; j++) {
                    const [dr, dg, db] = dstPalette[j];
                    const dist = (sr - dr) ** 2 + (sg - dg) ** 2 + (sb - db) ** 2;
                    if (dist < bestDist) { bestDist = dist; bestJ = j; }
                    if (dist === 0) break;
                }
                remap[i] = bestJ;
            }
            for (let i = 0; i < data.length; i++) {
                if (data[i] !== _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT) {
                    data[i] = remap[data[i]];
                }
            }
        }

        // Save current frame before modifying layers
        const before = this._snapshotLayerMeta();
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        const newLayer = this.doc.addLayer('Pasted');
        newLayer.width = cb.width;
        newLayer.height = cb.height;
        newLayer.data = new Uint16Array(cb.width * cb.height);
        newLayer.data.set(data);
        newLayer.offsetX = originX;
        newLayer.offsetY = originY;
        // Update current frame with the pasted content
        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
        const after = this._snapshotLayerMeta();
        this._pushLayerAddEntry(newLayer, this.doc.activeLayerIndex, before, after);
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }

    _paste() {
        if (!this._clipboard) return;
        const cb = this._clipboard;
        const ox = Math.round((this.doc.width - cb.width) / 2);
        const oy = Math.round((this.doc.height - cb.height) / 2);
        this._pasteAsLayer(ox, oy);
    }

    _pasteInPlace() {
        if (!this._clipboard) return;
        this._pasteAsLayer(this._clipboard.originX, this._clipboard.originY);
    }

    async _pasteFromClipboard() {
        try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                const imageType = item.types.find(t => t.startsWith('image/'));
                if (!imageType) continue;
                const blob = await item.getType(imageType);
                const bitmap = await createImageBitmap(blob);
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(bitmap, 0, 0);
                const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
                bitmap.close();

                this._showPasteDitherDialog(imageData.data, canvas.width, canvas.height, (indices, w, h) => {
                    // Create a new layer with the pasted data
                    const before = this._snapshotLayerMeta();
                    if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
                    const newLayer = this.doc.addLayer('Pasted');
                    newLayer.width = w;
                    newLayer.height = h;
                    newLayer.data = new Uint16Array(w * h);
                    newLayer.data.set(indices);
                    newLayer.offsetX = Math.round((this.doc.width - w) / 2);
                    newLayer.offsetY = Math.round((this.doc.height - h) / 2);
                    if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
                    const after = this._snapshotLayerMeta();
                    this._pushLayerAddEntry(newLayer, this.doc.activeLayerIndex, before, after);
                    this.bus.emit('layer-changed');
                    this.bus.emit('document-changed');
                });
                return;
            }
        } catch (e) {
            // Clipboard API not available or denied
        }
    }

    _clearSelection() {
        const sel = this.doc.selection;
        if (!sel.active) {
            this._showToast('No selection');
            return;
        }
        this.undoManager.beginOperation();
        if (sel.hasFloating()) {
            sel.clear();
            this.bus.emit('selection-changed');
        } else {
            const layer = this.doc.getActiveLayer();
            for (let y = 0; y < sel.height; y++) {
                for (let x = 0; x < sel.width; x++) {
                    if (!sel.mask[y * sel.width + x]) continue;
                    const lx = x - layer.offsetX;
                    const ly = y - layer.offsetY;
                    if (lx >= 0 && lx < layer.width && ly >= 0 && ly < layer.height) {
                        layer.setPixel(lx, ly, _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT);
                    }
                }
            }
        }
        this.undoManager.endOperation();
        this.bus.emit('layer-changed');
    }

    _setBrushFromSelection() {
        const sel = this.doc.selection;
        if (!sel.active) {
            this._showToast('No selection');
            return;
        }
        const copied = sel.copyPixels(this.doc.getActiveLayer());
        if (!copied) return;

        const brush = new _model_Brush_js__WEBPACK_IMPORTED_MODULE_2__.Brush(copied.width, copied.height, copied.data, true);
        // Find center of the mask for origin
        let cx = 0, cy = 0, count = 0;
        for (let y = 0; y < copied.height; y++) {
            for (let x = 0; x < copied.width; x++) {
                if (copied.mask[y * copied.width + x]) {
                    cx += x; cy += y; count++;
                }
            }
        }
        brush.originX = Math.round(cx / count);
        brush.originY = Math.round(cy / count);

        // Mark unselected pixels as TRANSPARENT in brush data
        for (let i = 0; i < copied.width * copied.height; i++) {
            if (!copied.mask[i]) brush.data[i] = _constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT;
        }

        this.doc.activeBrush = brush;
        this.bus.emit('brush-changed');
        this.bus.emit('switch-tool', 'Brush');
    }

    _showTextDialog(opts) {
        const existing = opts.isNew ? null : opts.layer.textData;
        let selectedColorIndex = existing ? existing.colorIndex : this.doc.fgColorIndex;

        const dlg = _ui_Dialog_js__WEBPACK_IMPORTED_MODULE_11__["default"].create({
            title: opts.isNew ? 'Add Text' : 'Edit Text',
            width: '320px',
            buttons: [
                { label: 'Cancel' },
                { label: 'OK', primary: true, onClick: () => {
                    const text = textarea.value;
                    if (!text.trim()) { dlg.close(); return; }
                    const textData = {
                        text,
                        fontFamily: fontSelect.value,
                        fontSize: Math.max(4, Math.min(128, parseInt(sizeInput.value) || 16)),
                        bold: boldCheck.checked,
                        italic: italicCheck.checked,
                        underline: underlineCheck.checked,
                        antialiased: aaCheck.checked,
                        colorIndex: selectedColorIndex,
                    };
                    if (opts.isNew) {
                        const before = this._snapshotLayerMeta();
                        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
                        const layer = this.doc.addLayer('Text: ' + text.split('\n')[0].substring(0, 20));
                        layer.type = 'text';
                        layer.textData = { ...textData };
                        layer.offsetX = opts.x || 0;
                        layer.offsetY = opts.y || 0;
                        if (this.doc.animationEnabled) this.doc.saveCurrentFrame();
                        const after = this._snapshotLayerMeta();
                        this._pushLayerAddEntry(layer, this.doc.activeLayerIndex, before, after);
                    } else {
                        opts.layer.textData = textData;
                        opts.layer.name = 'Text: ' + text.split('\n')[0].substring(0, 20);
                    }
                    dlg.close();
                    this.bus.emit('layer-changed');
                    this.bus.emit('document-changed');
                }},
            ],
        });

        const body = dlg.body;

        // Text input
        const textarea = document.createElement('textarea');
        textarea.value = existing ? existing.text : '';
        textarea.placeholder = 'Enter text...';
        textarea.style.cssText = 'width:100%;height:80px;resize:vertical;background:var(--bg-input);border:1px solid var(--border);border-radius:3px;color:var(--text);padding:6px;font-size:13px;font-family:monospace;box-sizing:border-box;margin-bottom:8px;';
        body.appendChild(textarea);

        const row = (label, el) => {
            const r = document.createElement('div');
            r.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px;';
            const l = document.createElement('label');
            l.textContent = label;
            l.style.width = '70px';
            r.appendChild(l);
            r.appendChild(el);
            body.appendChild(r);
            return r;
        };

        // Font family
        const fontSelect = document.createElement('select');
        fontSelect.style.cssText = 'flex:1;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;color:var(--text);padding:3px;font-size:12px;';
        for (const f of ['monospace', 'sans-serif', 'serif', 'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana']) {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.style.fontFamily = f;
            if (existing && existing.fontFamily === f) opt.selected = true;
            fontSelect.appendChild(opt);
        }
        row('Font:', fontSelect);

        // Font size
        const sizeInput = document.createElement('input');
        sizeInput.type = 'number';
        sizeInput.min = 4;
        sizeInput.max = 128;
        sizeInput.value = existing ? existing.fontSize : 16;
        sizeInput.style.cssText = 'width:60px;background:var(--bg-input);border:1px solid var(--border);border-radius:2px;color:var(--text);padding:3px;font-size:12px;text-align:center;';
        row('Size:', sizeInput);

        // Style checkboxes
        const styleRow = document.createElement('div');
        styleRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:6px;font-size:12px;';
        const makeCheck = (label, checked) => {
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex;align-items:center;gap:4px;cursor:pointer;';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = checked;
            cb.style.accentColor = 'var(--accent)';
            lbl.appendChild(cb);
            lbl.appendChild(document.createTextNode(label));
            styleRow.appendChild(lbl);
            return cb;
        };
        const boldCheck = makeCheck('Bold', existing ? existing.bold : false);
        const italicCheck = makeCheck('Italic', existing ? existing.italic : false);
        const underlineCheck = makeCheck('Underline', existing ? existing.underline : false);
        const aaCheck = makeCheck('Anti-aliased', existing ? existing.antialiased !== false : true);
        body.appendChild(styleRow);

        // Color picker
        const colorRow = document.createElement('div');
        colorRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;position:relative;';
        const colorLabel = document.createElement('label');
        colorLabel.textContent = 'Color:';
        colorLabel.style.width = '70px';
        const colorSwatch = document.createElement('div');
        const colorText = document.createElement('span');
        colorText.style.color = 'var(--text-dim)';
        const updateSwatch = () => {
            const [r, g, b] = this.doc.palette.getColor(selectedColorIndex);
            colorSwatch.style.background = `rgb(${r},${g},${b})`;
            colorText.textContent = `Index: ${selectedColorIndex}`;
        };
        colorSwatch.style.cssText = 'width:24px;height:24px;border:1px solid var(--border);cursor:pointer;';

        const openColorPopup = () => {
            const popup = document.createElement('div');
            popup.style.cssText = 'position:fixed;z-index:1100;display:grid;grid-template-columns:repeat(16,14px);gap:1px;padding:6px;background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
            for (let i = 0; i < 256; i++) {
                const sw = document.createElement('div');
                const [r, g, b] = this.doc.palette.getColor(i);
                sw.style.cssText = `width:14px;height:14px;background:rgb(${r},${g},${b});cursor:pointer;border:1px solid var(--border);box-sizing:border-box;`;
                sw.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedColorIndex = i;
                    updateSwatch();
                    popup.remove();
                });
                popup.appendChild(sw);
            }
            const rect = colorSwatch.getBoundingClientRect();
            const popupH = 16 * 15 + 12;
            popup.style.left = Math.max(0, rect.left) + 'px';
            popup.style.top = Math.max(0, rect.top - popupH - 4) + 'px';
            document.body.appendChild(popup);
            const closePopup = (e) => {
                if (!popup.contains(e.target)) {
                    popup.remove();
                    document.removeEventListener('pointerdown', closePopup, true);
                }
            };
            setTimeout(() => document.addEventListener('pointerdown', closePopup, true), 0);
        };
        colorSwatch.addEventListener('click', openColorPopup);

        colorRow.appendChild(colorLabel);
        colorRow.appendChild(colorSwatch);
        colorRow.appendChild(colorText);
        body.appendChild(colorRow);
        updateSwatch();

        dlg.show(textarea);
    }

    _convertTextToBitmap() {
        const layer = this.doc.getActiveLayer();
        if (!layer || layer.type !== 'text') return;

        const td = layer.textData;
        const palette = this.doc.palette;
        const [r, g, b] = palette.getColor(td.colorIndex);
        const docW = this.doc.width;
        const docH = this.doc.height;

        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = docW;
        tmpCanvas.height = docH;
        const ctx = tmpCanvas.getContext('2d');

        const style = (td.italic ? 'italic ' : '') + (td.bold ? 'bold ' : '');
        ctx.font = `${style}${td.fontSize}px ${td.fontFamily}`;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.textBaseline = 'top';

        const lines = td.text.split('\n');
        const lineHeight = Math.round(td.fontSize * 1.2);
        for (let li = 0; li < lines.length; li++) {
            const ty = layer.offsetY + li * lineHeight;
            ctx.fillText(lines[li], layer.offsetX, ty);
            if (td.underline) {
                const metrics = ctx.measureText(lines[li]);
                ctx.fillRect(layer.offsetX, ty + td.fontSize, metrics.width, 1);
            }
        }

        const tmpData = ctx.getImageData(0, 0, docW, docH).data;
        layer.data = new Uint16Array(docW * docH).fill(_constants_js__WEBPACK_IMPORTED_MODULE_3__.TRANSPARENT);
        layer.width = docW;
        layer.height = docH;
        layer.offsetX = 0;
        layer.offsetY = 0;
        if (td.antialiased) {
            const colors = this.doc.palette.colors;
            for (let i = 0; i < docW * docH; i++) {
                const off = i * 4;
                const a = tmpData[off + 3];
                if (a < 8) continue;
                const alpha = a / 255;
                const mr = Math.round(r * alpha);
                const mg = Math.round(g * alpha);
                const mb = Math.round(b * alpha);
                let bestDist = Infinity, bestIdx = 0;
                for (let j = 0; j < 256; j++) {
                    const [pr, pg, pb] = colors[j];
                    const dist = (mr - pr) ** 2 + (mg - pg) ** 2 + (mb - pb) ** 2;
                    if (dist < bestDist) { bestDist = dist; bestIdx = j; }
                    if (dist === 0) break;
                }
                layer.data[i] = bestIdx;
            }
        } else {
            for (let i = 0; i < docW * docH; i++) {
                if (tmpData[i * 4 + 3] >= 128) {
                    layer.data[i] = td.colorIndex;
                }
            }
        }
        layer.type = 'raster';
        layer.textData = null;
        this.bus.emit('layer-changed');
        this.bus.emit('document-changed');
    }

}

// Mix in methods from extracted modules
Object.assign(App.prototype, _ui_MenuManager_js__WEBPACK_IMPORTED_MODULE_28__);
Object.assign(App.prototype, _KeyboardManager_js__WEBPACK_IMPORTED_MODULE_29__);
Object.assign(App.prototype, _FileManager_js__WEBPACK_IMPORTED_MODULE_30__);
Object.assign(App.prototype, _ImageOperations_js__WEBPACK_IMPORTED_MODULE_31__);

// Boot
const app = new App(); // eslint-disable-line

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map