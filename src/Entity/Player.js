import Entity from './Entity';

import {
  MOVEMENT_DIRECTION,
  MOVEMENT_KEYS,
  MOVEMENT_KEY_CODES,
} from './Player.constants';

class Player extends Entity {
  constructor(level, config) {
    super(level, level.initialPlayerLocation, config);
    this.canFly = false;

    this.setControls();
  }

  setControls() {
    document.addEventListener('keydown', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveStart(MOVEMENT_KEYS[event.key]);
      }
    });

    document.addEventListener('keyup', (event) => {
      if (MOVEMENT_KEY_CODES.includes(event.keyCode)) {
        this.moveEnd(MOVEMENT_KEYS[event.key]);
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
          this.moveEnd(MOVEMENT_DIRECTION.left);
        } else if (touchEvents.startX < touchEvents.moveX) {
          this.moveEnd(MOVEMENT_DIRECTION.right);
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
          this.moveEnd(MOVEMENT_DIRECTION.up);
        } else if (touchEvents.startY < touchEvents.moveY) {
          this.moveEnd(MOVEMENT_DIRECTION.down);
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
    const newTextureSheet = new Image();
    newTextureSheet.src = newTexture;

    this.textureSheet = newTextureSheet;

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
        /** @todo add some sort acceleration, when falling */
        this.y = this.y + tileSize / 8;
      } else {
        this.isFalling = false;
        this.row = nextTile.row - 1;
        this.y = nextTile.y - nextTile.height;
      }

      this.updateAnchor(tileSize);
    }
  }

  move(tileSize) {
    let nextRow;
    let nextCol;
    let nextTile;

    switch (this.direction) {
      case MOVEMENT_DIRECTION.right:
        nextRow = Math.floor(this.y / tileSize);
        nextCol = Math.floor((this.x + tileSize + this.speedX) / tileSize);
        break;
      case MOVEMENT_DIRECTION.left:
        nextRow = Math.floor(this.y / tileSize);
        nextCol = Math.floor((this.x - this.speedX) / tileSize);
        break;
      case MOVEMENT_DIRECTION.up:
        nextRow = Math.floor((this.y + tileSize - this.speedY) / tileSize);
        nextCol = Math.floor(this.anchorX / tileSize);
        break;
      case MOVEMENT_DIRECTION.down:
        nextRow = Math.floor((this.y + tileSize + this.speedY) / tileSize);
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
          this.tileRowOffset = 0;
          this.col = nextTile.col;
          this.x = this.x + this.speedX;
        }

        break;
      case MOVEMENT_DIRECTION.left:
        if ((nextTile.type !== -1 && !this.isOnLadder) || this.canFly) {
          this.tileRowOffset = 1;
          this.col = nextTile.col;
          this.x = this.x - this.speedX;
        }

        break;
      case MOVEMENT_DIRECTION.up:
        if (this.colOffsetInterval === null) {
          this.startAnimation();
        }

        if (this.canFly) {
          this.row = nextTile.row;
          this.y = this.y - this.speedY > 0 ? this.y - this.speedY : 0;
        } else if (this.level.canClimbTile(nextTile.type)) {
          this.isOnLadder = true;
          this.tileRowOffset = 4;
          this.row = nextTile.row;
          this.y = this.y - this.speedY;
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
          this.y = this.y + this.speedY;
        } else if (this.level.canClimbTile(nextTile.type)) {
          this.isOnLadder = true;
          this.tileRowOffset = 5;
          this.row = nextTile.row - 1;
          this.y = this.y + this.speedY;
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

  moveEnd(direction) {
    this.isMoving = false;

    switch (direction) {
      case 'right':
        if (!this.isOnLadder) {
          this.tileRowOffset = 2;
        }
        break;
      case 'left':
        if (!this.isOnLadder) {
          this.tileRowOffset = 3;
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
