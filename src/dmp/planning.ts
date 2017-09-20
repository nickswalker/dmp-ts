import DMP from "../models/dmp.js";
import Vec2 from "../models/vec2.js";
import Obstacle from "../models/obstacle.js";

const epsilon = 0.0001;

export function makeLinkedDMPRollout(dmps: DMP[], startState: Vec2, startVelocity: Vec2, goalState: Vec2, tau: number, timeStep: number, obstacles?: Obstacle[]): [number, Vec2][] {
    console.assert(dmps.length > 0, "Must pass at least one DMP");
    if (obstacles === undefined) {
        obstacles = [];
    }
    let poses: [number, number][][] = [];
    for (let i = 0; i < dmps.length; i++) {
        let o_i: number[] = [];
        for (let i = 0; i < obstacles.length; i++) {
            o_i.push(obstacles[i].center.get(i));
        }
        poses.push(makeDMPRollout(dmps[i],startState.get(i),startVelocity.get(i),goalState.get(i),tau,timeStep, o_i));
    }
    let finalPoses: [number, Vec2][] = [];
    for (let i = 0; i < poses[0].length; i++) {
        const [xTime, xPose] = poses[0][i];
        const [, yPose] = poses[1][i];
        finalPoses.push([xTime, new Vec2(xPose, yPose)]);
    }
    return finalPoses;
}

export function makeDMPRollout(dmp: DMP, startState: number, startVelocity: number, goalState: number, tau: number, timeStep:number, obstacles?: number[]) : [number, number][] {
    const f = dmp.f.evaluate.bind(dmp.f);
    if (obstacles === undefined) {
        obstacles = [];
    }

    let poses: [number, number][] = [];

    // For convenience so that our first action is marked a t=0
    let t = -timeStep;
    const x_0 = startState;
    let x = x_0;
    let v = startVelocity;
    const g = goalState;
    const s = DMP.createPhaseFunctor(1, 0.01, tau);
    // Depending on the timestep we can have numerical issues
    while (t < tau + epsilon - timeStep) {
        t += timeStep;

        const o: number[] = obstacles.map((o) => {
            const num = Math.exp(-Math.abs(o - x)) * (x - o);
            const denom = Math.pow(x - o, 2);
            return num / denom;
        });

        const o_total = o.reduce((a, b) => {return a + b}, 0);

        // K( (g-x) - (g -x0)s + f(s)) - DV
        const s_t = s(t);
        const forcing = f(s_t);
        let v_dot = dmp.k * ((g - x) - (g - x_0) * s_t + forcing) - dmp.d * v + o_total;
        v_dot /= tau;
        let x_dot = v / tau;

        v += v_dot * timeStep;
        x += x_dot * timeStep;
        poses.push([t, x]);

    }

    return poses;
}