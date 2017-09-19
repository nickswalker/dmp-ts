import NearestNeighborApproximator from "../src/models/nearestneighborapproximator";
import {assert} from "chai";
import GaussianBasis from "../src/dmp/gaussianbasis";
import BasisFunctionApproximator from "../src/models/basisfunctionapproximator";
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

describe('BasisFunctionApproximator', () => {
    const singleBasis = new GaussianBasis([0], [1]);
    const splitBasis = new GaussianBasis([-1, 1], [1, 1]);
    const zeroApproximator = new BasisFunctionApproximator([0, 0], splitBasis);
    const identityApproximator = new BasisFunctionApproximator([1], singleBasis);
    const halfActivatedApproximator = new BasisFunctionApproximator([0, 1], splitBasis);

    const unitNormalSamples: [number, number][] = [0.1, 0.5, 1].map((value): [number, number] => {return [value, singleBasis.evaluate(value)[0]]});
    const bigBases = GaussianBasis.equallyDistributed(3);

    describe('#learn', () => {
        it('should correctly fit samples from the basis', () => {
            const approximator = BasisFunctionApproximator.learn(unitNormalSamples, bigBases);
            const errors: number[] = unitNormalSamples.map((sample) => {return Math.abs(approximator.evaluate(sample[0]) - sample[1])});
            unitNormalSamples.forEach((sample) => { assert.approximately(approximator.evaluate(sample[0]), sample[1], 0.01);});
            assert.isBelow(errors.reduce((a, b) => {return a + b}), 0.01);

        });
    });

    describe('#evaluate', () => {
        it('should return 0 for 0 weights', () => {
            assert.equal(zeroApproximator.evaluate(0), 0);
            assert.equal(zeroApproximator.evaluate(1), 0);
            assert.equal(zeroApproximator.evaluate(-100), 0);
        });
        it('should consider not consider bases with 0 weights', () => {
            assert.approximately(halfActivatedApproximator.evaluate(1), 1, 0.05);
            assert.isBelow(halfActivatedApproximator.evaluate(-1), 1.0);
        });
        it('should be linear with a single basis function', () => {
            [-1, 0, 1, 2].forEach((value => {assert.equal(identityApproximator.evaluate(value), value)}));
        });
    });
});

describe('GaussianBasis', () => {
    const singleBasis = new GaussianBasis([0], [1]);
    const splitBasis = new GaussianBasis([-1, 1], [1, 1]);

    describe('#evaluate', () => {
        it('should be symmetric', () => {
            assert.deepEqual(splitBasis.evaluate(-2), splitBasis.evaluate(2).reverse());
            assert.deepEqual(singleBasis.evaluate(1), singleBasis.evaluate(-1).reverse());
        });
        it('should give mean at center', () => {
            assert.deepEqual(singleBasis.evaluate(0), [1.0]);
        });
    });
});
