import DMP from "../models/dmp.js";
import Vec2 from "../models/vec2.js";

const epsilon = 0.0001;

export function makeLinkedDMPRollout(dmps: DMP[], startState: Vec2, startVelocity: Vec2, goalState: Vec2, tau: number, timeStep: number): [number, Vec2][] {
    console.assert(dmps.length > 0, "Must pass at least one DMP");
    let poses: [number, number][][] = [];
    for (let i = 0; i < dmps.length; i++) {
        poses.push(makeDMPRollout(dmps[i],startState.get(i),startVelocity.get(i),goalState.get(i),tau,timeStep));
    }
    let finalPoses: [number, Vec2][] = [];
    for (let i = 0; i < poses[0].length; i++) {
        const [xTime, xPose] = poses[0][i];
        const [, yPose] = poses[1][i];
        finalPoses.push([xTime, new Vec2(xPose, yPose)]);
    }
    return finalPoses;
}

export function makeDMPRollout(dmp: DMP, startState: number, startVelocity: number, goalState: number, tau: number, timeStep:number) : [number, number][] {
    const createPhaseFunctor = (s_0: number, convergeto: number)  => {
        const alpha = -Math.log(convergeto / s_0);
        return function (t: number) : number {
            // tau * s_dot(t) = -alpha * s(t)
            // s_dot(t) = (-alpha / tau) * s(t)
            // s(t) = s(0) * e^(t * (-alpha/tau))
            return s_0 * Math.exp( t * (-alpha / tau));
        }
    };

    const f = (phase: number) => {
        return dmp.f.evaluate(phase);
    };

    let poses: [number, number][] = [];

    let t = 0;
    const x_0 = startState;
    let x = x_0;
    let v = startVelocity;
    const g = goalState;
    const s = createPhaseFunctor(1, 0.01);
    // Depending on the timestep we can have numerical issues
    while (t <= tau + epsilon) {
        // K( (g-x) - (g -x0)s + f(s)) - DV
        const s_t = s(t);
        const forcing = f(s_t);
        let v_dot = dmp.k * ((g - x) - (g - x_0) * s_t + forcing) - dmp.d * v;
        v_dot /= tau;
        let x_dot = v / tau;

        v += v_dot * timeStep;
        x += x_dot * timeStep;
        poses.push([t, x]);
        t += timeStep;
    }

    return poses;
}