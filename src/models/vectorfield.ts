import Vec2 from "./vec2.js";

export default interface VectorField {
    atPoint(point: Vec2): Vec2
}

class UniformVectorField implements VectorField {
    private vector: Vec2;

    constructor(vector: Vec2) {
        this.vector = vector
    }
    atPoint(point: Vec2): Vec2 {
        return this.vector;
    } s
}


class SinVectorField implements VectorField {
    atPoint(point: Vec2): Vec2 {
        return new Vec2(Math.sin(0.01 * point.x), Math.sin(0.01 * point.x));
    }
}