import LevelTextureManager from './LevelTextureManager';
import LevelTile from './LevelTile';

class LevelManager {
  constructor(renderer, config) {
    this.setParams(config);

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
    this.setBackgroundTileContainer(config.bgLayout);
    this.setForegroundTileContainer(config.fgLayout);

    this.loadingHandler = new Promise((resolve) => {
      this.textureSheet = config.tileSheet.src;
      resolve();
    });
  }

  setParams(config) {
    const {
      spawnMarker,
      tileSheet,
      layout,
      backgroundLayout,
      foregroundLayout,
      parallaxScaling,
    } = config;

    this.spawnMarker = spawnMarker;
    this.spriteSize = tileSheet.spriteSize;
    this.tilesPerRow = tileSheet.tilesPerRow;
    this.tileTypes = tileSheet.types;
    this.parallaxScaling = {
      x: parallaxScaling?.x || 1,
      y: parallaxScaling?.y || 1,
    };

    this.levelLayout = {
      rows: layout.length,
      cols: layout[0].length,
    };

    if (backgroundLayout) {
      this.backgroundLayout = {
        rows: backgroundLayout.length,
        cols: backgroundLayout[0].length,
      };
    }

    if (foregroundLayout) {
      this.foregroundLayout = {
        rows: foregroundLayout.length,
        cols: foregroundLayout[0].length,
      };
    }
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

  setBackgroundTileContainer(levelLayout) {
    if (levelLayout) {
      this.backgroundLayout = {
        rows: levelLayout.length,
        cols: levelLayout[0].length,
      };

      this.bgTileContainer = levelLayout.map((layoutRow, row) =>
        layoutRow.map(
          (type, col) =>
            new LevelTile(
              row,
              col,
              this.TILE_SIZE,
              this.levelTextureManager.getTexture(type),
              type
            )
        )
      );
    }
  }

  setForegroundTileContainer(levelLayout) {
    if (levelLayout) {
      this.foregroundLayout = {
        rows: levelLayout.length,
        cols: levelLayout[0].length,
      };

      this.fgTileContainer = levelLayout.map((layoutRow, row) =>
        layoutRow.map(
          (type, col) =>
            new LevelTile(
              row,
              col,
              this.TILE_SIZE,
              this.levelTextureManager.getTexture(type),
              type
            )
        )
      );
    }
  }

  updateVisibleTiles() {
    let leftCol = Math.floor(this.cameraOffsetX / this.TILE_SIZE) - 1;
    // @TODO make parallax scaling configurable
    let leftColScaled =
      Math.floor(this.cameraOffsetX / this.parallaxScaling.x / this.TILE_SIZE) -
      1;

    if (leftCol < 0) {
      leftCol = 0;
    }

    let rightCol = leftCol + this.colsOnScreen + 1;
    let rightColScaled = leftCol + this.colsOnScreen + 1;

    if (rightCol > this.levelLayout.cols) {
      rightCol = this.levelLayout.cols;
    }

    let topRow = Math.floor(this.cameraOffsetY / this.TILE_SIZE) - 1;
    if (topRow < 0) {
      topRow = 0;
    }

    let topRowScaled =
      Math.floor(this.cameraOffsetY / this.parallaxScaling.y / this.TILE_SIZE) -
      1;
    if (topRowScaled < 0) {
      topRowScaled = 0;
    }

    let bottomRow = topRow + this.rowsOnScreen + 1;
    if (bottomRow > this.levelLayout.rows) {
      bottomRow = this.levelLayout.rows;
    }

    let bottomRowScale = topRowScaled + this.rowsOnScreen + 1;
    if (bottomRowScale > this.backgroundLayout.rows) {
      bottomRowScale = this.backgroundLayout.rows;
    }

    this.visibleLeftCol = leftCol;
    this.visibleRightCol = rightCol;
    this.visibleTopRow = topRow;
    this.visibleBottomRow = bottomRow;

    this.visibleLeftColScaled = leftColScaled;
    this.visibleRightColScaled = rightColScaled;
    this.visibleTopRowScale = topRowScaled;
    this.visibleBottomRowScale = bottomRowScale;
  }

  drawBackground(drawFn) {
    const visibleTiles = [];

    if (this.bgTileContainer) {
      for (
        let rowIndex = this.visibleTopRowScale;
        rowIndex <= this.visibleBottomRowScale;
        rowIndex++
      ) {
        for (
          let colIndex = this.visibleLeftColScaled;
          colIndex <= this.visibleRightColScaled;
          colIndex++
        ) {
          const bgTile = this.getTile(rowIndex, colIndex, this.bgTileContainer);

          if (bgTile && !this.tileTypes.nonTexture.includes(bgTile.type)) {
            visibleTiles.push({
              sx: bgTile.texture.x,
              sy: bgTile.texture.y,
              sWidth: this.spriteSize,
              sHeight: this.spriteSize,
              dx: bgTile.x,
              dy: bgTile.y,
              dWidth: bgTile.width,
              dHeight: bgTile.height,
              zIndex: 0,
            });
          }
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
  }

  drawStage(drawFn) {
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
        const tile = this.getTile(rowIndex, colIndex, this.tileContainer);

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
            zIndex: 1,
          });
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
  }

  drawForeground(drawFn) {
    const visibleTiles = [];

    if (this.fgTileContainer) {
      for (
        let rowIndex = this.visibleTopRowScale;
        rowIndex <= this.visibleBottomRowScale;
        rowIndex++
      ) {
        for (
          let colIndex = this.visibleLeftColScaled;
          colIndex <= this.visibleRightColScaled;
          colIndex++
        ) {
          const bgTile = this.getTile(rowIndex, colIndex, this.fgTileContainer);

          if (bgTile && !this.tileTypes.nonTexture.includes(bgTile.type)) {
            visibleTiles.push({
              sx: bgTile.texture.x,
              sy: bgTile.texture.y,
              sWidth: this.spriteSize,
              sHeight: this.spriteSize,
              dx: bgTile.x,
              dy: bgTile.y,
              dWidth: bgTile.width,
              dHeight: bgTile.height,
              zIndex: 0,
            });
          }
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
  }

  onBeforeDraw(newOffsetX, newOffsetY) {
    if (
      this.cameraOffsetX !== newOffsetX ||
      this.cameraOffsetY !== newOffsetY
    ) {
      this.cameraOffsetX = -newOffsetX;
      this.cameraOffsetY = -newOffsetY;

      this.updateVisibleTiles();
    }
  }

  getTile(row, col, tileContainer) {
    const tiles = tileContainer || this.tileContainer;

    if (
      row < 0 ||
      row > tiles.length - 1 ||
      col < 0 ||
      col > tiles[0].length - 1
    ) {
      return null;
    }

    return tiles[row][col];
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
