import { ITile } from '../../../LevelManager';
import { M3x3, Point } from '../../utils';

interface ITilesRendererOptions {
  size?: number;
  tilesPerRow?: number;
}

class TilesRenderer {
  isLoaded: boolean;
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  size: Point;
  tilesPerRow: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    { size, tilesPerRow }: ITilesRendererOptions
  ) {
    this.ctx = ctx;
    this.isLoaded = false;

    this.size = new Point(size, size);
    this.image = image;
    this.tilesPerRow = tilesPerRow;
  }

  render(tilesToRender: ITile[], worldSpaceMatrix: M3x3) {
    const { ctx } = this;

    const offsetX = worldSpaceMatrix.matrix[6];
    const offsetY = worldSpaceMatrix.matrix[7];

    ctx.save();
    ctx.translate(offsetX, offsetY);

    for (const tile of tilesToRender) {
      const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = tile;

      ctx.drawImage(
        this.image,
        sx,
        sy,
        sWidth,
        sHeight,
        dx,
        dy,
        dWidth,
        dHeight
      );
    }

    ctx.restore();
  }
}

export default TilesRenderer;
