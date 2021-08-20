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

  updateCameraOffset(screenWidth, screenHeight) {
    if (this.player.x + this.offsetX > (screenWidth / 10) * 7) {
      this.offsetX = this.offsetX - this.player.speedX;
    } else if (this.player.x + this.offsetX < (screenWidth / 10) * 3) {
      this.offsetX = this.offsetX + this.player.speedX;
    }

    if (this.player.y + this.offsetY < (screenHeight / 10) * 4) {
      this.offsetY = this.offsetY + this.player.speedY;
    } else if (this.player.y + this.offsetY > (screenHeight / 10) * 6) {
      const offsetUpdate = this.player.isFalling
        ? this.player.speedFall
        : this.player.speedY;

      this.offsetY = this.offsetY - offsetUpdate;
    }
  }
}

export default Camera;
