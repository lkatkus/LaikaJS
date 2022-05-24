import { Point } from '../../utils';
import { Material } from '../Material';

const TILES_VERTEX_SHADER = `
  attribute vec2 a_position;
  attribute vec2 a_frame;
  attribute float a_depth;
  
  uniform mat3 u_world;
  uniform mat3 u_scaled_world;
  uniform mat3 u_object;

  varying vec2 v_texCoord;

  void main(){
    if (a_depth >= 1.0) {
      gl_Position = vec4(u_world * vec3(a_position, 1), 1);
    } else {
      gl_Position = vec4(u_scaled_world * vec3(a_position, 1), 1);
    }

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
  constructor(gl, img_url, { size, tilesPerRow }) {
    this.gl = gl;
    this.isLoaded = false;
    this.material = new Material(
      gl,
      TILES_VERTEX_SHADER,
      TILES_FRAGMENT_SHADER
    );
    this.size = new Point(size, size);
    this.image = img_url;
    this.tilesPerRow = tilesPerRow;

    this.uv_x = this.size.x / this.image.width;
    this.uv_y = this.size.y / this.image.height;

    this.setup();
  }

  createRectArray(x = 0, y = 0, w = 1, h = 1) {
    return [x, y, x + w, y, x, y + h, x, y + h, x + w, y, x + w, y + h];
  }

  combineGeoWithTexData(geoArr, texArr, zIndex) {
    return [
      geoArr[0],
      geoArr[1],
      texArr[0],
      texArr[1],
      zIndex,

      geoArr[2],
      geoArr[3],
      texArr[2],
      texArr[3],
      zIndex,

      geoArr[4],
      geoArr[5],
      texArr[4],
      texArr[5],
      zIndex,

      geoArr[6],
      geoArr[7],
      texArr[6],
      texArr[7],
      zIndex,

      geoArr[8],
      geoArr[9],
      texArr[8],
      texArr[9],
      zIndex,

      geoArr[10],
      geoArr[11],
      texArr[10],
      texArr[11],
      zIndex,
    ];
  }

  setup() {
    const { gl } = this;

    this.data_buff = gl.createBuffer();

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

    this.aFrameLoc = gl.getAttribLocation(this.material.program, 'a_frame');
    this.aPositionLoc = gl.getAttribLocation(
      this.material.program,
      'a_position'
    );
    this.aDepthLoc = gl.getAttribLocation(this.material.program, 'a_depth');

    gl.enableVertexAttribArray(this.aPositionLoc);
    gl.enableVertexAttribArray(this.aFrameLoc);
    gl.enableVertexAttribArray(this.aDepthLoc);

    this.uImageLoc = gl.getUniformLocation(this.material.program, 'u_image');
    this.uWorldLoc = gl.getUniformLocation(this.material.program, 'u_world');
    this.uScaledWorldLoc = gl.getUniformLocation(
      this.material.program,
      'u_scaled_world'
    );
  }

  render(tilesToRender, worldSpaceMatrix, scaledWorldSpace) {
    const { gl, tilesPerRow } = this;

    let dataBuffer = [];

    for (let tile of tilesToRender) {
      const frame = {
        x: tile.sx > 0 ? (tile.sx * tilesPerRow) / this.image.width : 0,
        y: tile.sy > 0 ? (tile.sy * tilesPerRow) / this.image.height : 0,
      };

      dataBuffer.push(
        ...this.combineGeoWithTexData(
          this.createRectArray(tile.dx, tile.dy, tile.dWidth, tile.dHeight),
          this.createRectArray(
            frame.x * this.uv_x,
            frame.y * this.uv_y,
            this.uv_x,
            this.uv_x
          ),
          tile.zIndex
        )
      );
    }

    dataBuffer = new Float32Array(dataBuffer);

    gl.useProgram(this.material.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.gl_tex);
    gl.uniform1i(this.uImageLoc, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aPositionLoc, 2, gl.FLOAT, false, 16 + 4, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aFrameLoc, 2, gl.FLOAT, false, 16 + 4, 8);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.data_buff);
    gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.aDepthLoc, 1, gl.FLOAT, false, 16 + 4, 16);

    gl.uniformMatrix3fv(
      this.uWorldLoc,
      false,
      worldSpaceMatrix.getFloatArray()
    );
    gl.uniformMatrix3fv(
      this.uScaledWorldLoc,
      false,
      scaledWorldSpace.getFloatArray()
    );

    gl.drawArrays(gl.TRIANGLES, 0, tilesToRender.length * 6);

    gl.useProgram(null);
  }
}

export default TilesRenderer;
