///<reference path="../models/vectorfield.ts"/>
///<reference path="panes/toolspane.ts"/>

class VectorFieldOverlay {
    private renderer: VectorFieldRenderer;

    constructor(container: HTMLElement) {
        this.renderer = new VectorFieldRenderer(container);
    }


    setSize(width: number, height: number) {
        this.renderer.setSize(width, height);
    }

    toggleVisibility() {
        this.renderer.toggleVisibility();
    }

    increaseResolution() {
        this.renderer.spacing = Math.min(80, this.renderer.spacing + 2);
    }

    decreaseResolution() {
        this.renderer.spacing = Math.max(5, this.renderer.spacing - 2);
    }
}

class VectorFieldRenderer {
    private overlayCanvas: HTMLCanvasElement;
    private overlayContext: CanvasRenderingContext2D;
    private _spacing: number = 40;
    private visible: boolean = false;
    private _vectorField: VectorField = null;
    private dirty: boolean = true;
    private arrowWidth = 20;
    private arrowHeight = 12;
    private arrow = this.generateArrowPath();

    constructor(container: HTMLElement) {
        this.overlayCanvas = document.createElement('canvas');
        this.overlayCanvas.className = "marbling-vector-field-overlay";
        this.overlayContext = this.overlayCanvas.getContext("2d");
        container.appendChild(this.overlayCanvas);
        this.drawOverlay();

    }

    set vectorField(value: VectorField) {
        this._vectorField = value;
        this.dirty = true;
        //  if the vectorfield is already rendering, it'll switch out automatically
    }

    set spacing(value: number) {
        this._spacing = value;
        this.dirty = true;
    }

    get spacing(): number {
        return this._spacing;
    }

    private drawOverlay() {
        if (!this.visible) {
            return;
        }

        if (!this.dirty) {
            requestAnimationFrame(this.drawOverlay.bind(this));
            return;
        }

        const ctx = this.overlayContext;
        const width = this.arrowWidth;
        const height = this.arrowHeight;
        ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
        if (this._vectorField == null) {
            requestAnimationFrame(this.drawOverlay.bind(this));
            return;
        }


        const halfWidth = width / 2;
        const halfHeight = height / 2;

        ctx.fillStyle = "rgba(0,0,0, 0.8)";
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        for (let x = 0; x < this.overlayCanvas.width; x += this._spacing) {
            for (let y = 0; y < this.overlayCanvas.height; y += this._spacing) {
                const dir = this._vectorField.atPoint(new Vec2(x, y));
                const angle = dir.angle();
                const size = dir.length() / this.arrowHeight;
                if (size > 0.1) {
                    ctx.translate(x - halfWidth, y - halfHeight);
                    ctx.scale(size, size);
                    ctx.rotate(angle);

                    ctx.stroke(this.arrow);
                    ctx.fill(this.arrow);

                    ctx.scale(1 / size, 1 / size);
                    ctx.rotate(-angle);
                    ctx.translate(-x + halfWidth, -y + halfHeight);
                }
            }
        }
        this.dirty = false;
        requestAnimationFrame(this.drawOverlay.bind(this));

    }


    generateArrowPath() {
        const path = new Path2D();
        path.moveTo(0, 2);
        path.lineTo(2, 2);
        path.lineTo(12, 2);
        path.lineTo(12, 6);
        path.lineTo(20, 3);
        path.lineTo(12, 0);
        path.lineTo(12, 4);
        path.lineTo(0, 4);
        path.closePath();
        return path;
    }


    setSize(width: number, height: number) {
        this.overlayCanvas.width = width;
        this.overlayCanvas.height = height;
        this.dirty = true;
    }

    toggleVisibility() {
        if (this.visible) {
            this.visible = false;
            this.overlayCanvas.style.visibility = "hidden";
        } else {
            this.visible = true;
            this.overlayCanvas.style.visibility = "visible";
            this.drawOverlay();
        }
    }
}