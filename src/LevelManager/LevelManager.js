import LevelTextureManager from './LevelTextureManager';
import LevelTile from './LevelTile';

class LevelManager {
  constructor(canvas, config) {
    this.levelLayout = {
      rows: config.layout.length,
      cols: config.layout[0].length,
    };
    this.spawnMarker = config.spawnMarker;
    this.spriteSize = config.tileSheet.spriteSize;
    this.tilesPerRow = config.tileSheet.tilesPerRow;
    this.tileTypes = config.tileSheet.types;

    this.levelTextureManager = new LevelTextureManager({
      spawnMarker: this.spawnMarker,
      tileSheetCols: config.tileSheet.cols,
      spriteSize: this.spriteSize,
      nonTextureTiles: this.tileTypes.nonTexture,
    });

    this.setTileSize(canvas);
    this.setTileContainer(config.layout);

    this.loadingHandler = new Promise((resolve) => {
      this.textureSheet = new Image();
      this.textureSheet.src = config.tileSheet.src;
      this.textureSheet.onload = () => resolve();
    });
  }

  setTileSize(canvas) {
    // TODO add check to check if new TILE_SIZE !== CURRENT_TILE_SIZE
    if (canvas.width / canvas.height < 1) {
      this.TILE_SIZE = Math.ceil(canvas.width / this.tilesPerRow);
    } else {
      this.TILE_SIZE = Math.ceil(canvas.height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.floor(canvas.width / this.TILE_SIZE);
    this.rowsOnScreen = Math.floor(canvas.height / this.TILE_SIZE);
  }

  resetTileSize(canvas) {
    if (canvas.width / canvas.height < 1) {
      this.TILE_SIZE = Math.ceil(canvas.width / this.tilesPerRow);
    } else {
      this.TILE_SIZE = Math.ceil(canvas.height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.floor(canvas.width / this.TILE_SIZE);
    this.rowsOnScreen = Math.floor(canvas.height / this.TILE_SIZE);

    this.tileContainer.forEach((tileRow) => {
      tileRow.forEach((tile) => {
        tile.updateTileSize(this.TILE_SIZE);
      });
    });
  }

  setTileContainer(levelLayout) {
    this.tileContainer = levelLayout.map((layoutRow, row) =>
      layoutRow.map((type, col) => {
        if (type === this.spawnMarker) {
          this.spawnX = col * this.TILE_SIZE;
          this.spawnY = row * this.TILE_SIZE;

          this.initialPlayerLocation = {
            col: col,
            row: row,
            x: col * this.TILE_SIZE,
            y: row * this.TILE_SIZE,
          };
        }

        return new LevelTile(
          row,
          col,
          this.TILE_SIZE,
          this.levelTextureManager.getTexture(type),
          type
        );
      })
    );
  }

  updateVisibleTiles() {
    let leftCol = Math.floor(this.cameraOffsetX / this.TILE_SIZE) - 2;

    if (leftCol < 0) {
      leftCol = 0;
    }

    let rightCol = leftCol + this.colsOnScreen + 4;

    if (rightCol > this.levelLayout.cols) {
      rightCol = this.levelLayout.cols;
    }

    let topRow = Math.floor(this.cameraOffsetY / this.TILE_SIZE) - 2;
    if (topRow < 0) {
      topRow = 0;
    }

    let bottomRow = topRow + this.rowsOnScreen + 4;
    if (bottomRow > this.levelLayout.rows) {
      bottomRow = this.levelLayout.rows;
    }

    this.visibleLeftCol = leftCol;
    this.visibleRightCol = rightCol;
    this.visibleTopRow = topRow;
    this.visibleBottomRow = bottomRow;
  }

  draw(drawFn, newOffsetX, newOffsetY) {
    if (
      this.cameraOffsetX !== newOffsetX ||
      this.cameraOffsetY !== newOffsetY
    ) {
      this.cameraOffsetX = -newOffsetX;
      this.cameraOffsetY = -newOffsetY;

      this.updateVisibleTiles();
    }

    this.drawTiles(drawFn);
  }

  drawTiles(drawFn) {
    this.tileContainer.forEach((tileRow, rowIndex) => {
      if (rowIndex >= this.visibleTopRow && rowIndex <= this.visibleBottomRow) {
        tileRow.forEach((tile, colIndex) => {
          if (
            colIndex >= this.visibleLeftCol &&
            colIndex <= this.visibleRightCol
          ) {
            drawFn(
              this.textureSheet,
              tile.texture.x,
              tile.texture.y,
              this.spriteSize,
              this.spriteSize,
              tile.x,
              tile.y,
              tile.width,
              tile.height
            );
          }
        });
      }
    });
  }

  getTile(row, col) {
    if (
      row < 0 ||
      row > this.tileContainer.length - 1 ||
      col < 0 ||
      col > this.tileContainer[0].length - 1
    ) {
      return null;
    }

    return this.tileContainer[row][col];
  }

  canClimbTile(type) {
    return this.tileTypes.climbable.includes(type);
  }

  canWalkTile(type) {
    return this.tileTypes.solid.includes(type);
  }
}

export default LevelManager;
