///<reference path="panes/toolspane.ts"/>
enum Tool {
    Demonstrate = 0,
    AddObstacle = 1,
    Query = 2,
}

const allTools = [Tool.Demonstrate, Tool.AddObstacle, Tool.Query];

function toolInitializedObject<T>(): { [key: number]: T } {
    const object = {};
    for (const tool in allTools) {
        object[tool] = {};
    }
    return object;
}

const primaryKeys: { [key: number]: string } = toolInitializedObject();

const secondaryKeys: { [key: number]: string } = toolInitializedObject();

const guides: { [key: number]: string } = toolInitializedObject();


class ToolParameters {
    parameters: { [key: number]: string };
    onchange: Function;

    constructor(onchange: Function) {
        this.onchange = onchange;
        this.parameters = toolInitializedObject();

    }

    forTool(tool: Tool) {
        return this.parameters[tool];
    }

    increasePrimary(tool: Tool) {
        const currentValue = this.parameters[tool][primaryKeys[tool]];
        const [min, max, step] = guides[tool][primaryKeys[tool]];
        this.parameters[tool][primaryKeys[tool]] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreasePrimary(tool: Tool) {
        const currentValue = this.parameters[tool][primaryKeys[tool]];
        const [min, max, step] = guides[tool][primaryKeys[tool]];
        this.parameters[tool][primaryKeys[tool]] = Math.max(min, currentValue - step);
        this.onchange();
    }

    increaseSecondary(tool: Tool) {
        const currentValue = this.parameters[tool][secondaryKeys[tool]];
        const [min, max, step] = guides[tool][secondaryKeys[tool]];
        this.parameters[tool][secondaryKeys[tool]] = Math.min(max, currentValue + step);
        this.onchange();
    }

    decreaseSecondary(tool: Tool) {
        const currentValue = this.parameters[tool][secondaryKeys[tool]];
        const [min, max, step] = guides[tool][secondaryKeys[tool]];
        this.parameters[tool][secondaryKeys[tool]] = Math.max(min, currentValue - step);
        this.onchange();
    }

}