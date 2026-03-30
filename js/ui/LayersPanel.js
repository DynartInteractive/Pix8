export class LayersPanel {
    constructor(doc, bus) {
        this.doc = doc;
        this.bus = bus;

        this.list = document.getElementById('layers-list');

        document.getElementById('layer-add-btn').addEventListener('click', () => this._addLayer());
        document.getElementById('layer-del-btn').addEventListener('click', () => this._deleteLayer());
        document.getElementById('layer-up-btn').addEventListener('click', () => this._moveLayer(-1));
        document.getElementById('layer-down-btn').addEventListener('click', () => this._moveLayer(1));
        document.getElementById('layer-dup-btn').addEventListener('click', () => this._duplicateLayer());

        this.bus.on('layer-changed', () => this.render());
        this.bus.on('document-changed', () => this.render());

        this.render();
    }

    render() {
        this.list.innerHTML = '';

        // Render layers top-to-bottom (reverse of array order, since array[0] = bottom)
        for (let i = this.doc.layers.length - 1; i >= 0; i--) {
            const layer = this.doc.layers[i];
            const item = document.createElement('div');
            item.className = 'layer-item' + (i === this.doc.activeLayerIndex ? ' active' : '');

            // Visibility toggle
            const vis = document.createElement('div');
            vis.className = 'layer-visibility' + (layer.visible ? '' : ' hidden');
            vis.textContent = layer.visible ? '👁' : '○';
            vis.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = !layer.visible;
                this.bus.emit('layer-changed');
            });

            // Thumbnail
            const thumb = document.createElement('canvas');
            thumb.className = 'layer-thumbnail';
            thumb.width = 32;
            thumb.height = 32;
            this._drawThumbnail(thumb, layer);

            // Name
            const name = document.createElement('span');
            name.className = 'layer-name';
            name.textContent = layer.name;

            name.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this._startRename(name, layer);
            });

            item.addEventListener('click', () => {
                this.doc.activeLayerIndex = i;
                this.bus.emit('active-layer-changed');
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

        // Create a tiny ImageData from the layer
        const imgData = new ImageData(layer.width, layer.height);
        const buf = imgData.data;
        for (let i = 0; i < layer.width * layer.height; i++) {
            const colorIndex = layer.data[i];
            if (colorIndex > 255) continue;
            const [r, g, b] = this.doc.palette.getColor(colorIndex);
            const off = i * 4;
            buf[off] = r;
            buf[off + 1] = g;
            buf[off + 2] = b;
            buf[off + 3] = 255;
        }

        // Draw at 1:1 to an offscreen canvas, then scale to thumbnail
        const tmp = document.createElement('canvas');
        tmp.width = layer.width;
        tmp.height = layer.height;
        tmp.getContext('2d').putImageData(imgData, 0, 0);

        ctx.clearRect(0, 0, 32, 32);
        ctx.drawImage(tmp, 0, 0, 32, 32);
    }

    _startRename(nameEl, layer) {
        const input = document.createElement('input');
        input.className = 'layer-name-input';
        input.value = layer.name;
        nameEl.replaceWith(input);
        input.focus();
        input.select();

        const finish = () => {
            layer.name = input.value || layer.name;
            this.render();
        };

        input.addEventListener('blur', finish);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
            if (e.key === 'Escape') { input.value = layer.name; input.blur(); }
        });
    }

    _addLayer() {
        this.doc.addLayer();
        this.bus.emit('layer-changed');
    }

    _deleteLayer() {
        if (this.doc.removeLayer(this.doc.activeLayerIndex)) {
            this.bus.emit('layer-changed');
        }
    }

    _moveLayer(dir) {
        const from = this.doc.activeLayerIndex;
        // dir=-1 means "up" visually = higher index in array
        const to = from - dir;
        if (this.doc.moveLayer(from, to)) {
            this.bus.emit('layer-changed');
        }
    }

    _duplicateLayer() {
        this.doc.duplicateLayer(this.doc.activeLayerIndex);
        this.bus.emit('layer-changed');
    }
}
