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
    constructor(centers: number[], widths: number[]) {
        this.centers = centers;
        this.widths = widths;
    }

    evaluate(s: number): number[] {
        var result: number[] = [];
        for (let i = 0; i < this.centers.length; i++) {
            let c = this.centers[i];
            let w = this.widths[i];
            result.push(Math.exp(-w * Math.pow(s - c, 2.0)));
        }
        return result;
    }
}