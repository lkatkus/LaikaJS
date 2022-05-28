import LevelTextureManager from './LevelTextureManager';
import { ITileType, LevelTile } from './LevelTile';

interface ITileTypeConfig {
  solid: ITileType[];
  climbable: ITileType[];
  nonTexture: ITileType[];
}

export interface ITile {
  sx: number;
  sy: number;
  sWidth: number;
  sHeight: number;
  dx: number;
  dy: number;
  dWidth: number;
  dHeight: number;
  zIndex: number;
}

interface IParallaxConfig {
  x: number;
  y: number;
}

type IDrawFn = (tiles: ITile[]) => void;

type ILayout = ITileType[][];

export interface ILevelManagerConfig {
  spawnMarker: ITileType;
  tileSheet: {
    src: any;
    tilesPerRow: number;
    spriteSize: number;
    cols: number;
    types: ITileTypeConfig;
  };
  stageLayout: ITileType[][];
  backgroundLayout: ITileType[][];
  foregroundLayout: ITileType[][];
  parallaxScaling: IParallaxConfig;
}

interface ILayoutParams {
  x?: number;
  y?: number;
  rows: number;
  cols: number;
}

class LevelManager {
  tileSize: number;
  spriteSize: number;
  colsOnScreen: number;
  rowsOnScreen: number;
  spawnMarker: ITileType;
  tilesPerRow: number;

  levelLayout: ILayoutParams;
  backgroundLayout: ILayoutParams;
  foregroundLayout: ILayoutParams;

  tileContainer: LevelTile[][];
  bgTileContainer: LevelTile[][];
  fgTileContainer: LevelTile[][];

  spawnX: number;
  spawnY: number;
  initialPlayerLocation: {
    col: number;
    row: number;
    x: number;
    y: number;
  };

  cameraOffsetX: number;
  cameraOffsetY: number;

  visibleLeftCol: number;
  visibleRightCol: number;
  visibleTopRow: number;
  visibleBottomRow: number;

  visibleLeftColScaled: number;
  visibleRightColScaled: number;
  visibleTopRowScale: number;
  visibleBottomRowScale: number;

  tileTypes: ITileTypeConfig;
  parallaxScaling: IParallaxConfig;
  textureSheet: any;
  levelTextureManager: LevelTextureManager;

  loadingHandler: Promise<void>;

  constructor(renderer: any, config: ILevelManagerConfig) {
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
    this.setTileContainer(config.stageLayout);
    this.setBackgroundTileContainer(config.backgroundLayout);
    this.setForegroundTileContainer(config.foregroundLayout);

    this.loadingHandler = new Promise((resolve) => {
      this.textureSheet = config.tileSheet.src;
      resolve();
    });
  }

  setParams(config: ILevelManagerConfig) {
    const {
      spawnMarker,
      tileSheet,
      stageLayout,
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
      rows: stageLayout.length,
      cols: stageLayout[0].length,
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

  setTileSize(width: number, height: number) {
    // TODO add check to check if new TILE_SIZE !== CURRENT_TILE_SIZE
    if (width / height < 1) {
      this.tileSize = Math.ceil(width / this.tilesPerRow);
    } else {
      this.tileSize = Math.ceil(height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.ceil(width / this.tileSize);
    this.rowsOnScreen = Math.ceil(height / this.tileSize);

    this.levelLayout = {
      ...this.levelLayout,
      x: this.levelLayout.cols * this.tileSize,
      y: this.levelLayout.rows * this.tileSize,
    };
  }

  resetTileSize(width: number, height: number) {
    if (width / height < 1) {
      this.tileSize = Math.ceil(width / this.tilesPerRow);
    } else {
      this.tileSize = Math.ceil(height / this.tilesPerRow);
    }

    this.colsOnScreen = Math.ceil(width / this.tileSize);
    this.rowsOnScreen = Math.ceil(height / this.tileSize);

    this.tileContainer.forEach((tileRow) => {
      tileRow.forEach((tile) => {
        tile.updateTileSize(this.tileSize);
      });
    });
  }

  setTileContainer(levelLayout: ILayout) {
    this.tileContainer = levelLayout.map((layoutRow, row) =>
      layoutRow.map((type, col) => {
        if (type === this.spawnMarker) {
          this.spawnX = col * this.tileSize;
          this.spawnY = row * this.tileSize;

          this.initialPlayerLocation = {
            col: col,
            row: row,
            x: col * this.tileSize,
            y: row * this.tileSize,
          };
        }

        return new LevelTile(
          row,
          col,
          this.tileSize,
          this.levelTextureManager.getTexture(type),
          type
        );
      })
    );
  }

  setBackgroundTileContainer(levelLayout: ILayout) {
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
              this.tileSize,
              this.levelTextureManager.getTexture(type),
              type
            )
        )
      );
    }
  }

  setForegroundTileContainer(levelLayout: ILayout) {
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
              this.tileSize,
              this.levelTextureManager.getTexture(type),
              type
            )
        )
      );
    }
  }

  updateVisibleTiles() {
    let leftCol = Math.floor(this.cameraOffsetX / this.tileSize) - 1;
    // @TODO make parallax scaling configurable
    const leftColScaled =
      Math.floor(this.cameraOffsetX / this.parallaxScaling.x / this.tileSize) -
      1;

    if (leftCol < 0) {
      leftCol = 0;
    }

    let rightCol = leftCol + this.colsOnScreen + 1;
    const rightColScaled = leftCol + this.colsOnScreen + 1;

    if (rightCol > this.levelLayout.cols) {
      rightCol = this.levelLayout.cols;
    }

    let topRow = Math.floor(this.cameraOffsetY / this.tileSize) - 1;
    if (topRow < 0) {
      topRow = 0;
    }

    let topRowScaled =
      Math.floor(this.cameraOffsetY / this.parallaxScaling.y / this.tileSize) -
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

  drawBackground(drawFn: IDrawFn) {
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

          if (bgTile && bgTile.texture !== -1) {
            visibleTiles.push({
              sx: bgTile.texture.x,
              sy: bgTile.texture.y,
              sWidth: this.spriteSize,
              sHeight: this.spriteSize,
              dx: bgTile.x,
              dy: bgTile.y,
              dWidth: bgTile.width,
              dHeight: bgTile.height,
              // @TODO update, when parallax twitching is fixid
              zIndex: 1,
            });
          }
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
  }

  drawStage(drawFn: IDrawFn) {
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

        if (tile && tile.texture !== -1) {
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

  drawForeground(drawFn: IDrawFn) {
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
          const fgTile = this.getTile(rowIndex, colIndex, this.fgTileContainer);

          if (fgTile && fgTile.texture !== -1) {
            visibleTiles.push({
              sx: fgTile.texture.x,
              sy: fgTile.texture.y,
              sWidth: this.spriteSize,
              sHeight: this.spriteSize,
              dx: fgTile.x,
              dy: fgTile.y,
              dWidth: fgTile.width,
              dHeight: fgTile.height,
              zIndex: 1,
            });
          }
        }
      }
    }

    if (visibleTiles.length > 0) {
      drawFn(visibleTiles);
    }
  }

  onBeforeDraw(newOffsetX: number, newOffsetY: number) {
    if (
      this.cameraOffsetX !== newOffsetX ||
      this.cameraOffsetY !== newOffsetY
    ) {
      this.cameraOffsetX = -newOffsetX;
      this.cameraOffsetY = -newOffsetY;

      this.updateVisibleTiles();
    }
  }

  getTile(row: number, col: number, tileContainer?: any[]): LevelTile {
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

  canClimbTile(type: ITileType) {
    return this.tileTypes.climbable.includes(type);
  }

  canWalkTile(type: ITileType) {
    return (
      this.tileTypes.solid.includes(type) ||
      this.tileTypes.climbable.includes(type)
    );
  }
}

export default LevelManager;
