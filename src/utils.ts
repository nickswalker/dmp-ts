import {Demonstration} from "./dmp/learning.js";
import Vec2 from "./models/vec2.js";
import {FunctionApproximator} from "./models/functionapproximator";

export function demoToCSV(demonstration: Demonstration): string {
    let result = "";
    for (let j = 0; j < 2; j++) {
        for (let i = 0; i < demonstration.length; i++) {
            const value = demonstration[i][1].get(j);
            result += value.toString() + ",";
        }
        result += "";
    }
    return result;
}

// Time series, wrt x, wrt y
export function partialsToArrays(derivative: [number, Vec2][]) : [number[], number[], number[]] {
    let t: number[] = [];
    let x: number[] = [];
    let y: number[] = [];
    for (let i = 0; i < derivative.length; i++) {
        let [t_i, point_i] = derivative[i];
        t.push(t_i);
        x.push(point_i.get(0));
        y.push(point_i.get(1));
    }
    return [t, x, y];
}

export function tuplesToArrays(tuples: [number, number][]): [number[], number[]] {
    let x: number[] = [];
    let y: number[] = [];

    for (let i = 0; i < tuples.length; i++) {
        let [x_i, y_i] = tuples[i];
        x.push(x_i);
        y.push(y_i);
    }
    return [x, y];
}

// array for t, x, y
export function demoToArrays(demonstration: Demonstration): [number[], number[], number[]] {
    let t: number[] = [];
    let x: number[] = [];
    let y: number[] = [];

    for (let i = 0; i < demonstration.length; i++) {
        let [t_i, pair] = demonstration[i];
        const x_i = pair.get(0);
        const y_i = pair.get(1);
        t.push(t_i);
        x.push(x_i);
        y.push(y_i);

    }

    return [t, x, y];
}

export function generateWave(maxX: number, timeStep: number, xStep: number, noise?: () => number): Demonstration {
    if (noise === undefined) {
        noise = () => {return 0};
    }
    // Move through the sine wave, collecting samples
    let demonstration: [number, Vec2][] = [];
    let timestamp = 0;
    for(let x = 0; x <= maxX; x += xStep) {
        const y = Math.sin(x);
        demonstration.push([timestamp, new Vec2(x + noise(), y + noise())]);
        timestamp += timeStep;
    }
    return demonstration;
}

export function generateWaveNoT(maxX: number, xStep: number, noise?: () => number): [number, number][] {
    const wave = generateWave(maxX, 0.01, xStep, noise);
    // Move through the sine wave, collecting samples
    let samples: [number, number][] = [];
    for (let i = 0; i < wave.length; i++) {
        const [, wave_i] = wave[i];
        samples.push([wave_i.get(0), wave_i.get(1)]);
    }
    return samples;
}


// array for t, x, y
export function sampleFunction(f: FunctionApproximator, start: number, stop: number, resolution: number): [number[], number[]] {
    let x: number[] = [];
    let y: number[] = [];

    for (let i = start; i < stop; i += resolution) {
        let y_i = f.evaluate(i);
        x.push(i);
        y.push(y_i);

    }
    return [x, y];
}