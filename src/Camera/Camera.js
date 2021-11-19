class Camera {
  constructor(level, player) {
    this.level = level;
    this.player = player;
  }

  setInitialCamera(screenWidth, screenHeight) {
    this.offsetX = -this.level.spawnX + screenWidth / 2;
    this.offsetY = -(this.level.spawnY - screenHeight / 2);
  }

  resetCameraOffset(screenWidth, screenHeight) {
    this.offsetX = -this.player.x + screenWidth / 2;
    this.offsetY = -(this.player.y - screenHeight / 2);
  }

  updateCameraOffset(screenWidth, screenHeight, deltaTime) {
    const offsetSpeedX = this.player.speedX * deltaTime;
    const offsetSpeedY = this.player.speedY * deltaTime;

    if (this.player.x + this.offsetX > (screenWidth / 10) * 6) {
      this.offsetX = this.offsetX - offsetSpeedX;
    } else if (this.player.x + this.offsetX < (screenWidth / 10) * 4) {
      this.offsetX = this.offsetX + offsetSpeedX;
    }

    if (this.player.y + this.offsetY < (screenHeight / 10) * 4) {
      this.offsetY = this.offsetY + offsetSpeedY;
    } else if (this.player.y + this.offsetY > (screenHeight / 10) * 6) {
      const offsetUpdate = this.player.isFalling
        ? this.player.speedFall
        : offsetSpeedY;

      this.offsetY = this.offsetY - offsetUpdate;
    }
  }
}

export default Camera;
