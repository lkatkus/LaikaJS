import { Point } from '../../utils';

class TilesRenderer {
  constructor(ctx, img_url, { size, tilesPerRow }) {
    this.ctx = ctx;
    this.isLoaded = false;

    this.size = new Point(size, size);
    this.image = img_url;
    this.tilesPerRow = tilesPerRow;
  }

  render(tilesToRender, worldSpaceMatrix) {
    const { ctx } = this;

    const offsetX = worldSpaceMatrix.matrix[6];
    const offsetY = worldSpaceMatrix.matrix[7];

    ctx.save();
    ctx.translate(offsetX, offsetY);

    for (let tile of tilesToRender) {
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
