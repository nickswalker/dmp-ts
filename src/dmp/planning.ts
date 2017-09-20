import DMP from "../models/dmp.js";
import Vec2 from "../models/vec2.js";
import Obstacle from "../models/obstacle.js";

const epsilon = 0.0001;

export function makeLinkedDMPRollout(dmps: DMP[], startState: Vec2, startVelocity: Vec2, goalState: Vec2, tau: number, timeStep: number, obstacles?: Obstacle[]): [number, Vec2][] {
    console.assert(dmps.length > 0, "Must pass at least one DMP");
    if (obstacles === undefined) {
        obstacles = [];
    }
    let poses: [number, Vec2][] = [];
    let steppers = [];
    let x = [];
    let v = [];
    const s = DMP.createPhaseFunctor(1, 0.01, tau);
    for (let i = 0; i < dmps.length; i++) {
        steppers.push(makeStepper(dmps[i], startState.get(i), goalState.get(i), tau, timeStep,s));
        x.push(startState.get(i));
        v.push(startVelocity.get(i));

    }
    let t = 0;
    poses.push([0, startState]);
    while (t < tau + epsilon - timeStep) {
        t += timeStep;
        const [, lastPose] = poses[poses.length - 1];
        const o_all: Vec2[] = obstacles.map((o) => {
            const diff = lastPose.sub(o.center);
            const direction = diff.norm();
            let normal = Math.exp( - Math.pow(diff.length(), 2) / o.r);
            if (normal < 0.00001) {
                normal = 0;
            }
            const activation = direction.scale(1000 * normal / o.r);
            console.log("Activated " + activation.get(0).toString() + " " + activation.get(1).toString() + " at pos=" + x );
            return activation
        });

        const o = o_all.reduce((a, b) => {return a.add(b)}, Vec2.zero());

        for (let i = 0; i < steppers.length; i++) {
            let [x_p, v_p] = steppers[i](x[i], v[i], t, o.get(i));
            x[i] = x_p;
            v[i] = v_p;
        }
        poses.push([t, new Vec2(x[0], x[1])])
    }

    return poses;
}

export function makeDMPRollout(dmps: DMP, startState: number, startVelocity: number, goalState: number, tau: number, timeStep: number, obstacles?: number[]): [number, number][] {
    if (obstacles === undefined) {
        obstacles = [];
    }
    let poses: [number, number][] = [];

    const s = DMP.createPhaseFunctor(1, 0.01, tau);

    let stepper = makeStepper(dmps, startState, goalState, tau, timeStep,s);
    let x = startState;
    let v = startVelocity;
    let t = 0;
    poses.push([0, x]);

    while (t < tau + epsilon - timeStep) {
        t += timeStep;
        const [, lastPose] = poses[poses.length - 1];
        const o_all: number[] = obstacles.map((o) => {
            const diff = lastPose - o;
            const direction = diff > 0 ? 1: -1;
            const normal = Math.exp( - Math.pow(diff, 2));
            return  direction * normal;
        });

        const o = o_all.reduce((a, b) => {return a + b}, 0);


        let [x_p, v_p] = stepper(x, v, t, o);
        x = x_p;
        v = v_p;

        poses.push([t, x]);
    }

    return poses;
}

function makeStepper(dmp: DMP, x_0: number, g: number, tau: number, timestep: number, s: (number) => number) : (x: number, v: number, t: number, o: number) => [number, number] {
    return function (x: number, v: number, t: number, o: number) {
        return takePlanningStep(dmp, x, v, t, o, x_0, g, tau, timestep, s);
    }
}

function takePlanningStep(dmp: DMP, x: number, v: number, t: number, o: number, x_0: number, g: number, tau: number, timeStep:number, s: (number) => number): [number, number] {
    const f = dmp.f.evaluate.bind(dmp.f);
    // K( (g-x) - (g -x0)s + f(s)) - DV
    const s_t = s(t);
    const forcing = f(s_t);
    let v_dot = dmp.k * ((g - x) - (g - x_0) * s_t + forcing) - dmp.d * v + o;
    v_dot /= tau;
    let x_dot = v / tau;

    v += v_dot * timeStep;
    x += x_dot * timeStep;
    return [x, v]
}