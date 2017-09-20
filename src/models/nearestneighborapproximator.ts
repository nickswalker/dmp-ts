import {FunctionApproximator} from "./functionapproximator.js";

export default class NearestNeighborApproximator implements FunctionApproximator {
    samples: [number, number][];
    constructor(samples: [number,number][]) {
        samples.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });
        this.samples = samples;
    }
    evaluate(at: number): number {
        // Only one value, so we'll assume a constant function...
        if (this.samples.length == 1) {
            return this.samples[0][1];
        }
        // TODO: Use KD tree for this
        // There are things you should do to make nearest neighbors search fast, but
        // I'm not going to do them right now.
        let smallestPositiveDelta = Number.POSITIVE_INFINITY;
        let largestNegativeDelta = Number.NEGATIVE_INFINITY;
        let currentPositiveValue: number = undefined;
        let currentNegativeValue: number = undefined;
        for (let i = 0; i < this.samples.length; i++) {
            let [position, value] = this.samples[i];
            let delta = position - at;
            if (delta == 0) {
                // We found an exact match!
                return value;
            } else if (delta < 0 && delta > largestNegativeDelta) {
                largestNegativeDelta = delta;
                currentNegativeValue = value;
            } else if (delta > 0 && delta < smallestPositiveDelta) {
                smallestPositiveDelta = delta;
                currentPositiveValue = value;
            }
        }
        // Interpolate
        const span = smallestPositiveDelta - largestNegativeDelta;
        console.assert(span > 0, "Span should be positive magnitude");
        const abovePercentage = smallestPositiveDelta / span;
        const belowPercentage = Math.abs(largestNegativeDelta) / span;
        return belowPercentage * currentPositiveValue + abovePercentage * currentNegativeValue;
    }

}