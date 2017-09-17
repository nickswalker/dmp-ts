declare var Vec2: any;
declare var learnFromDemonstrations: any;
declare var makeDMPRollout: any;
declare var DMP: any;

const samplePhaseStep = Math.PI / 20;
const trajectoryPhaseDuration = Math.PI * 2;
const sampleTimeStep = 0.1;

// Move through the sine wave, collecting samples
let samples: [number, any][] = [];
let timestamp = 0;
for(let phase = 0; phase < trajectoryPhaseDuration; phase += samplePhaseStep) {
    const value = Math.sin(phase);
    samples.push([timestamp, new Vec2(phase, value)]);
}

let learnedDMPs = learnFromDemonstrations(1000, samples);
let rollout = makeDMPRollout(learnedDMPs, new Vec2(0,0), new Vec2(0,0), new Vec2(trajectoryPhaseDuration, 0), 0.1 * 40, 0.1);

console.log(rollout);