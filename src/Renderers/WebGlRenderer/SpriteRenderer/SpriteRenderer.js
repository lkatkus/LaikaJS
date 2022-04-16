import { M3x3, Point } from '../../utils';
import { Material } from '../Material';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;

  uniform mat3 u_world;
  uniform mat3 u_object;
  uniform vec2 u_frame;

  varying vec2 v_texCoord;
  void main(){
    gl_Position = vec4(u_world * u_object * vec3(a_position, 1), 1);
    v_texCoord = a_texCoord + u_frame;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform sampler2D u_image;
  varying vec2 v_texCoord;

  void main(){
    gl_FragColor = texture2D(u_image, v_texCoord);
  }
`;

const createRectArray = (x = 0, y = 0, w = 1, h = 1) => {
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
};

class SpriteRenderer {
  constructor(gl, img_url, options = {}) {
    this.gl = gl;
    this.isLoaded = false;
    this.material = new Material(gl, VERTEX_SHADER, FRAGMENT_SHADER);

    this.size = new Point(64, 64);

    if ('width' in options) {
      this.size.x = options.width * 1;
    }
    if ('height' in options) {
      this.size.y = options.height * 1;
    }
    if ('renderWidth' in options) {
      this.size.renderWidth = options.renderWidth;
    }
    if ('renderHeight' in options) {
      this.size.renderHeight = options.renderHeight;
    }

    this.image = img_url;

    this.setup();
  }

  setup() {
    let gl = this.gl;

    gl.useProgram(this.material.program);
    this.gl_tex = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

    this.uv_x = this.size.x / this.image.width;
    this.uv_y = this.size.y / this.image.height;

    this.tex_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      createRectArray(0, 0, this.uv_x, this.uv_y),
      gl.STATIC_DRAW
    );

    this.geo_buff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      createRectArray(
        0,
        0,
        this.size.renderWidth || this.size.x,
        this.size.renderHeight || this.size.y
      ),
      gl.STATIC_DRAW
    );

    this.aPositionLoc = gl.getAttribLocation(
      this.material.program,
      'a_position'
    );
    this.aTexcoordLoc = gl.getAttribLocation(
      this.material.program,
      'a_texCoord'
    );
    this.uImageLoc = gl.getUniformLocation(this.material.program, 'u_image');
    this.uWorldLoc = gl.getUniformLocation(this.material.program, 'u_world');
    this.uObjectLoc = gl.getUniformLocation(this.material.program, 'u_object');
    this.uFrameLoc = gl.getUniformLocation(this.material.program, 'u_frame');

    gl.useProgram(null);
  }

  updateTexture(newImage, tileSize) {
    this.image = newImage.src;
    this.size = new Point(newImage.width, newImage.height);
    this.size.renderWidth = tileSize * (newImage.drawWidthOffset || 1);
    this.size.renderHeight = tileSize * (newImage.drawHeightOffset || 1);

    this.setup();
  }

  render(position = { x: 0, y: 0 }, frames = { x: 0, y: 0 }, worldSpaceMatrix) {
    let gl = this.gl;

    let frame_x = Math.floor(frames.x) * this.uv_x;
    let frame_y = Math.floor(frames.y) * this.uv_y;
    let oMat = new M3x3().transition(position.x, position.y);

    gl.useProgram(this.material.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.uniform1i(this.uImageLoc, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.tex_buff);
    gl.enableVertexAttribArray(this.aTexcoordLoc);
    gl.vertexAttribPointer(this.aTexcoordLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.geo_buff);
    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(this.uFrameLoc, frame_x, frame_y);
    gl.uniformMatrix3fv(this.uObjectLoc, false, oMat.getFloatArray());
    gl.uniformMatrix3fv(
      this.uWorldLoc,
      false,
      worldSpaceMatrix.getFloatArray()
    );

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

    gl.useProgram(null);
  }
}

export default SpriteRenderer;
