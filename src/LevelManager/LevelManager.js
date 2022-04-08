import LevelTextureManager from './LevelTextureManager';
import LevelTile from './LevelTile';

class LevelManager {
  constructor(renderer, config) {
    this.spawnMarker = config.spawnMarker;
    this.spriteSize = config.tileSheet.spriteSize;
    this.tilesPerRow = config.tileSheet.tilesPerRow;
    this.tileTypes = config.tileSheet.types;
    this.levelLayout = {
      rows: config.layout.length,
      cols: config.layout[0].length,
    };

    renderer.initBackgroundRenderer(config.tileSheet.src, {
      size: this.spriteSize,
      tilesPerRow: config.tileSheet.cols,
    });

    this.levelTextureManager = new LevelTextureManager({
      spawnMarker: this.spawnMarker,
      tileSheetCols: config.tileSheet.cols,
      spriteSize: this.spriteSize,
      nonTextureTiles: this.tileTypes.nonTexture,
    });

    this.setTileSize(renderer.screenWidth, renderer.screenHeight);
    this.setTileContainer(config.layout);

    this.loadingHandler = new Promise((resolve) => {
      this.textureSheet = config.tileSheet.src;
      resolve();
    });
  }

  setTileSize(width, height) {
    // TODO add check to check if new TILE_SIZE !== CURRENT_TILE_SIZE
    if (width / height < 1) {
      this.TILE_SIZE = Math.ceil(width / this.tilesPerRow);
    } else {
      this.TILE_SIZE = Math.ceil(height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.ceil(width / this.TILE_SIZE);
    this.rowsOnScreen = Math.ceil(height / this.TILE_SIZE);

    this.levelLayout = {
      ...this.levelLayout,
      x: this.levelLayout.cols * this.TILE_SIZE,
      y: this.levelLayout.rows * this.TILE_SIZE,
    };
  }

  resetTileSize(width, height) {
    if (width / height < 1) {
      this.TILE_SIZE = Math.ceil(width / this.tilesPerRow);
    } else {
      this.TILE_SIZE = Math.ceil(height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.ceil(width / this.TILE_SIZE);
    this.rowsOnScreen = Math.ceil(height / this.TILE_SIZE);

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
    let leftCol = Math.floor(this.cameraOffsetX / this.TILE_SIZE) - 1;

    if (leftCol < 0) {
      leftCol = 0;
    }

    let rightCol = leftCol + this.colsOnScreen + 1;

    if (rightCol > this.levelLayout.cols) {
      rightCol = this.levelLayout.cols;
    }

    let topRow = Math.floor(this.cameraOffsetY / this.TILE_SIZE) - 1;
    if (topRow < 0) {
      topRow = 0;
    }

    let bottomRow = topRow + this.rowsOnScreen + 1;
    if (bottomRow > this.levelLayout.rows) {
      bottomRow = this.levelLayout.rows;
    }

    this.visibleLeftCol = leftCol;
    this.visibleRightCol = rightCol;
    this.visibleTopRow = topRow;
    this.visibleBottomRow = bottomRow;
  }

  drawForeground(drawFn) {
    const visibleTiles = [];

    for (
      let rowIndex = this.visibleTopRow;
      rowIndex <= this.visibleBottomRow;
      rowIndex++
    ) {
      for (
        let colIndex = this.visibleLeftCol;
        colIndex <= this.visibleRightCol;
        colIndex++
      ) {
        const tile = this.getTile(rowIndex, colIndex);

        if (tile && !this.tileTypes.nonTexture.includes(tile.type)) {
          visibleTiles.push({
            sx: tile.texture.x,
            sy: tile.texture.y,
            sWidth: this.spriteSize,
            sHeight: this.spriteSize,
            dx: tile.x,
            dy: tile.y,
            dWidth: tile.width,
            dHeight: tile.height,
          });
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
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

    this.drawForeground(drawFn);
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
    return (
      this.tileTypes.solid.includes(type) ||
      this.tileTypes.climbable.includes(type)
    );
  }
}

export default LevelManager;
