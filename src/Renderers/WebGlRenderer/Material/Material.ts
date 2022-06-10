class Material {
  gl: WebGLRenderingContext;
  vsShader: string;
  fsShader: string;
  program: WebGLProgram;

  constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
    this.gl = gl;

    const vsShader = this.getShader(vs, gl.VERTEX_SHADER);
    const fsShader = this.getShader(fs, gl.FRAGMENT_SHADER);

    if (vsShader && fsShader) {
      this.program = gl.createProgram();
      gl.attachShader(this.program, vsShader);
      gl.attachShader(this.program, fsShader);
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        console.error(
          'Cannot load shader \n' + gl.getProgramInfoLog(this.program)
        );
        return null;
      }

      gl.detachShader(this.program, vsShader);
      gl.detachShader(this.program, fsShader);
      gl.deleteShader(vsShader);
      gl.deleteShader(fsShader);

      gl.useProgram(null);
    }
  }

  getShader(script: string, type: number) {
    const gl = this.gl;
    const output = gl.createShader(type);
    gl.shaderSource(output, script);
    gl.compileShader(output);

    if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) {
      console.error('Shader error: \n:' + gl.getShaderInfoLog(output));
      return null;
    }

    return output;
  }
}

export default Material;
