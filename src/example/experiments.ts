import {Demonstration, getDerivative} from "../dmp/learning.js";
import Vec2 from "../models/vec2.js";
import {demoToArrays, demoToCSV, sampleFunction} from "../utils.js";
import {learnFromDemonstrations} from "../dmp/learning.js";
import {makeLinkedDMPRollout} from "../dmp/planning.js";
import {toPhaseSpace} from "../dmp/learning.js";
import DMP from "../models/dmp.js";
import {generateWave, partialsToArrays, tuplesToArrays} from "../utils.js";
import Obstacle from "../models/obstacle.js";
import NearestNeighborApproximator from "../models/nearestneighborapproximator.js";

// Question 1
const demoXStep = Math.PI / 40;
const demoXLimit = Math.PI * 5;
const sampleTimeStep = 0.1;
const rolloutResolution = 0.05;

const sineDemo: Demonstration = generateWave(demoXLimit, sampleTimeStep, demoXStep);

const sineDerivative: [number, Vec2][] = getDerivative(sineDemo);
const sineSecondDerivative: [number, Vec2][] = getDerivative(sineDerivative);


export const [sineDotT, sineDotX, sineDotY] = partialsToArrays(sineDerivative);
export const [sineDotDotT, sineDotDotX, sineDotDotY] = partialsToArrays(sineSecondDerivative);
export const [sine_t, sine_demo_x, sine_demo_y] = demoToArrays(sineDemo);


// Question 2
const tau = 0.1 * 40;
const learnedDMPs: DMP[] = learnFromDemonstrations(1000, [sineDemo]);
const rollout = makeLinkedDMPRollout(learnedDMPs, new Vec2(0,0), new Vec2(0,0), new Vec2(demoXLimit, 0), tau, rolloutResolution);

export const [sineRolloutT, sineRolloutX, sineRolloutY] = demoToArrays(rollout);
export const [f_x_X, f_x_Y] = sampleFunction(learnedDMPs[0].f,0, 1, 0.01);
export const [f_y_X, f_y_Y] = sampleFunction(learnedDMPs[1].f,0, 1, 0.01);

// Question 3
const newGoalRollout = makeLinkedDMPRollout(learnedDMPs, new Vec2(0,-1), new Vec2(0,0), new Vec2(demoXLimit, 2), tau, rolloutResolution);

export const [newGoalRolloutT, newGoalRolloutX, newGoalRolloutY] = demoToArrays(newGoalRollout);

// Question 4
const halfSpeed = makeLinkedDMPRollout(learnedDMPs, new Vec2(1,-1), new Vec2(0,0), new Vec2(3, 2), tau * 2, rolloutResolution);

const doubleSpeed = makeLinkedDMPRollout(learnedDMPs, new Vec2(1,-1), new Vec2(0,0), new Vec2(3, 2), tau * 0.5, rolloutResolution);

export const [halfSpeedT, halfSpeedX, halfSpeedY] = demoToArrays(halfSpeed);
export const [doubleSpeedT, doubleSpeedX, doubleSpeedY] = demoToArrays(doubleSpeed);

// Question 5
// Thanks, StackOverflow: https://stackoverflow.com/a/36481059/1497463
function gaussion() {
    // Standard Normal variate using Box-Muller transform.
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let standard = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return standard / 60;

}
const noisySineDemo = generateWave(demoXLimit, sampleTimeStep, demoXStep, gaussion);

export const [noisySineT, noisySineX, noisySineY] = demoToArrays(noisySineDemo);

// Question 6
/*
const multiDMPs: DMP[] = learnFromDemonstrations(40, [sineDemo, noisySineDemo]);
const multiRollout = makeLinkedDMPRollout(multiDMPs, new Vec2(0,0), new Vec2(0,0), new Vec2(demoXLimit, 0), tau, rolloutResolution);

export const [multiRolloutT, multiRolloutX, multiRolloutY] = demoToArrays(multiRollout);
*/
// Question 7
const constantFunction = new NearestNeighborApproximator([[0,0]]);
const dmp = new DMP(40, constantFunction);
const noObstacleRollout = makeLinkedDMPRollout([dmp, dmp], new Vec2(-5,-5), new Vec2(0,0), new Vec2(5, 5), tau, rolloutResolution);
const obstacleRollout = makeLinkedDMPRollout([dmp, dmp], new Vec2(-5,-5), new Vec2(0,0), new Vec2(5, 5), tau, rolloutResolution, [new Obstacle(new Vec2(-3, -3.5), 1)]);

export const [noObstacleRolloutT, noObstacleRolloutX, noObstacleRolloutY] = demoToArrays(noObstacleRollout);
export const [obstacleRolloutT, obstacleRolloutX, obstacleRolloutY] = demoToArrays(obstacleRollout);
