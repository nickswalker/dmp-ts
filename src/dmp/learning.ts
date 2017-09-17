import DMP from "../models/dmp.js";
import Vec2 from "../models/vec2.js";

export type Demonstration = [number, Vec2][]
type Derivative = [number, Vec2][]
export function learnFromDemonstrations( k: number, demonstrations: Demonstration[]) : DMP[] {
    // We assume that demonstrations is sorted by the timestep dimension
    let normalized: [Demonstration, number][] = demonstrations.map(normalizeDemonstration);
    let v: Derivative[] = normalized.map((normalizedTuple) => {return getDerivative(normalizedTuple[0])});
    let v_dot: Derivative[] = v.map(getDerivative);
    let f: [number, Vec2][][] = [];
    for (let i = 0; i < normalized.length; i++) {
        const [demonstration, tau] = normalized[i];
        f.push(getForcingTerm(k, tau, demonstration, v[i], v_dot[i]))
    }
    if (normalized.length == 1) {

    }
    return [];
}

// Put demonstrations into phase space
function normalizeDemonstration(demonstration: Demonstration) : [Demonstration, number] {
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
function getDerivative(demonstration: Demonstration) : [number, Vec2][] {
    let result: Demonstration = [];
    for (let i = 0; i < demonstration.length; i++) {
        if (i + 1 > demonstration.length) {
            // Just duplicate the last gradient.
            result.push(result[result.length]);
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