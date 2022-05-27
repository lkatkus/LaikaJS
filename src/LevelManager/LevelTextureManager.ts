import { ITileTexture, ITileType } from './LevelTile';

interface ILevelTextureManagerConfig {
  spawnMarker: ITileType;
  tileSheetCols: number;
  spriteSize: number;
  nonTextureTiles: ITileType[];
}

class LevelTextureManager {
  spawnMarker: ITileType;
  tileSheetCols: number;
  spriteSize: number;
  nonTextureTiles: ITileType[];

  constructor(config: ILevelTextureManagerConfig) {
    this.spawnMarker = config.spawnMarker;
    this.tileSheetCols = config.tileSheetCols;
    this.spriteSize = config.spriteSize;
    this.nonTextureTiles = config.nonTextureTiles || [];
  }

  getTexture(type: ITileType): ITileTexture | -1 {
    if (typeof type === 'string' || this.nonTextureTiles.includes(type)) {
      return -1;
    }

    const adjustedType = type - 1;
    const sourceRow = Math.floor(adjustedType / this.tileSheetCols);
    const sourceCol = adjustedType - sourceRow * this.tileSheetCols;

    const textureCoordinates = {
      x: sourceCol * this.spriteSize,
      y: sourceRow * this.spriteSize,
    };

    return textureCoordinates;
  }
}

export default LevelTextureManager;
