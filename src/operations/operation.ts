import InteractiveCurveRenderer from "../renderer/dmprenderer.js";

export interface Operation {
    apply(renderer: InteractiveCurveRenderer);
}