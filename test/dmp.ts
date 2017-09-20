import Vec2 from "../src/models/vec2";
import {Demonstration, getDerivative, learnFromDemonstrations, toPhaseSpace} from "../src/dmp/learning";
import {makeDMPRollout, makeLinkedDMPRollout} from "../src/dmp/planning";
import DMP from "../src/models/dmp";
import NearestNeighborApproximator from "../src/models/nearestneighborapproximator";
import {assert} from "chai";
import Obstacle from "../src/models/obstacle";

describe('DMP', () => {
    const samplePhaseStep = Math.PI / 20;
    const trajectoryPhaseDuration = Math.PI * 2;
    const sampleTimeStep = 0.1;

    const sineDemo: Demonstration = function() {
        // Move through the sine wave, collecting samples
        let demonstration: [number, Vec2][] = [];
        let timestamp = 0;
        for(let x = 0; x <= trajectoryPhaseDuration; x += samplePhaseStep) {
            const y = Math.sin(x);
            demonstration.push([timestamp, new Vec2(x, y)]);
            timestamp += sampleTimeStep;
        }
        return demonstration;
    }();

    const denseSineDemo: Demonstration = function() {
        // Move through the sine wave, collecting samples
        let demonstration: [number, Vec2][] = [];
        let timestamp = 0;
        for(let x = 0; x <= trajectoryPhaseDuration; x += 0.01) {
            const y = Math.sin(x);
            demonstration.push([timestamp, new Vec2(x, y)]);
            timestamp += 0.01;
        }
        return demonstration;
    }();

    const lineDemo: Demonstration = function () {
        const line: [number, Vec2][] = [];
        for (let i = 0; i <= 20; i++) {
            line.push([i * sampleTimeStep, new Vec2(i, i)]);
        }
        return line;
    }();

    describe('#learn', () => {
        it('should converge for a single demonstration', () => {
            const tau = 0.1 * 40;
            const learnedDMPs = learnFromDemonstrations(40, [sineDemo]);
            const rollout = makeLinkedDMPRollout(learnedDMPs, new Vec2(0,0), new Vec2(0,0), new Vec2(trajectoryPhaseDuration, 0), tau, sampleTimeStep);

            const [finalTime, finalRolloutState] = rollout[rollout.length - 1];
            const [, finalDemoState] = sineDemo[sineDemo.length - 1];
            assert.approximately(finalRolloutState.get(0),finalDemoState.get(0), 0.1, "X position incorrect");
            assert.approximately(finalRolloutState.get(1),finalDemoState.get(1), 0.1, "Y position incorrect" );
        });
        it
    });

    describe('#plan', () => {
        const constantFunction = new NearestNeighborApproximator([[0,0]]);
        const dmp = new DMP(40, constantFunction);
        const rollout: [number, number][] = makeDMPRollout(dmp, 0, 0, 1, 1, 0.05);
        const obstacleRollout = makeDMPRollout(dmp, 0, 0, 1, 1, 0.05, [0.5]);
        it('rollout with neutral forcing term should converge', () => {
            const [lastTime, lastPos] = rollout[rollout.length - 1];
            assert.approximately(lastTime, 1, 0.01, "Should last for one second.");
            assert.approximately(lastPos, 1, 0.06, "Should converge to one.");
        });
        it('rollout with neutral forcing term should not overshoot', () => {
            rollout.forEach((value) => {assert.isBelow(value[1], 1.0)});
        });


    });


    describe('#normalize', () => {
        const [phaseLineDemo, tau]: [Demonstration, number] = toPhaseSpace(lineDemo);
        it('should leave points undisturbed', () => {
            assert.equal(lineDemo.length, phaseLineDemo.length );
            for (let i = 0; i < phaseLineDemo.length; i++) {
                assert.equal(phaseLineDemo[i][1], lineDemo[i][1], "Point should be undisturbed");
            }
        });
        it('should calculate the duration of the trajectory correctly', () => {
            assert.approximately(tau, 2.0, 0.01);
        });
        it('should map onto (0, 1]', () => {
            phaseLineDemo.forEach((point) => {assert.isTrue(0 < point[0] && point[0] <= 1.0)});
        });
    });


    describe('#derivative', () => {
        const sineDerivative: [number, Vec2][] = getDerivative(sineDemo);
        const lineDerivative: [number, Vec2][] = getDerivative(lineDemo);
        const denseSineDerivative: [number, Vec2][] = getDerivative(denseSineDemo);
        const denseSineSecondDerivative: [number, Vec2][] = getDerivative(denseSineDerivative);
        it('should return slope of a line', () => {
            assert.equal(lineDerivative[0][1].get(0), lineDerivative[1][1].get(0), "Derivative should be constant across line");
            assert.equal(lineDerivative[0][1].get(1), lineDerivative[1][1].get(1), "Derivative should be constant across line");
        });
        it('sine derivative should approximate cosine', () => {
            denseSineDerivative.forEach((value) => {
                const [t, point] = value;
                assert.approximately(point.get(1), Math.cos(t), 0.01, "For input " + t.toString())
            });
        });
        it('sine second derivative should approximate negative sine', () => {
            denseSineSecondDerivative.forEach((value) => {
                const [t, point] = value;
                assert.approximately(point.get(1), -Math.sin(t), 0.02, "For input " + t.toString())
            });
        });
        it('should have the same time series', () => {
            for (let i = 0; i < sineDerivative.length; i++) {
                assert.equal(sineDerivative[i][0], sineDemo[i][0]);
            }
            for (let i = 0; i < lineDerivative.length; i++) {
                assert.equal(lineDerivative[i][0], lineDemo[i][0]);
            }
        });

    });
});

