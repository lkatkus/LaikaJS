import { M3x3 } from '../utils';
import { TilesRenderer } from './TilesRenderer';
import { SpriteRenderer } from './SpriteRenderer';

class CanvasRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.screenWidth = ctx.canvas.width;
    this.screenHeight = ctx.canvas.height;
    this.wRatio = this.screenWidth / this.screenHeight;

    this.worldSpaceMatrix = new M3x3();

    this.offsetX = 0;
    this.offsetY = 0;
  }

  initBackgroundRenderer = (texture, config) => {
    this.bgRenderer = new TilesRenderer(this.ctx, texture, config);
  };

  initSpriteRenderer = (texture, tileSize) => {
    return new SpriteRenderer(this.ctx, texture.source, {
      width: texture.width,
      height: texture.height,
      renderWidth: tileSize * (texture.drawWidthOffset || 1),
      renderHeight: tileSize * (texture.drawHeightOffset || 1),
    });
  };

  onBeforeRender = () => {
    const { ctx } = this;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  };

  onAfterRender = () => {};

  renderLevel = (tilesToRender) => {
    this.bgRenderer.render(tilesToRender, this.worldSpaceMatrix);
  };

  renderSprite = (renderer, image, sx, sy, sWidth, sHeight, dx, dy) => {
    const frames = {
      x: sx > 0 ? (sx * image.width) / sWidth / image.width : 0,
      y: sy > 0 ? (sy * image.height) / sHeight / image.height : 0,
    };

    renderer.render({ x: dx, y: dy }, frames, this.worldSpaceMatrix);
  };

  translate = (x = 0, y = 0) => {
    const nextOffsetX = -(this.offsetX - x);
    const nextOffsetY = -(this.offsetY - y);

    this.worldSpaceMatrix = this.worldSpaceMatrix.transition(
      nextOffsetX,
      nextOffsetY
    );

    this.offsetX = x;
    this.offsetY = y;
  };
}

export default CanvasRenderer;
