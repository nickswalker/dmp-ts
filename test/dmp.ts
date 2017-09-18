import Vec2 from "../src/models/vec2";
import {Demonstration, getDerivative, learnFromDemonstrations, normalizeDemonstration} from "../src/dmp/learning";
import {makeDMPRollout, makeLinkedDMPRollout} from "../src/dmp/planning";
import DMP from "../src/models/dmp";
import NearestNeighborApproximator from "../src/models/nearestneighborapproximator";
import {assert} from "chai";

describe('DMP', () => {
    const samplePhaseStep = Math.PI / 20;
    const trajectoryPhaseDuration = Math.PI * 2;
    const sampleTimeStep = 0.1;

    const demonstration: Demonstration = function() {
        // Move through the sine wave, collecting samples
        let demonstration: [number, Vec2][] = [];
        let timestamp = 0;
        for(let phase = 0; phase <= trajectoryPhaseDuration; phase += samplePhaseStep) {
            const value = Math.sin(phase);
            demonstration.push([timestamp, new Vec2(phase, value)]);
            timestamp += sampleTimeStep;
        }
        return demonstration;
    }();

    describe('#learn', () => {
        it('should exactly mimic single demonstration', () => {
            const tau = 0.1 * 40;
            const learnedDMPs = learnFromDemonstrations(1000, [demonstration]);
            const rollout = makeLinkedDMPRollout(learnedDMPs, new Vec2(0,0), new Vec2(0,0), new Vec2(trajectoryPhaseDuration, 0), tau, sampleTimeStep);

            const [finalTime, finalState] = rollout[rollout.length - 1];
        });
    });

    describe('#plan', () => {
        it('rollout with neutral forcing term should be a line', () => {
            const constantFunction = new NearestNeighborApproximator([[0,0]]);
            const dmp = new DMP(1000, constantFunction);
            const rollout: [number, number][] = makeDMPRollout(dmp, 0, 0.01, 1, 1, 0.05);
            const [lastTime, lastPos] = rollout[rollout.length - 1];
            console.log(rollout);
            assert.approximately(lastTime, 1, 0.01, "Should last for one second.");
            assert.approximately(lastPos, 1, 0.02, "Should converge to one.");
        });
    });


    describe('#normalize', () => {
        it('should leave points undisturbed', () => {
            const line: [number, Vec2][] = [];
            for (let i = 0; i <= 20; i++) {
                line.push([i * sampleTimeStep, new Vec2(i, i)]);
            }
            const [demo, tau]: [Demonstration, number] = normalizeDemonstration(line);

            const [lastPhaseStamp, lastPoint] = demo[demo.length - 1];

            assert.approximately(tau, 2.0, 0.01, "Tau should reflect original duration of trajectory");
            assert.approximately(lastPhaseStamp, 1.0, 0.01, "Phase should be in [0, 1]");
            assert.equal(lastPoint, line[line.length - 1][1], "Point should be undisturbed");
        });
    });


    describe('#derivative', () => {
        it('should return slope of a line', () => {
            const line: [number, Vec2][] = [];
            for (let i = 0; i <= 10; i++) {
                line.push([i * sampleTimeStep, new Vec2(i, i)]);
            }
            const derivative: [number, Vec2][] = getDerivative(line);
            assert.equal(derivative[0][1].get(0), derivative[1][1].get(0), "Derivative should be constant across line");
            assert.equal(derivative[0][1].get(1), derivative[1][1].get(1), "Derivative should be constant across line");
        });
        it('sine derivative should approximate cosine', () => {
            const derivative: [number, Vec2][] = getDerivative(demonstration);
            const halfPiIndex = 10;
            assert.approximately(derivative[halfPiIndex][1].get(1), 0.0, 0.15, "Derivative of sine at half pi should be close to 0");
            assert.equal(derivative[0][1].get(0), derivative[1][1].get(0), "Derivative with respect to x should be constant");
        });
    });
});

