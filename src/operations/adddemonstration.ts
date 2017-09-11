class AddDemonstration implements Operation {
    trajectory: Trajectory;
    constructor(trajectory: Trajectory) {
        this.trajectory = trajectory;
    }
    apply(renderer: InteractiveCurveRenderer) {
        renderer.demonstrations.push(this.trajectory);
    }


}