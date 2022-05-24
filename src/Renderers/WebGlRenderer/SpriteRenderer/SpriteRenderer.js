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

  createRectArray(x = 0, y = 0, w = 1, h = 1) {
    return [x, y, x + w, y, x, y + h, x, y + h, x + w, y, x + w, y + h];
  }

  combineGeoWithTexData(geoArr, texArr) {
    return [
      geoArr[0],
      geoArr[1],
      texArr[0],
      texArr[1],

      geoArr[2],
      geoArr[3],
      texArr[2],
      texArr[3],

      geoArr[4],
      geoArr[5],
      texArr[4],
      texArr[5],

      geoArr[6],
      geoArr[7],
      texArr[6],
      texArr[7],

      geoArr[8],
      geoArr[9],
      texArr[8],
      texArr[9],

      geoArr[10],
      geoArr[11],
      texArr[10],
      texArr[11],
    ];
  }

  setup() {
    const { gl } = this;

    gl.useProgram(this.material.program);

    this.initTexture();
    this.initAttrs();

    gl.useProgram(null);
  }

  initTexture() {
    const { gl } = this;

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
  }

  initAttrs() {
    const { gl } = this;

    this.uv_x = this.size.x / this.image.width;
    this.uv_y = this.size.y / this.image.height;

    let dataBuffData = this.combineGeoWithTexData(
      this.createRectArray(
        0,
        0,
        this.size.renderWidth || this.size.x,
        this.size.renderHeight || this.size.y
      ),
      this.createRectArray(0, 0, this.uv_x, this.uv_y)
    );

    dataBuffData = new Float32Array(dataBuffData);

    this.data_buff = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.bufferData(gl.ARRAY_BUFFER, dataBuffData, gl.STATIC_DRAW);

    this.aPositionLoc = gl.getAttribLocation(
      this.material.program,
      'a_position'
    );
    this.aTexcoordLoc = gl.getAttribLocation(
      this.material.program,
      'a_texCoord'
    );

    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.enableVertexAttribArray(this.aTexcoordLoc);

    this.uImageLoc = gl.getUniformLocation(this.material.program, 'u_image');
    this.uWorldLoc = gl.getUniformLocation(this.material.program, 'u_world');
    this.uObjectLoc = gl.getUniformLocation(this.material.program, 'u_object');
    this.uFrameLoc = gl.getUniformLocation(this.material.program, 'u_frame');
  }

  updateTexture(newImage, tileSize) {
    this.image = newImage.src;
    this.size = new Point(newImage.width, newImage.height);
    this.size.renderWidth = tileSize * (newImage.drawWidthOffset || 1);
    this.size.renderHeight = tileSize * (newImage.drawHeightOffset || 1);

    this.setup();
  }

  render(position = { x: 0, y: 0 }, frames = { x: 0, y: 0 }, worldSpaceMatrix) {
    const { gl } = this;

    let frame_x = Math.floor(frames.x) * this.uv_x;
    let frame_y = Math.floor(frames.y) * this.uv_y;
    let oMat = new M3x3().transition(position.x, position.y);

    gl.useProgram(this.material.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.uniform1i(this.uImageLoc, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 16, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.vertexAttribPointer(this.aTexcoordLoc, 2, gl.FLOAT, false, 16, 8);

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
