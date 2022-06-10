import { LevelManager } from '../LevelManager';
import Entity, { IEntityConfig, IEntityDirection } from './Entity';

export interface INpcConfig extends IEntityConfig {
  min: { row: number; col: number };
  max: { row: number; col: number };
}

class Npc extends Entity {
  config: INpcConfig;

  constructor(level: LevelManager, config: INpcConfig, initRenderer: any) {
    const spawnTile = level.getTile(config.min.row, config.min.col);

    if (!spawnTile) {
      throw new Error(
        `Invalid npc '${config.name}' spawn location. Check if it is a valid tile.`
      );
    }

    super(level, spawnTile, config, initRenderer);

    this.config = config;

    this.moveStart('right');
  }

  moveStart(direction: IEntityDirection) {
    this.isMoving = true;
    this.direction = direction;
  }

  moveEnd(direction: IEntityDirection) {
    this.isMoving = false;

    switch (direction) {
      case 'right':
        this.tileRowOffset = 0;
        break;
      case 'left':
        this.tileRowOffset = 1;
        break;
      // TODO
      case 'up':
        break;
      case 'down':
        break;
    }
  }

  move(tileSize: number, deltaTime: number) {
    const offsetSpeedX = this.speedX * deltaTime;
    const offsetSpeedY = this.speedY * deltaTime;

    this.row = Math.floor(this.y / tileSize);
    this.col = Math.floor(this.x / tileSize);

    if (this.col >= this.config.max.col && this.direction === 'right') {
      this.x = Math.floor(this.config.max.col * tileSize);
      this.moveEnd(this.direction);
      this.tileRowOffset = 2;

      return setTimeout(() => {
        this.moveStart('left');
      }, 2000);
    }

    if (this.col < this.config.min.col && this.direction === 'left') {
      this.x = Math.floor(this.config.min.col * tileSize);
      this.moveEnd(this.direction);
      this.tileRowOffset = 3;

      return setTimeout(() => {
        this.moveStart('right');
      }, 5000);
    }

    // TODO use consts for direction
    switch (this.direction) {
      case 'right':
        this.tileRowOffset = 0;
        this.x = this.x + offsetSpeedX;
        break;
      case 'left':
        this.tileRowOffset = 1;
        this.x = this.x - offsetSpeedX;
        break;
      case 'up':
        this.y = this.y - offsetSpeedY;
        break;
      case 'down':
        this.y = this.y + offsetSpeedY;
        break;
    }
  }
}

export default Npc;
