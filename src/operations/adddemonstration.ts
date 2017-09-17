import Trajectory from "../models/trajectory.js";
import InteractiveCurveRenderer from "../renderer/dmprenderer.js";
import {Operation} from "./operation.js";

export default class AddDemonstration implements Operation {
    trajectory: Trajectory;
    constructor(trajectory: Trajectory) {
        this.trajectory = trajectory;
    }
    apply(renderer: InteractiveCurveRenderer) {
        renderer.demonstrations.push(this.trajectory);
    }


}