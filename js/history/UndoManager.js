export class UndoManager {
    constructor(doc, bus, maxEntries = 50) {
        this.doc = doc;
        this.bus = bus;
        this.maxEntries = maxEntries;
        this.undoStack = [];
        this.redoStack = [];
        this._snapshot = null;
        this._snapshotLayer = -1;
    }

    /** Call before a tool operation begins (on pointer down). */
    beginOperation() {
        const idx = this.doc.activeLayerIndex;
        const layer = this.doc.layers[idx];
        this._snapshotLayer = idx;
        this._snapshot = layer.snapshotData();
    }

    /** Call after a tool operation ends (on pointer up). */
    endOperation() {
        if (this._snapshot === null) return;

        const idx = this._snapshotLayer;
        const layer = this.doc.layers[idx];
        const afterData = layer.snapshotData();

        // Only push if data actually changed
        let changed = false;
        for (let i = 0; i < afterData.length; i++) {
            if (afterData[i] !== this._snapshot[i]) {
                changed = true;
                break;
            }
        }

        if (changed) {
            this.undoStack.push({
                layerIndex: idx,
                beforeData: this._snapshot,
                afterData: afterData,
            });

            // Cap the stack
            if (this.undoStack.length > this.maxEntries) {
                this.undoStack.shift();
            }

            // Clear redo stack on new operation
            this.redoStack = [];
        }

        this._snapshot = null;
        this._snapshotLayer = -1;
    }

    undo() {
        const entry = this.undoStack.pop();
        if (!entry) return;

        const layer = this.doc.layers[entry.layerIndex];
        if (layer) {
            layer.restoreData(entry.beforeData);
            this.redoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
    }

    redo() {
        const entry = this.redoStack.pop();
        if (!entry) return;

        const layer = this.doc.layers[entry.layerIndex];
        if (layer) {
            layer.restoreData(entry.afterData);
            this.undoStack.push(entry);
            this.bus.emit('layer-changed');
            this.bus.emit('document-changed');
        }
    }
}
