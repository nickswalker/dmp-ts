import {FunctionApproximator} from "./functionapproximator.js";

export default class DMP {
    k: number;
    d: number;
    alpha: number;
    f: FunctionApproximator;

    constructor(k: number, d?: number) {
        this.k = k;
        // Use critical damping by default
        this.d = d ? d : 2.0 * Math.sqrt(k);
        this.alpha = 0.01;
    }

}