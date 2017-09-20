import NearestNeighborApproximator from "../src/models/nearestneighborapproximator";
import {assert, expect} from "chai";
import GaussianBasis from "../src/dmp/gaussianbasis";
import BasisFunctionApproximator from "../src/models/basisfunctionapproximator";
import {generateWaveNoT} from "../src/utils";
describe('LinearInterpolationApproximator', () => {
    const xStep = Math.PI / 20;
    const maxX = Math.PI * 2;
    const samples: [number, number][] = generateWaveNoT(maxX, xStep);
    const approximator = new NearestNeighborApproximator(samples);

    describe('#learn', () => {
        it('should exactly mimic sampled values', () => {
            assert.equal(approximator.evaluate(0), Math.sin(0), "Approximator should return 0 for input 0.");
            assert.equal(approximator.evaluate(xStep), Math.sin(xStep), "Approximator should return sin(samplePhaseStep).");
            assert.equal(approximator.evaluate(maxX), Math.sin(maxX), "Approxmator should return 0 for input 2PI.");
        });
        it('should interpolate intermediate values', () => {
            for (let i = 0; i < maxX; i++) {
                const intermediateApprox = approximator.evaluate(i + (xStep / 2));
                const intermediateTrue = (Math.sin(i) + Math.sin(i + xStep)) / 2.0;
                assert.approximately( intermediateApprox, intermediateTrue, 0.01, "Failed for i=" + i.toString());
            }

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

    const unitNormalSamples: [number, number][] = [0.1, 0.5, 1].map((value): [number, number] => {return [value, GaussianBasis.evaluateSingle(value, 1, 0)]});
    const denseUnitNormalSamples: [number, number][] = [0.1, 0.3, 0.5, 0.7, 1].map((value): [number, number] => {return [value, GaussianBasis.evaluateSingle(value, 1, 0)]});
    const bigBases = GaussianBasis.equallyDistributed(3);

    describe('#learn', () => {
        it('should fail to fit under determined system', () => {
            const sample: [number, number] = [.5, GaussianBasis.evaluateSingle(.5,1,0)];
            assert.throws(() => {
                const approximator = BasisFunctionApproximator.learn([sample], bigBases);
            });

        });
        it('should correctly fit fully determined system', () => {
            const approximator = BasisFunctionApproximator.learn(unitNormalSamples, bigBases);
            const errors: number[] = unitNormalSamples.map((sample) => {return Math.abs(approximator.evaluate(sample[0]) - sample[1])});
            unitNormalSamples.forEach((sample) => { assert.approximately(approximator.evaluate(sample[0]), sample[1], 0.01);});
            assert.isBelow(errors.reduce((a, b) => {return a + b}), 0.01);
        });
        it('should correctly fit over-determined system', () => {
            const approximator = BasisFunctionApproximator.learn(denseUnitNormalSamples, bigBases);
            const errors: number[] = denseUnitNormalSamples.map((sample) => {return Math.abs(approximator.evaluate(sample[0]) - sample[1])});
            denseUnitNormalSamples.forEach((sample) => { assert.approximately(approximator.evaluate(sample[0]), sample[1], 0.7);});
            assert.isBelow(errors.reduce((a, b) => {return a + b}), 3.0);

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
