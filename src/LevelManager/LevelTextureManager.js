class LevelTextureManager {
  constructor(config) {
    this.spawnMarker = config.spawnMarker;
    this.tileSheetCols = config.tileSheetCols;
    this.spriteSize = config.spriteSize;
    this.nonTextureTiles = config.nonTextureTiles || [];
  }

  getTexture(type) {
    if (this.nonTextureTiles.includes(type)) {
      return 0;
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
