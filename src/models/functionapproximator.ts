interface FunctionApproximator {
    evaluate(at: number) : number
}

class BasisFunctionApproximator implements FunctionApproximator {
    w: [number];
    basis: Basis;
    evaluate(at: number) : number {
        const phi = this.basis.evaluate(at);
        console.assert(phi.length == this.w.length, "Weights must be same dimension as basis functions");
        let weightedActivations = 0;
        let totalActivations = 0;
        for (let i = 0; i < phi.length; i++) {
            weightedActivations += this.w[i] * phi[i] * at;
            totalActivations += phi[i];
        }
        return weightedActivations / totalActivations;
    }
}