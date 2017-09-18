import Vec2 from "../src/models/vec2";
import {learnFromDemonstrations} from "../src/dmp/learning";
import {makeLinkedDMPRollout} from "../src/dmp/planning";
import NearestNeighborApproximator from "../src/models/nearestneighborapproximator";
import {assert} from "chai";
describe('LinearInterpolationApproximator', () => {
    const samplePhaseStep = Math.PI / 20;
    const trajectoryPhaseDuration = Math.PI * 2;
    const samples: [number, number][] = function (){
        // Move through the sine wave, collecting samples
        let samples: [number, number][] = [];

        for(let phase = 0; phase <= trajectoryPhaseDuration; phase += samplePhaseStep) {
            const value = Math.sin(phase);
            samples.push([phase, value]);

        }
        return samples;
    }();

    describe('#learn', () => {
        it('should exactly mimic sampled values', () => {
            const approximator = new NearestNeighborApproximator(samples);
            assert.equal(approximator.evaluate(0), Math.sin(0), "Approximator should return 0 for input 0.");
            assert.equal(approximator.evaluate(samplePhaseStep), Math.sin(samplePhaseStep), "Approximator should return sin(samplePhaseStep).");
            assert.equal(approximator.evaluate(trajectoryPhaseDuration), Math.sin(trajectoryPhaseDuration), "Approxmator should return 0 for input 2PI.");
        });
        it('should interpolate intermediate values', () => {
            const approximator = new NearestNeighborApproximator(samples);
            const intermediateApprox = approximator.evaluate(samplePhaseStep / 2);
            const intermediateTrue = (Math.sin(0) + Math.sin(samplePhaseStep)) / 2.0;
            assert.equal( intermediateApprox, intermediateTrue, "Approximator should interpolate values.")
        });
        it('should gracefully handle a single sample', () => {
            const approximator = new NearestNeighborApproximator([[0, 1]]);

            assert.equal( approximator.evaluate(1), 1.0, "Approximator should generalize below.");
            assert.equal( approximator.evaluate(-1), 1.0, "Approximator should generalize above.");
        });
    });
});

