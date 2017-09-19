import {FunctionApproximator} from "./functionapproximator.js";
import {Basis} from "../dmp/basis.js";
import {Matrix, MatrixTransposeView, solve} from "ml-matrix";
export default class BasisFunctionApproximator implements FunctionApproximator {
    w: number[];
    bases: Basis;

    static learn(samples: [number, number][], bases: Basis) {
        const q_by_row: number[][] = [];
        const y_raw: number[] = [];
        for (let i = 0; i < samples.length; i++) {
            // Each sample is a phase, output tuple
            const [s, f] = samples[i];
            q_by_row.push(bases.evaluate(s));
            y_raw.push(bases.formatForRegression(s, f));
        }
        const y = Matrix.columnVector(y_raw);
        const Q: Matrix = new Matrix(q_by_row);
        // Solve Qw = y
        const weights: Matrix = solve(Q, y, true);
        console.assert(weights.isColumnVector());
        return new BasisFunctionApproximator(weights.to1DArray(), bases);

    }

    constructor (weights: number[], basis: Basis) {
        this.w = weights;
        this.bases = basis;
    }

    evaluate(at: number) : number {
        const phi = this.bases.evaluate(at);
        console.assert(phi.length == this.w.length, "Weights must be same dimension as basis functions");
        let weightedActivations = 0;
        let totalActivations = 0;
        for (let i = 0; i < phi.length; i++) {
            weightedActivations += this.w[i] * phi[i] * at;
            totalActivations += phi[i];
        }
        if (totalActivations == 0) {
            return 0;
        }
        return weightedActivations / totalActivations;
    }
}