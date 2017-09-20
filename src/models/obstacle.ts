import Vec2 from "./vec2.js";

export default class Obstacle {
    center: Vec2;
    r: number;

    constructor(center: Vec2) {
        this.center = center;
    }
}