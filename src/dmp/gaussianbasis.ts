import {Basis} from "./basis.js"
function linspace(a,b,n) {
    if(typeof n === "undefined") n = Math.max(Math.round(b-a)+1,1);
    if(n<2) { return n===1?[a]:[]; }
    var i,ret = Array(n);
    n--;
    for(i=n;i>=0;i--) { ret[i] = (i*b+(n-i)*a)/n; }
    return ret;
}

export default class GaussianBasis implements Basis{
    centers: number[];
    widths: number[];

    // Lay the bases out evenly over [0,1]
    static equallyDistributed(numBases: number) : GaussianBasis {
        console.assert(numBases > 0);
        const centers = linspace(0, 1, numBases);
        const widths = Array(numBases);
        for (let i = 0; i < widths.length; i++) {
            widths[i] = 4;
        }
        return new GaussianBasis(centers, widths);
    }

    constructor(centers: number[], widths: number[]) {
        this.centers = centers;
        this.widths = widths;
    }

    evaluate(s: number): number[] {
        let result: number[] = [];
        for (let i = 0; i < this.centers.length; i++) {
            const c = this.centers[i];
            const w = this.widths[i];
            result.push(GaussianBasis.evaluateSingle(s, w, c));
        }
        return result;
    }

    size(): number {
        return this.centers.length;
    }

    static evaluateSingle(at: number, width: number, center: number): number {
        return Math.exp(-width * Math.pow(at - center, 2.0))
    }

    formatForRegression(s: number, f_s: number): number {
        // TODO: Is this the correct way to handle s=0?
        if (s === 0) {
            return 0;
        }
        const psi_s = this.evaluate(s);
        return (psi_s.reduce((a,b) => {return a+b}) / s) * f_s;
    }
}