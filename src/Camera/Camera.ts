import { Player } from '../Entity';
import { LevelManager } from '../LevelManager';

class Camera {
  level: LevelManager;
  player: Player;

  offsetX: number;
  offsetY: number;

  constructor(level: LevelManager, player: Player) {
    this.level = level;
    this.player = player;
  }

  setInitialCamera(screenWidth: number, screenHeight: number) {
    this.offsetX = -this.level.spawnX + screenWidth / 2 - this.level.tileSize;
    this.offsetY = -(this.level.spawnY - (screenHeight / 10) * 6);
  }

  resetCameraOffset(screenWidth: number, screenHeight: number) {
    this.offsetX = -this.player.x + screenWidth / 2;
    this.offsetY = -(this.player.y - screenHeight / 2);
  }

  updateCameraOffset(
    screenWidth: number,
    screenHeight: number,
    deltaTime: number
  ) {
    const offsetSpeedX = this.player.speedX * deltaTime;
    const offsetSpeedY = this.player.speedY * deltaTime;

    // @TODO make scroll boundaries configurable
    if (this.player.anchorX + this.offsetX > (screenWidth / 10) * 8) {
      this.offsetX = this.offsetX - offsetSpeedX;
    } else if (this.player.anchorX + this.offsetX < (screenWidth / 10) * 2) {
      this.offsetX = this.offsetX + offsetSpeedX;
    }

    if (this.player.y + this.offsetY < (screenHeight / 10) * 5) {
      this.offsetY = this.offsetY + offsetSpeedY;
    } else if (this.player.y + this.offsetY >= (screenHeight / 10) * 6) {
      const offsetUpdate = this.player.isFalling
        ? this.player.speedFall
        : offsetSpeedY;

      this.offsetY = this.offsetY - offsetUpdate;
    }
  }
}

export default Camera;
