export class TabBar {
    constructor(bus) {
        this.bus = bus;
        this.container = document.getElementById('tab-bar');
        this._lastClickTime = 0;
        this._lastClickId = null;
    }

    render(tabs, activeTabId) {
        // Rebuilding collapses scrollWidth and clamps scrollLeft to 0, which
        // scrolled the bar back to the first tab on every switch or rename once
        // the tabs overflowed 'overflow-x: auto'.
        const scrollLeft = this.container.scrollLeft;
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

        this.container.scrollLeft = scrollLeft;
        // A freshly created tab, or one activated by keyboard, can sit past the
        // right edge; 'nearest' leaves an already-visible tab where it is.
        const active = this.container.querySelector('.tab.active');
        if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
