export interface Basis {
    evaluate(s: number): number[];
    size(): number;
    formatForRegression(s: number, f_s: number): number;
}