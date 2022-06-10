import { LevelManager } from '../LevelManager';
import Entity, { IEntityConfig, IEntityDirection } from './Entity';

import {
  MOVEMENT_DIRECTION,
  MOVEMENT_KEYS,
  MOVEMENT_KEY_CODES,
} from './Player.constants';

export interface IPlayerConfig extends IEntityConfig {}

interface IPlayerOptions {
  tileCols: number;
  canFly: boolean;
  speedXOffset: number;
  speedYOffset: number;
  speedX: number;
  speedY: number;
  textureWidth: number;
  textureHeight: number;
}

class Player extends Entity {
  anchorX: number;
  anchorY: number;

  canFly: boolean;
  isOnLadder: boolean;

  constructor(level: LevelManager, config: IPlayerConfig, initRenderer: any) {
    super(level, level.initialPlayerLocation, config, initRenderer);
    this.canFly = false;

    this.updateAnchor(level.tileSize);
  }

  setControls() {
    document.addEventListener('keydown', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveStart(MOVEMENT_KEYS[event.key as keyof typeof MOVEMENT_KEYS]);
      }
    });

    document.addEventListener('keyup', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveEnd();
      }
    });

    const touchEvents: {
      startX?: number;
      startY?: number;
      moveX?: number;
      moveY?: number;
    } = {};

    document.addEventListener('touchstart', (event) => {
      touchEvents.startX = event.targetTouches[0].screenX;
      touchEvents.startY = event.targetTouches[0].screenY;
    });

    document.addEventListener('touchmove', (event) => {
      touchEvents.moveX = event.targetTouches[0].screenX;
      touchEvents.moveY = event.targetTouches[0].screenY;
      const changeX = Math.abs(touchEvents.startX - touchEvents.moveX);
      const changeY = Math.abs(touchEvents.startY - touchEvents.moveY);

      if (changeX >= changeY && changeX > 30) {
        if (touchEvents.startX > touchEvents.moveX) {
          this.moveStart(MOVEMENT_DIRECTION.left);
        }
        if (touchEvents.startX < touchEvents.moveX) {
          this.moveStart(MOVEMENT_DIRECTION.right);
        }
      } else if (changeX >= changeY && changeX < 30) {
        if (touchEvents.startX > touchEvents.moveX) {
          this.moveEnd();
        } else if (touchEvents.startX < touchEvents.moveX) {
          this.moveEnd();
        }
      }

      if (changeY >= changeX && changeY > 30) {
        if (touchEvents.startY > touchEvents.moveY) {
          this.moveStart(MOVEMENT_DIRECTION.up);
        } else if (touchEvents.startY < touchEvents.moveY) {
          this.moveStart(MOVEMENT_DIRECTION.down);
        }
      } else if (changeY >= changeX && changeY < 30) {
        if (touchEvents.startY > touchEvents.moveY) {
          this.moveEnd();
        } else if (touchEvents.startY < touchEvents.moveY) {
          this.moveEnd();
        }
      }
    });

    document.addEventListener('touchend', () => {
      this.moveEnd();
    });
  }

  enableControls() {
    // TODO
  }

  disableControls() {
    // TODO
  }

  levelUp(newTexture: any, config: IPlayerOptions) {
    this.renderer.updateTexture(newTexture, this.level.tileSize);

    (Object.keys(config) as Array<keyof typeof config>).forEach((key) => {
      if (key === 'canFly') {
        this[key] = config[key];
      } else {
        this[key] = config[key];
      }
    });
  }

  updateAnchor(tileSize: number) {
    // @TODO make configurable, because of different player sprite sizes
    this.anchorX = this.x + tileSize;
    this.anchorY = this.y + tileSize;
  }

  checkFalling(tileSize: number) {
    const anchorCol = Math.floor(this.anchorX / tileSize);
    const tileBelow = this.level.getTile(this.row + 1, anchorCol);

    if (tileBelow === null) {
      return;
    }

    if (!this.level.canWalkTile(tileBelow.type)) {
      this.isFalling = true;
    }
  }

  fall(tileSize: number) {
    if (!this.canFly) {
      const nextRow = Math.floor((this.y + tileSize + 10) / tileSize);
      const nextCol = Math.floor(this.anchorX / tileSize);
      const nextTile = this.level.getTile(nextRow, nextCol);

      if (nextTile === null) {
        return;
      }

      if (!this.level.canWalkTile(nextTile.type)) {
        this.y = this.y + this.speedFall;
      } else {
        this.isFalling = false;
        this.row = nextTile.row - 1;
        this.y = nextTile.y - nextTile.height;

        if (this.direction === MOVEMENT_DIRECTION.right) {
          this.tileRowOffset = 2;
        } else {
          this.tileRowOffset = 3;
        }
      }

      this.updateAnchor(tileSize);
    }
  }

  move(tileSize: number, deltaTime: number) {
    let nextRow;
    let nextCol;

    const offsetSpeedX = this.speedX * deltaTime;
    const offsetSpeedY = this.speedY * deltaTime;

    switch (this.direction) {
      case MOVEMENT_DIRECTION.right:
        nextRow = Math.floor(this.y / tileSize);
        nextCol = Math.floor(
          (this.anchorX + tileSize + offsetSpeedX) / tileSize
        );
        break;
      case MOVEMENT_DIRECTION.left:
        nextRow = Math.floor(this.y / tileSize);
        nextCol = Math.floor((this.x - offsetSpeedX) / tileSize);
        break;
      case MOVEMENT_DIRECTION.up:
        nextRow = Math.floor((this.y + tileSize - offsetSpeedY) / tileSize);
        nextCol = Math.floor(this.anchorX / tileSize);
        break;
      case MOVEMENT_DIRECTION.down:
        nextRow = Math.floor((this.y + tileSize + offsetSpeedY) / tileSize);
        nextCol = Math.floor(this.anchorX / tileSize);
        break;
    }

    const nextTile = this.level.getTile(nextRow, nextCol);

    if (nextTile === null) {
      return;
    }

    switch (this.direction) {
      case MOVEMENT_DIRECTION.right:
        if ((nextTile.type !== -1 && !this.isOnLadder) || this.canFly) {
          this.tileRowOffset = this.isFalling ? 6 : 0;
          this.col = nextTile.col;
          this.x = !this.isFalling
            ? this.x + offsetSpeedX
            : this.x + offsetSpeedX;
        }

        break;
      case MOVEMENT_DIRECTION.left:
        if ((nextTile.type !== -1 && !this.isOnLadder) || this.canFly) {
          this.tileRowOffset = this.isFalling ? 7 : 1;
          this.col = nextTile.col;
          this.x = !this.isFalling
            ? this.x - offsetSpeedX
            : this.x - offsetSpeedX;
        }

        break;
      case MOVEMENT_DIRECTION.up:
        if (this.colOffsetInterval === null) {
          this.startAnimation();
        }

        if (this.canFly) {
          this.row = nextTile.row;
          this.y = this.y - offsetSpeedY > 0 ? this.y - offsetSpeedY : 0;
        } else if (this.level.canClimbTile(nextTile.type)) {
          this.isOnLadder = true;
          this.tileRowOffset = 4;
          this.row = nextTile.row;
          this.y = this.y - offsetSpeedY;
        } else {
          this.isOnLadder = false;
          this.tileRowOffset = 2;
          this.row = nextTile.row;
          this.y = nextTile.y;
        }

        break;
      case MOVEMENT_DIRECTION.down:
        if (this.colOffsetInterval === null) {
          this.startAnimation();
        }

        if (this.canFly) {
          this.row = nextTile.row - 1;
          this.y = this.y + offsetSpeedY;
        } else if (this.level.canClimbTile(nextTile.type)) {
          this.isOnLadder = true;
          this.tileRowOffset = 5;
          this.row = nextTile.row - 1;
          this.y = this.y + offsetSpeedY;
        } else {
          this.isOnLadder = false;
          this.tileRowOffset = 2;
          this.row = nextTile.row - 1;
          this.y = nextTile.y - nextTile.height;
        }

        break;
    }

    this.updateAnchor(tileSize);
    !this.canFly && this.checkFalling(tileSize);
  }

  moveStart(direction: IEntityDirection) {
    this.isMoving = true;
    this.direction = direction;
  }

  moveEnd() {
    this.isMoving = false;

    switch (this.direction) {
      case 'right':
        if (!this.isOnLadder) {
          this.tileRowOffset = this.isFalling ? 6 : 2;
        }
        break;
      case 'left':
        if (!this.isOnLadder) {
          this.tileRowOffset = this.isFalling ? 7 : 3;
        }
        break;
      case 'up':
        if (this.isOnLadder) {
          this.stopAnimation();
        }
        break;
      case 'down':
        if (this.isOnLadder) {
          this.stopAnimation();
        }
        break;
    }
  }
}

export default Player;
