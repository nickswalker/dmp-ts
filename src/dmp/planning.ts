function makeLinkedDMPRollout(dmps: [DMP], startState: Vec2, startVelocity: Vec2, goalState: Vec2, tau: number, timeStep: number): [Vec2, number][] {

    var poses: [number, number][][] = [];
    for (var i = 0; i < dmps.length; i++) {
        poses.push(makeDMPRollout(dmps[i],startState.get(i),startVelocity.get(i),goalState.get(i),tau,timeStep));
    }
    var finalPoses: [Vec2, number][] = [];
    for (var i = 0; i < poses[0].length; i++) {
        finalPoses.push([new Vec2(poses[0][i][0], poses[1][i][0]), poses[0][0][1]]);
    }
    return finalPoses;
}

function makeDMPRollout(dmp: DMP, startState: number, startVelocity: number, goalState: number, tau: number, timeStep:number) : [number, number][] {
    let createPhaseFunctor = (s_0: number)  => {
        return function (t: number) : number {
            // TODO: Is this the correct placement of tau?
            return s_0 * Math.exp(-dmp.alpha / tau * t)
        }
    };

    let f = (phase: number) => {
        let phi_s = dmp.basis.evaluate(phase);
        let normalizingFactor = sum(phi_s);
        return (dot(dmp.w, phi_s) * phase / normalizingFactor);
    };

    var poses: [number, number][] = [];

    var t = 0;
    let x_0 = startState;
    var x = x_0;
    var v = startVelocity;
    var g = goalState;
    let s = createPhaseFunctor(x_0);
    while (t < tau) {
        var v_dot = dmp.k * ((g - x) - (g - x_0) + f(s(t))) - dmp.d * v;
        v_dot /= tau;
        let x_dot = v / tau;

        v += v_dot * timeStep;
        x += x_dot * timeStep;
        poses.push([x, t]);
        t += timeStep;
    }

    return poses;
}