import { Material } from '../Material';
import { Point } from '../utils';

const TILES_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_frame;

  uniform mat3 u_world;
  uniform mat3 u_object;

  varying vec2 v_texCoord;
  void main(){
    gl_Position = vec4(u_world * vec3(a_position, 1), 1);
    v_texCoord = a_frame;
  }
`;

const TILES_FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

class TilesRenderer {
  constructor(gl, img_url) {
    this.gl = gl;
    this.isLoaded = false;
    this.material = new Material(
      gl,
      TILES_VERTEX_SHADER,
      TILES_FRAGMENT_SHADER
    );
    this.size = new Point(60, 60);
    this.image = img_url;

    this.setup();
  }

  static createRectArray(x = 0, y = 0, w = 1, h = 1) {
    return new Float32Array([
      x,
      y,
      x + w,
      y,
      x,
      y + h,
      x,
      y + h,
      x + w,
      y,
      x + w,
      y + h,
    ]);
  }

  setup() {
    const gl = this.gl;

    gl.useProgram(this.material.program);
    this.gl_tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.image
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
  }

  render(tilesToRender, worldSpaceMatrix) {
    const gl = this.gl;

    const uv_x = this.size.x / this.image.width;
    const uv_y = this.size.y / this.image.height;

    this.geo_buff = gl.createBuffer();
    this.frame_buff = gl.createBuffer();

    let geoBufferData = [];
    let frameBufferData = [];

    for (let tile of tilesToRender) {
      const frame = {
        x: tile.sx > 0 ? (tile.sx * 20) / this.image.width : 0,
        y: tile.sy > 0 ? (tile.sy * 20) / this.image.height : 0,
      };

      geoBufferData = new Float32Array([
        ...geoBufferData,
        ...TilesRenderer.createRectArray(
          tile.dx,
          tile.dy,
          tile.dWidth,
          tile.dHeight
        ),
      ]);

      frameBufferData = new Float32Array([
        ...frameBufferData,
        ...TilesRenderer.createRectArray(
          frame.x * uv_x,
          frame.y * uv_y,
          uv_x,
          uv_x
        ),
      ]);
    }

    gl.useProgram(this.material.program);

    this.aFrameLoc = gl.getAttribLocation(this.material.program, 'a_frame');
    this.aPositionLoc = gl.getAttribLocation(
      this.material.program,
      'a_position'
    );

    this.uImageLoc = gl.getUniformLocation(this.material.program, 'u_image');
    this.uWorldLoc = gl.getUniformLocation(this.material.program, 'u_world');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.uniform1i(this.uImageLoc, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.frame_buff);
    gl.bufferData(gl.ARRAY_BUFFER, frameBufferData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.aFrameLoc);
    gl.vertexAttribPointer(this.aFrameLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.bufferData(gl.ARRAY_BUFFER, geoBufferData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix3fv(
      this.uWorldLoc,
      false,
      worldSpaceMatrix.getFloatArray()
    );

    gl.drawArrays(gl.TRIANGLES, 0, tilesToRender.length * 6);

    gl.useProgram(null);
  }
}

export default TilesRenderer