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

    static createPhaseFunctor(s_0: number, convergeto: number, tau: number): (t: number) => number {
        const alpha = -Math.log(convergeto / s_0);
        return function (t: number) : number {
            // tau * s_dot(t) = -alpha * s(t)
            // s_dot(t) = (-alpha / tau) * s(t)
            // s(t) = s(0) * e^(t * (-alpha/tau))
            return s_0 * Math.exp( t * (-alpha / tau));
        }
    };

}