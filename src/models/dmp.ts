import {FunctionApproximator} from "./functionapproximator.js";

export default class DMP {
    k: number;
    d: number;
    f: FunctionApproximator;

    constructor(k: number, f: FunctionApproximator) {
        this.k = k;
        // Use critical damping by default
        this.d = 2.0 * Math.sqrt(k);
        this.f = f;
    }

}