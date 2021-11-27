import { TilesRenderer } from './TilesRenderer';
import { SpriteRenderer } from './SpriteRenderer';
import { M3x3 } from './utils';

class WebGlRenderer {
  constructor(gl) {
    const { drawingBufferWidth, drawingBufferHeight } = gl;

    this.gl = gl;
    this.screenWidth = drawingBufferWidth;
    this.screenHeight = drawingBufferHeight;
    this.wRatio = this.screenWidth / this.screenHeight;

    this.worldSpaceMatrix = new M3x3();
    this.worldSpaceMatrix = this.worldSpaceMatrix
      .transition(-1, 1)
      .scale(2 / this.screenWidth, -2 / this.screenHeight);

    this.gl.clearColor(0.4, 0.6, 1.0, 0.0);

    this.renderLevel = this.renderLevel.bind(this);
    this.renderSprite = this.renderSprite.bind(this);

    this.initBackgroundRenderer = this.initBackgroundRenderer.bind(this);
    this.initSpriteRenderer = this.initSpriteRenderer.bind(this);

    this.offsetX = 0;
    this.offsetY = 0;
  }

  initBackgroundRenderer(texture, config) {
    this.bgRenderer = new TilesRenderer(this.gl, texture, config);
  }

  initSpriteRenderer(texture, tileSize) {
    return new SpriteRenderer(this.gl, texture.source, {
      width: texture.width,
      height: texture.height,
      renderWidth: tileSize * (texture.drawWidthOffset || 1),
      renderHeight: tileSize * (texture.drawHeightOffset || 1),
    });
  }

  onBeforeRender() {
    const { gl, screenWidth, screenHeight } = this;

    gl.viewport(0, 0, screenWidth, screenHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  onAfterRender() {
    const { gl } = this;

    gl.flush();
    gl.endFrameEXP();
  }

  renderLevel(tilesToRender) {
    this.bgRenderer.render(tilesToRender, this.worldSpaceMatrix);
  }

  renderSprite(renderer, image, sx, sy, sWidth, sHeight, dx, dy) {
    const frames = {
      x: sx > 0 ? (sx * image.width) / sWidth / image.width : 0,
      y: sy > 0 ? (sy * image.height) / sHeight / image.height : 0,
    };

    renderer.render({ x: dx, y: dy }, frames, this.worldSpaceMatrix);
  }

  translate(x = 0, y = 0) {
    const nextOffsetX = -(this.offsetX - x);
    const nextOffsetY = -(this.offsetY - y);

    this.worldSpaceMatrix = this.worldSpaceMatrix.transition(
      nextOffsetX,
      nextOffsetY
    );

    this.offsetX = x;
    this.offsetY = y;
  }
}

export default WebGlRenderer;
