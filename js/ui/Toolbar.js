export class Toolbar {
    constructor(tools, bus) {
        this.tools = tools;
        this.bus = bus;
        this.container = document.getElementById('toolbar-area');
        this.activeTool = null;
        this._buttons = [];

        this._render();

        this.bus.on('switch-tool', (name) => {
            this.setActiveTool(name);
        });
    }

    _render() {
        // Insert tool buttons before the color-selector div
        const colorSelector = document.getElementById('color-selector');

        // Group: Drawing tools
        const drawingTools = ['Move', 'Brush', 'Eraser', 'Color Picker'];
        // Group: Shape tools
        const shapeTools = ['Line', 'Rectangle', 'Filled Rect', 'Ellipse', 'Filled Ellipse'];
        // Group: Brush selectors
        const selectorTools = ['Rect Brush Sel', 'Circle Brush Sel', 'Poly Brush Sel'];

        const groups = [drawingTools, shapeTools, selectorTools];

        for (let gi = 0; gi < groups.length; gi++) {
            for (const toolName of groups[gi]) {
                const tool = this.tools.find(t => t.name === toolName);
                if (!tool) continue;

                const btn = document.createElement('button');
                btn.className = 'tool-btn';
                btn.title = tool.name + (tool.shortcut ? ` (${tool.shortcut})` : '');
                btn.innerHTML = tool.icon;

                if (tool.shortcut && tool.shortcut.length === 1) {
                    const hint = document.createElement('span');
                    hint.className = 'shortcut-hint';
                    hint.textContent = tool.shortcut;
                    btn.appendChild(hint);
                }

                btn.addEventListener('click', () => {
                    this.setActiveTool(tool.name);
                });

                this.container.insertBefore(btn, colorSelector);
                this._buttons.push({ btn, toolName: tool.name });
            }

            // Add separator between groups (except after last)
            if (gi < groups.length - 1) {
                const sep = document.createElement('div');
                sep.className = 'toolbar-sep';
                this.container.insertBefore(sep, colorSelector);
            }
        }
    }

    setActiveTool(name) {
        for (const { btn, toolName } of this._buttons) {
            btn.classList.toggle('active', toolName === name);
        }
        const tool = this.tools.find(t => t.name === name);
        if (tool) {
            // Deactivate previous tool if it has a deactivate method
            if (this.activeTool && this.activeTool.deactivate) {
                this.activeTool.deactivate();
            }
            this.activeTool = tool;
            this.bus.emit('tool-changed', tool);
        }
    }
}
