
// Extend CanvasRenderingContext2D
interface CanvasRenderingContext2D {
    fill(path: Path2D): void;

    stroke(path: Path2D): void;

    clip(path: Path2D, fillRule?: string): void;
}
