enum MatrixIndices {
  M00 = 0,
  M01 = 1,
  M02 = 2,
  M10 = 3,
  M11 = 4,
  M12 = 5,
  M20 = 6,
  M21 = 7,
  M22 = 8,
}

export class M3x3 {
  matrix: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
  ];

  constructor() {
    this.matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  }

  multiply(m: M3x3) {
    const output = new M3x3();

    output.matrix = [
      this.matrix[MatrixIndices.M00] * m.matrix[MatrixIndices.M00] +
        this.matrix[MatrixIndices.M10] * m.matrix[MatrixIndices.M01] +
        this.matrix[MatrixIndices.M20] * m.matrix[MatrixIndices.M02],
      this.matrix[MatrixIndices.M01] * m.matrix[MatrixIndices.M00] +
        this.matrix[MatrixIndices.M11] * m.matrix[MatrixIndices.M01] +
        this.matrix[MatrixIndices.M21] * m.matrix[MatrixIndices.M02],
      this.matrix[MatrixIndices.M02] * m.matrix[MatrixIndices.M00] +
        this.matrix[MatrixIndices.M12] * m.matrix[MatrixIndices.M01] +
        this.matrix[MatrixIndices.M22] * m.matrix[MatrixIndices.M02],

      this.matrix[MatrixIndices.M00] * m.matrix[MatrixIndices.M10] +
        this.matrix[MatrixIndices.M10] * m.matrix[MatrixIndices.M11] +
        this.matrix[MatrixIndices.M20] * m.matrix[MatrixIndices.M12],
      this.matrix[MatrixIndices.M01] * m.matrix[MatrixIndices.M10] +
        this.matrix[MatrixIndices.M11] * m.matrix[MatrixIndices.M11] +
        this.matrix[MatrixIndices.M21] * m.matrix[MatrixIndices.M12],
      this.matrix[MatrixIndices.M02] * m.matrix[MatrixIndices.M10] +
        this.matrix[MatrixIndices.M12] * m.matrix[MatrixIndices.M11] +
        this.matrix[MatrixIndices.M22] * m.matrix[MatrixIndices.M12],

      this.matrix[MatrixIndices.M00] * m.matrix[MatrixIndices.M20] +
        this.matrix[MatrixIndices.M10] * m.matrix[MatrixIndices.M21] +
        this.matrix[MatrixIndices.M20] * m.matrix[MatrixIndices.M22],
      this.matrix[MatrixIndices.M01] * m.matrix[MatrixIndices.M20] +
        this.matrix[MatrixIndices.M11] * m.matrix[MatrixIndices.M21] +
        this.matrix[MatrixIndices.M21] * m.matrix[MatrixIndices.M22],
      this.matrix[MatrixIndices.M02] * m.matrix[MatrixIndices.M20] +
        this.matrix[MatrixIndices.M12] * m.matrix[MatrixIndices.M21] +
        this.matrix[MatrixIndices.M22] * m.matrix[MatrixIndices.M22],
    ];

    return output;
  }

  transition(x: number, y: number) {
    const output = new M3x3();

    output.matrix = [
      this.matrix[MatrixIndices.M00],
      this.matrix[MatrixIndices.M01],
      this.matrix[MatrixIndices.M02],

      this.matrix[MatrixIndices.M10],
      this.matrix[MatrixIndices.M11],
      this.matrix[MatrixIndices.M12],

      x * this.matrix[MatrixIndices.M00] +
        y * this.matrix[MatrixIndices.M10] +
        this.matrix[MatrixIndices.M20],
      x * this.matrix[MatrixIndices.M01] +
        y * this.matrix[MatrixIndices.M11] +
        this.matrix[MatrixIndices.M21],
      x * this.matrix[MatrixIndices.M02] +
        y * this.matrix[MatrixIndices.M12] +
        this.matrix[MatrixIndices.M22],
    ];

    return output;
  }

  scale(x: number, y: number) {
    const output = new M3x3();

    output.matrix = [
      this.matrix[MatrixIndices.M00] * x,
      this.matrix[MatrixIndices.M01] * x,
      this.matrix[MatrixIndices.M02] * x,

      this.matrix[MatrixIndices.M10] * y,
      this.matrix[MatrixIndices.M11] * y,
      this.matrix[MatrixIndices.M12] * y,

      this.matrix[MatrixIndices.M20],
      this.matrix[MatrixIndices.M21],
      this.matrix[MatrixIndices.M22],
    ];

    return output;
  }

  getFloatArray() {
    return new Float32Array(this.matrix);
  }
}
