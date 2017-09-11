///<reference path="cursor/cursor_overlay.ts"/>
///<reference path="keyboard.ts"/>
///<reference path="vector_field_overlay.ts"/>
///<reference path="panes/toolspane.ts"/>
///<reference path="help_overlay.ts"/>


interface UICommandable {
    applyCommand(command: UICommand)
}

class DMPUI implements UICommandable {
    toolsPane: ToolsPane;
    controlsPane: ControlsPane;
    _renderer: DMPRenderer;
    private _size: Vec2;
    private lastMouseCoord: Vec2;
    private mouseDownCoord: Vec2;
    private mouseDownStamp: number;
    private mouseInterval: number;

    private keyboardShortcutOverlay: Modal;
    private keyboardManager: MarblingKeyboardUI;

    private cursorOverlay: CursorOverlay;
    private vectorFieldOverlay: VectorFieldOverlay;

    private currentTrajectory: Trajectory = null;

    constructor(container: HTMLElement, toolsContainer: HTMLElement, optionsContainer: HTMLElement) {
        this.toolsPane = new ToolsPane(toolsContainer);
        this.controlsPane = new ControlsPane(optionsContainer);
        this.controlsPane.controlled = this;
        this.keyboardShortcutOverlay = new KeyboardShortcutOverlay();
        this.keyboardManager = new MarblingKeyboardUI();
        this.keyboardManager.keyboardDelegate = this;
        container.addEventListener("mousedown", this.mouseDown.bind(this));
        container.addEventListener("mouseup", this.mouseUp.bind(this));
        container.addEventListener("mousemove", this.mouseMove.bind(this));
        container.addEventListener("mousewheel", this.scroll.bind(this));
        document.addEventListener("mouseout", this.mouseOut.bind(this));
        this.cursorOverlay = new CursorOverlay(container);
        this.vectorFieldOverlay = new VectorFieldOverlay(container);
    }

    set renderer(renderer: DMPRenderer) {
        this._renderer = renderer;
    }

    set size(size: Vec2) {
        this.cursorOverlay.setSize(size.x, size.y);
        this.vectorFieldOverlay.setSize(size.x, size.y);
        this._size = size;
    }

    didPressShortcut(shortcut: KeyboardShortcut) {
        switch (shortcut) {
            case KeyboardShortcut.S:
                if (this.keyboardManager.controlDown) {
                    this._renderer.save();
                } else {
                    this.keyboardManager.acceptingNewKeys = false;
                }
                return;
            case KeyboardShortcut.Up:
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Down:
                this.toolsPane.toolParameters.decreasePrimary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Right:
                this.toolsPane.toolParameters.increaseSecondary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.Left:
                this.toolsPane.toolParameters.decreaseSecondary(this.toolsPane.currentTool);
                return;
            case KeyboardShortcut.R:
                if (confirm("Clear the composition?")) {
                    this._renderer.reset();
                }
                return;
            case KeyboardShortcut.F:
                this.vectorFieldOverlay.toggleVisibility();
                return;
            case KeyboardShortcut.Q:
                this.vectorFieldOverlay.decreaseResolution();
                return;
            case KeyboardShortcut.W:
                this.vectorFieldOverlay.increaseResolution();
                return;
            case KeyboardShortcut.QuestionMark:
                if (this.keyboardManager.shiftDown) {
                    this.keyboardShortcutOverlay.show();
                }
                return;

        }
    }

    applyCommand(command: UICommand) {
        switch (command) {
            case UICommand.Reset: {
                if (confirm("Clear the composition?")) {
                    this._renderer.reset();
                }
                return;
            }
            case UICommand.Save: {
                this._renderer.save();
                return;
            }
            case UICommand.ShowField: {
                this.vectorFieldOverlay.toggleVisibility();
                return;
            }
            case UICommand.ShowHelp: {
                return;
            }
            case UICommand.ShowKeyboardShortcutOverlay: {
                this.keyboardShortcutOverlay.show();
                return;
            }

        }
    }

    private mouseDown(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.mouseDownCoord = new Vec2(x, y);
        this.mouseDownStamp = new Date().getUTCMilliseconds();
        switch (this.toolsPane.currentTool) {
            case Tool.Demonstrate:
                this.currentTrajectory = new Trajectory([], []);
        }
        this.mouseInterval = setInterval(this.mouseHeldHandler.bind(this), 10);
    }

    private mouseUp(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        const currentCoord = new Vec2(x, y);
        let operation: Operation;
        switch (this.toolsPane.currentTool) {
            case Tool.Demonstrate:
                operation = new AddDemonstration(this.currentTrajectory);
                break;

        }
        this.lastMouseCoord = null;
        this.mouseDownCoord = null;
        this.mouseDownStamp = null;
        clearInterval(this.mouseInterval);
        this.mouseInterval = 0;
        this._renderer.applyOperations([operation]);
    }

    private mouseMove(e: MouseEvent) {
        const x = e.offsetX;
        const y = e.offsetY;
        this.lastMouseCoord = new Vec2(x, y);

    }

    private mouseOut(e: MouseEvent) {
        this.mouseDownCoord = null;
        this.lastMouseCoord = null;
        this.mouseDownStamp = null;
        this.currentTrajectory = null;
    }

    private mouseHeldHandler() {
        switch (this.toolsPane.currentTool) {
            case Tool.Demonstrate:
                if (this.mouseDownCoord != null) {
                    this.currentTrajectory.append(this.lastMouseCoord, new Date().getUTCMilliseconds() - this.mouseDownStamp)
                }
        }
    }


    private scroll(e: MouseWheelEvent) {
        const delta = e.wheelDelta;
        if (delta > 0) {
            if (!this.keyboardManager.shiftDown) {
                this.toolsPane.toolParameters.increasePrimary(this.toolsPane.currentTool);
            } else {
                this.toolsPane.toolParameters.increaseSecondary(this.toolsPane.currentTool);
            }
        } else {
            if (!this.keyboardManager.shiftDown) {
                this.toolsPane.toolParameters.decreasePrimary(this.toolsPane.currentTool);
            } else {
                this.toolsPane.toolParameters.decreaseSecondary(this.toolsPane.currentTool);
            }
        }
    }


}