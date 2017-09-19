import {Demonstration} from "./dmp/learning.js";

export function demoToCSV(demonstration: Demonstration): string {
    let result = "";
    for (let j = 0; j < 2; j) {
        for (let i = 0; i < demonstration.length; i++) {
            const value = demonstration[i][1].get(j);
            result += value.toString() + ",";
        }
        result += "";
    }
    return result;
}