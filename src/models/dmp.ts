class DMP {
    k: number;
    d: number;
    alpha: number;
    w: [number];
    basis: Basis;

    constructor(k: number, d?: number) {
        this.k = k;
        // Use critical damping by default
        this.d = d ? d : 2.0 * Math.sqrt(k);
        this.alpha = 0.01;
    }

}