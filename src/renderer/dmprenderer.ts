import DMP from "../models/dmp.js";
import Trajectory from "../models/trajectory.js";
import Obstacle from "../models/obstacle.js";
import {Operation} from "../operations/operation.js";
import {black, white} from "../models/color.js";

export interface DMPRenderer {
    applyOperations(operations: [Operation]);
    save();
    reset();
}

export default class InteractiveCurveRenderer implements DMPRenderer {
    renderCanvas: HTMLCanvasElement;
    displayCanvas: HTMLCanvasElement;
    obstacles: Obstacle[] = [];
    demonstrations: Trajectory[] = [];
    linkedDMPs: DMP[] = [];
    private dirty: boolean = true;
    private history: [Operation];

    constructor(container: HTMLElement) {
        this.displayCanvas = document.createElement("canvas");
        this.displayCanvas.className = "marbling-render-layer";
        container.insertBefore(this.displayCanvas, container.firstChild);
        this.renderCanvas = document.createElement("canvas");
        this.render();
        window.requestAnimationFrame(this.draw.bind(this));
    }

    setSize(width: number, height: number) {
        this.displayCanvas.width = width;
        this.displayCanvas.height = height;
        this.renderCanvas.width = width;
        this.renderCanvas.height = height;
        this.dirty = true;
    }

    render() {
        const ctx = this.renderCanvas.getContext("2d");
        ctx.fillStyle = black.toHexString();
        ctx.fillRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
        for (let i = 0; i < this.demonstrations.length; i++) {
            const demonstration = this.demonstrations[i];
            ctx.strokeStyle = white.toHexString();
            ctx.stroke(demonstration.getPath());
        }
    }

    draw() {
        if (this.dirty) {
            this.render();
            this.dirty = false;
        }
        const ctx = this.displayCanvas.getContext("2d");
        ctx.drawImage(this.renderCanvas, 0, 0);
        window.requestAnimationFrame(this.draw.bind(this));
    }

    reset() {
        this.demonstrations = [];
        this.obstacles = [];
        this.dirty = true;
    }

    applyOperations(operations: [Operation]) {
        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            operation.apply(this);
        }
        this.dirty = true;
    }

    save() {
        const newWindow = window.open('about:new', 'DMP Image');
        newWindow.document.write("<img src='" + this.renderCanvas.toDataURL("image/png") + "' alt='from canvas'/>");
    }

}
