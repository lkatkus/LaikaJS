class Entity {
  constructor(levelRef, initialLocation, config) {
    this.name = config.name;
    this.level = levelRef;
    /** Position in the game world */
    this.row = initialLocation.row;
    this.col = initialLocation.col;
    this.x = initialLocation.x;
    this.y = initialLocation.y;
    /** Animation params */
    this.tileRowOffset = 2;
    this.tileColOffset = 0;
    this.drawOffset = config.texture.drawOffset;
    this.drawWidthOffset = config.texture.drawWidthOffset || 1;
    this.drawHeightOffset = config.texture.drawHeightOffset || 1;
    this.tileCols = config.texture.tileCols;
    this.textureWidth = config.texture.width;
    this.textureHeight = config.texture.height;
    /** Movement params */
    this.isMoving = false;
    this.direction = 'right';
    this.speedXOffset = config.movement.speedX;
    this.speedYOffset = config.movement.speedY;
    this.speedX = Math.floor(levelRef.TILE_SIZE / this.speedXOffset);
    this.speedY = Math.floor(levelRef.TILE_SIZE / this.speedYOffset);
    /** Used to handle player animations */
    this.colOffsetInterval = setInterval(() => {
      this.tileColOffset =
        this.tileColOffset < this.tileCols ? (this.tileColOffset += 1) : 0;
    }, 100);

    this.loadingHandler = new Promise((resolve) => {
      this.textureSheet = new Image();
      this.textureSheet.src = config.texture.source;
      this.textureSheet.onload = () => resolve();
    });
  }

  resetPosition(tileSize) {
    this.x = Math.floor(this.col * tileSize);
    this.y = Math.floor(this.row * tileSize);
    this.speedX = Math.floor(tileSize / this.speedXOffset);
    this.speedY = Math.floor(tileSize / this.speedYOffset);
  }

  draw(drawFn, tileSize) {
    this.isMoving && this.move(tileSize);
    this.isFalling && this.fall(tileSize);

    drawFn(
      this.textureSheet,
      this.textureWidth * this.tileColOffset,
      this.textureHeight * this.tileRowOffset,
      this.textureWidth,
      this.textureHeight,
      this.x,
      this.y - tileSize * this.drawOffset,
      tileSize * this.drawWidthOffset,
      tileSize * this.drawHeightOffset
    );
  }
}

export default Entity;
