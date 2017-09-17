export function dot(a: number[], b: number[]): number {
    console.assert(a.length == b.length, "Vectors must be the same length");
    var result = 0;
    for (let i = 0; i < a.length; i++) {
        result += a[i] * b[i];
    }
    return result;
}

export function sum (a: number[]) {
    return a.reduce((acc, cur) => { return acc + cur});
}