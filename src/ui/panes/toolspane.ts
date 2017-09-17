import {Tool, ToolParameters} from "../tools.js";

export default class ToolsPane {
    container: HTMLElement;
    toolToButtonMapping: {[key: number]: HTMLElement};
    private _currentTool: Tool;
    toolParameters: ToolParameters;
    private shiftDown: boolean = false;

    constructor(container: HTMLElement) {
        this.container = container;
        const demonstrateTool = <HTMLElement>container.querySelector(".demonstrate-tool");

        this.toolToButtonMapping = {};
        this.toolToButtonMapping[Tool.Demonstrate] = demonstrateTool;

        this.toolParameters = new ToolParameters(this.fireEvent.bind(this));

        // Set default tool
        this._currentTool = Tool.Demonstrate;
        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        for (const key in this.toolToButtonMapping) {
            this.toolToButtonMapping[key].onclick = this.toolClicked.bind(this);
        }
        document.addEventListener("keydown", this.shiftChange.bind(this));
        document.addEventListener("keyup", this.shiftChange.bind(this));
    }

    private shiftChange(e: KeyboardEvent) {
        this.shiftDown = e.shiftKey;
    }

    private toolClicked(event: MouseEvent) {
        for (let key in this.toolToButtonMapping) {
            let newClasses = this.toolToButtonMapping[key].className.replace(/(\s|^)active(\s|$)/, ' ');
            this.toolToButtonMapping[key].className = newClasses;
        }
        const target = event.currentTarget;
        for (let key in this.toolToButtonMapping) {
            if (this.toolToButtonMapping[key] == target) {
                this._currentTool = <Tool>parseInt(key);
            }
        }

        this.toolToButtonMapping[this._currentTool.valueOf()].className += " active";
        this.fireEvent();
    }

    get currentTool(): Tool {
        return this._currentTool;
    }

    set currentTool(value: Tool) {
        this._currentTool = value;
        this.fireEvent()
    }

    private fireEvent() {
        const dict = {"currentTool": this.currentTool, "parameters": this.toolParameters.forTool(this.currentTool)};
        const event = new CustomEvent("toolchange", {detail: dict});
        document.dispatchEvent(event);
    }

}