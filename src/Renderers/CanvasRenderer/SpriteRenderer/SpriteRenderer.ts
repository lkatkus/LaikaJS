import { Point } from '../../utils';

interface ISpriteRendererOptions {
  width?: number;
  height?: number;
  renderWidth?: number;
  renderHeight?: number;
}

class SpriteRenderer {
  isLoaded: boolean;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  size: any;

  constructor(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    options: ISpriteRendererOptions = {}
  ) {
    this.ctx = ctx;
    this.isLoaded = false;

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

    this.image = image;
  }

  updateTexture(
    newImage: {
      src: HTMLImageElement;
      height: number;
      width: number;
      tileCols: number;
      drawHeightOffset: number;
      drawWidthOffset: number;
    },
    tileSize: number
  ) {
    this.image = newImage.src;
    this.size = new Point(newImage.width, newImage.height);
    this.size.renderWidth = tileSize * (newImage.drawWidthOffset || 1);
    this.size.renderHeight = tileSize * (newImage.drawHeightOffset || 1);
  }

  render(
    position = { x: 0, y: 0 },
    frames = { x: 0, y: 0 },
    worldSpaceMatrix: any
  ) {
    const { ctx } = this;

    const frame = {
      x: Math.floor(frames.x) * this.size.x,
      y: Math.floor(frames.y) * this.size.y,
    };

    const offsetX = worldSpaceMatrix.matrix[6];
    const offsetY = worldSpaceMatrix.matrix[7];

    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.drawImage(
      this.image,
      frame.x,
      frame.y,
      this.size.x,
      this.size.y,
      position.x,
      position.y,
      this.size.renderWidth,
      this.size.renderHeight
    );

    ctx.restore();
  }
}

export default SpriteRenderer;
