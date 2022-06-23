import { IFlatColor, IGradient } from '../../Renderers.models';
import { Material } from '../Material';

const TILES_VERTEX_SHADER = `
  attribute vec2 a_cover_position;
  attribute vec4 a_cover_color;

  varying vec4 v_color;

  void main(){
    gl_Position = vec4(vec3(a_cover_position, 1), 1);

    v_color = a_cover_color;
  }
`;

const TILES_FRAGMENT_SHADER = `
  precision mediump float;
  
  varying vec4 v_color;

  void main(){
    gl_FragColor = v_color;
  }
`;

class SkyRenderer {
  gl: WebGLRenderingContext;
  material: Material;
  geo_buff: WebGLBuffer;
  color_buff: WebGLBuffer;
  geo_data: Float32Array;
  color_data: Float32Array;
  aPositionLoc: number;
  aColorLoc: number;
  bgColor: IFlatColor | IGradient;

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.material = new Material(
      gl,
      TILES_VERTEX_SHADER,
      TILES_FRAGMENT_SHADER
    );

    this.bgColor = { type: 'flat', color: [1, 1, 1] };

    this.setup();
  }

  createRectArray(x = 0, y = 0, w = 1, h = 1): number[] {
    return [x, y, x + w, y, x, y + h, x, y + h, x + w, y, x + w, y + h];
  }

  setup() {
    const { gl } = this;

    this.geo_buff = gl.createBuffer();
    this.color_buff = gl.createBuffer();

    this.geo_data = new Float32Array([
      ...this.createRectArray(-1, -1, 2, 2),
      ...this.createRectArray(1, 1, -2, -2),
    ]);
    this.color_data = new Float32Array([
      // BOTTOM LEFT
      1, 1, 0, 1,
      // TOP LEFT
      1, 0, 0, 1,
      // BOTTOM RIGHT
      1, 1, 0, 1,
      // TOP RIGHT
      1, 0, 0, 1,
      // BOTTOM RIGHT
      1, 1, 0, 1,
      // TOP LEFT
      1, 0, 0, 1,
    ]);

    gl.useProgram(this.material.program);

    this.initAttrs();

    gl.useProgram(null);
  }

  initAttrs() {
    const { gl } = this;

    this.aPositionLoc = gl.getAttribLocation(
      this.material.program,
      'a_cover_position'
    );
    this.aColorLoc = gl.getAttribLocation(
      this.material.program,
      'a_cover_color'
    );

    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.enableVertexAttribArray(this.aColorLoc);
  }

  mapColorToData() {
    if (this.bgColor.type === 'flat') {
      const color = this.bgColor.color;

      color.forEach((color, i) => {
        this.color_data[i + 4] = color;
        this.color_data[i + 3 * 4] = color;
        this.color_data[i + 5 * 4] = color;
      });
    } else {
      const color1 = this.bgColor.color[0];
      const color2 = this.bgColor.color[1];

      color1.forEach((color, i) => {
        this.color_data[i + 4] = color;
        this.color_data[i + 3 * 4] = color;
        this.color_data[i + 5 * 4] = color;
      });

      color2.forEach((color, i) => {
        this.color_data[i] = color;
        this.color_data[i + 2 * 4] = color;
        this.color_data[i + 4 * 4] = color;
      });
    }
  }

  render() {
    const { gl } = this;

    this.mapColorToData();

    gl.useProgram(this.material.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.bufferData(gl.ARRAY_BUFFER, this.geo_data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 16, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buff);
    gl.bufferData(gl.ARRAY_BUFFER, this.color_data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aColorLoc, 4, gl.FLOAT, false, 16, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.useProgram(null);
  }
}

export default SkyRenderer;
