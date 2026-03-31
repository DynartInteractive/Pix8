import { BaseTool } from './BaseTool.js';

export class MoveTool extends BaseTool {
    constructor(doc, bus, canvasView) {
        super(doc, bus, canvasView);
        this.name = 'Move';
        this.shortcut = 'V';
        this.icon = `<svg viewBox="0 0 20 20"><path d="M10 2l3 3h-2v4h4V7l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H5v2l-3-3 3-3v2h4V5H7l3-3z"/></svg>`;
        this._startX = null;
        this._startY = null;
        this._origOffsetX = 0;
        this._origOffsetY = 0;
        this._movingSelection = false;
    }

    getCursor() {
        return 'grab';
    }

    onPointerDown(x, y, e) {
        const sel = this.doc.selection;
        const layer = this.doc.getActiveLayer();

        if (sel.active) {
            // Lift pixels if not already floating
            if (!sel.hasFloating()) {
                sel.liftPixels(layer);
                this.canvasView.invalidateSelectionEdges();
                this.bus.emit('selection-changed');
            }
            this._movingSelection = true;
            this._startX = x;
            this._startY = y;
            this._origOffsetX = sel.floating.originX;
            this._origOffsetY = sel.floating.originY;
            return;
        }

        if (layer.locked) return;
        this._movingSelection = false;
        this._startX = x;
        this._startY = y;
        this._origOffsetX = layer.offsetX;
        this._origOffsetY = layer.offsetY;
    }

    onPointerMove(x, y, e) {
        if (this._startX === null) return;

        if (this._movingSelection) {
            const sel = this.doc.selection;
            if (!sel.hasFloating()) return;
            const newX = this._origOffsetX + (x - this._startX);
            const newY = this._origOffsetY + (y - this._startY);
            sel.moveFloating(newX, newY);
            this.canvasView.invalidateSelectionEdges();
            return;
        }

        const layer = this.doc.getActiveLayer();
        layer.offsetX = this._origOffsetX + (x - this._startX);
        layer.offsetY = this._origOffsetY + (y - this._startY);
    }

    onPointerUp(x, y, e) {
        if (this._movingSelection) {
            const sel = this.doc.selection;
            // Commit if pointer released outside document bounds
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
    }
}
