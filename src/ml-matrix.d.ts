declare module ml_matrix
{
    class Matrix {
        constructor(rows: (number|number[]|Matrix), columns: number);

        static columnVector(newData: number[]): Matrix;

        static rowVector(newData: number[]): Matrix;

        mmul(other: Matrix): Matrix;

        pseudoInverse(threshold?: number): Matrix;

        clone(): Matrix;

        transposeView(): MatrixTransposeView;

        isColumnVector(): boolean;

        isRowVector(): boolean;

        to1DArray(): number[];

    }

    class MatrixTransposeView extends Matrix {
    }

    function solve(A: Matrix, b: Matrix, useSVD?: boolean);
}