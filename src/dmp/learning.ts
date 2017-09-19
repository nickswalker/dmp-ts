import DMP from "../models/dmp.js";
import Vec2 from "../models/vec2.js";
import NearestNeighborApproximator from "../models/nearestneighborapproximator";
import BasisFunctionApproximator from "../models/basisfunctionapproximator";
import GaussianBasis from "./gaussianbasis";
import {FunctionApproximator} from "../models/functionapproximator";

export type Demonstration = [number, Vec2][]
type Derivative = [number, Vec2][]
export function learnFromDemonstrations( k: number, demonstrations: Demonstration[]) : DMP[] {
    // We assume that demonstrations is sorted by the timestep dimension
    let normalizedDemos: [Demonstration, number][] = demonstrations.map(normalizeDemonstration);
    let v: Derivative[] = normalizedDemos.map((normalizedTuple) => {return getDerivative(normalizedTuple[0])});
    let v_dot: Derivative[] = v.map(getDerivative);
    let f: [number, Vec2][][] = [];
    let xSamples: [number, number][] = [];
    let ySamples: [number, number][] = [];
    for (let i = 0; i < normalizedDemos.length; i++) {
        const [demonstration, tau] = normalizedDemos[i];
        const demoF = getForcingTerm(k, tau, demonstration, v[i], v_dot[i]);
        f.push(demoF);
        for (let i = 0; i < demoF.length; i++) {
            let [time, sample] = demoF[i];
            console.assert(0 <= time && time <= 1, "Forcing term times should be in phase space.");
            xSamples.push([time, sample.get(0)]);
            ySamples.push([time, sample.get(1)]);
        }
    }

    let xApproximator, yApproximator: FunctionApproximator;
    if (normalizedDemos.length == 1) {
        let [demo, tau]: [Demonstration, number] = normalizedDemos[0];
        xApproximator = new NearestNeighborApproximator(xSamples);
        yApproximator = new NearestNeighborApproximator(ySamples);
    } else {
        let xGaussianBasis = GaussianBasis.equallyDistributed(10);
        let yGassianBasis = GaussianBasis.equallyDistributed(10);
        xApproximator = BasisFunctionApproximator.learn(xSamples, xGaussianBasis);
        yApproximator = BasisFunctionApproximator.learn(ySamples, yGassianBasis);

        return
    }
    let xDMP = new DMP(k, xApproximator);
    let yDMP = new DMP(k, yApproximator);
    return [xDMP, yDMP];
}

// Put demonstrations into phase space
export function normalizeDemonstration(demonstration: Demonstration) : [Demonstration, number] {
    let result: Demonstration = [];
    const min = demonstration[0][0];
    const max = demonstration[demonstration.length - 1][0];
    console.assert(min < max, "Demonstration samples must be sorted by timestamp");
    const span = max - min;
    for (let i = 0; i < demonstration.length; i++) {
        const newStamp = (demonstration[i][0] - min) / span;
        result.push([newStamp, demonstration[i][1]]);
    }
    return [result, span];
}

// Approximate gradient in phase space.
// Demonstration must be in phase space.
export function getDerivative(demonstration: Demonstration) : [number, Vec2][] {
    let result: Demonstration = [];
    for (let i = 0; i < demonstration.length; i++) {
        if (i + 1 >= demonstration.length) {
            const [, prevGradient] = result[result.length - 1];
            const [currentTime, ] = demonstration[demonstration.length - 1];
            // Just duplicate the last gradient.
            result.push([currentTime, prevGradient]);
            break;
        }
        const currentSample = demonstration[i];
        const nextSample = demonstration[i + 1];
        const timeDelta = nextSample[0] - currentSample[0];

        const positionDelta = nextSample[1].sub(currentSample[1]);
        // Rise over run...
        const slope = positionDelta.scale(1 /timeDelta);
        result.push([currentSample[0],slope]);
    }
    return result;
}

// Demonstration must be in phase space
// Returns vector of forcing terms by time stamp, by component
function getForcingTerm(k: number, tau: number, demonstration: Demonstration, v: [number, Vec2][], v_dot: [number, Vec2][]) : [number, Vec2][] {
    const x_0 = demonstration[0][1];
    const D =  2.0 * Math.sqrt(k);
    const g = demonstration[demonstration.length - 1][1];

    let f: [number, Vec2][] = [];
    for (let i = 0; i < demonstration.length; i++) {
        const [s_i, x_i] = demonstration[i];
        const v_i = v[i][1];
        const v_dot_i = v_dot[i][1];
        // tau * v_dot + Dv
        const denominator = v_dot_i.scale(tau).add(v_i.scale(D));
        // -(g-x) + (g-x_0)s
        const addend = g.scale(-1).sub(x_i).add(g.sub(x_0).scale(s_i));
        f.push([s_i, denominator.scale(1.0 / k).add(addend)]);
    }
    return f;

}