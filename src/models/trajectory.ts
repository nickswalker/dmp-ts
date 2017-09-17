import Vec2 from "./vec2.js";

export default class Trajectory {
    points: Vec2[];
    stamps: number[];
    _cached_path: Path2D;
    private dirty: boolean = true;

    constructor(points: Vec2[], stamps: number[]) {
        this.points = points;
        this.stamps = stamps;
    }

    getPath(): Path2D {
        if (!this.dirty) {
            return this._cached_path;
        }
        let newPath = new Path2D();
        const firstPoint = this.points[0];
        newPath.moveTo(firstPoint.x, firstPoint.y);
        for (let i = 1; i < this.points.length; i++) {
            const nextPoint = this.points[i];
            newPath.lineTo(nextPoint.x, nextPoint.y);
        }

        this._cached_path = newPath;
        this.dirty = false;

        return newPath;
    }

    append(point: Vec2, stamp: number) {
        this.points.push(point);
        this.stamps.push(stamp);
        this.dirty = true;
    }

}