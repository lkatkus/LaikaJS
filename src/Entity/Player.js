import Entity from './Entity';

import {
  MOVEMENT_DIRECTION,
  MOVEMENT_KEYS,
  MOVEMENT_KEY_CODES,
} from './Player.constants';

class Player extends Entity {
  constructor(level, config, initRenderer) {
    super(level, level.initialPlayerLocation, config, initRenderer);
    this.canFly = false;

    this.updateAnchor(level.TILE_SIZE);
  }

  setControls() {
    document.addEventListener('keydown', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveStart(MOVEMENT_KEYS[event.key]);
      }
    });

    document.addEventListener('keyup', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveEnd();
      }
    });

    const touchEvents = {};

    document.addEventListener('touchstart', (event) => {
      touchEvents.startX = event.targetTouches[0].screenX;
      touchEvents.startY = event.targetTouches[0].screenY;
    });

    document.addEventListener('touchmove', (event) => {
      touchEvents.moveX = event.targetTouches[0].screenX;
      touchEvents.moveY = event.targetTouches[0].screenY;
      let changeX = Math.abs(touchEvents.startX - touchEvents.moveX);
      let changeY = Math.abs(touchEvents.startY - touchEvents.moveY);

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
      if (touchEvents.startX > touchEvents.moveX) {
        this.moveEnd(MOVEMENT_DIRECTION.left);
      }

      if (touchEvents.startX < touchEvents.moveX) {
        this.moveEnd(MOVEMENT_DIRECTION.right);
      }

      if (touchEvents.startY > touchEvents.moveY) {
        this.moveEnd(MOVEMENT_DIRECTION.up);
      }

      if (touchEvents.startY < touchEvents.moveY) {
        this.moveEnd(MOVEMENT_DIRECTION.down);
      }
    });
  }

  enableControls() {
    // TODO
  }

  disableControls() {
    // TODO
  }

  levelUp(newTexture, config) {
    this.renderer.updateTexture(newTexture, this.level.TILE_SIZE);

    for (let prop in config) {
      this[prop] = config[prop];
    }
  }

  updateAnchor(tileSize) {
    // @TODO make configurable, because of different player sprite sizes
    this.anchorX = this.x + tileSize;
    this.anchorY = this.y + tileSize;
  }

  checkFalling(tileSize) {
    const anchorCol = Math.floor(this.anchorX / tileSize);
    const tileBelow = this.level.getTile(this.row + 1, anchorCol);

    if (tileBelow === null) {
      return;
    }

    if (!this.level.canWalkTile(tileBelow.type)) {
      this.isFalling = true;
    }
  }

  fall(tileSize) {
    if (!this.canFly) {
      let nextRow;
      let nextCol;
      let nextTile;

      nextRow = Math.floor((this.y + tileSize + 10) / tileSize);
      nextCol = Math.floor(this.anchorX / tileSize);
      nextTile = this.level.getTile(nextRow, nextCol);

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

  move(tileSize, deltaTime) {
    let nextRow;
    let nextCol;
    let nextTile;

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

    nextTile = this.level.getTile(nextRow, nextCol);

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

  moveStart(direction) {
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
