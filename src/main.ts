import InteractiveCurveRenderer from "./renderer/dmprenderer.js";
import Vec2 from "./models/vec2.js";
import {DMPUI} from "./ui/ui.js";

let renderer = null;
addEventListener('DOMContentLoaded', function () {
    let workspace = document.getElementById("workspace");
    let toolsPane = document.getElementById("tools");
    let optionsPane = document.getElementById("options");
    let ui = new DMPUI(workspace, toolsPane, optionsPane);
    renderer = new InteractiveCurveRenderer(workspace);
    ui.renderer = renderer;
    renderer.setSize(window.innerWidth, window.innerHeight);
    ui.size = new Vec2(window.innerWidth, window.innerHeight);

    window.onresize = function (event) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        ui.size = new Vec2(window.innerWidth, window.innerHeight);
    };

});
