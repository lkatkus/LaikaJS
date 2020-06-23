import { LevelManager } from './LevelManager';
import { EventManager } from './EventManager';
import { Camera } from './Camera';
import { Npc, Player } from './Entity';
import { EntinyManager } from './EntinyManager';

class Game {
  constructor(config, { onLoadGame, onDraw }) {
    this.mainDraw = this.mainDraw.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.onDraw = onDraw;

    this.setCanvas(config.canvas);

    this.level = new LevelManager(this.canvas, this.context, config.level);
    this.player = new Player(this.context, this.level, config.player);
    this.npcManager = new EntinyManager(
      this.context,
      this.level,
      config.npc,
      Npc
    );
    this.camera = new Camera(this.canvas, this.level, this.player);
    this.eventManager = new EventManager(config.events, {
      game: this,
      player: this.player,
    });

    Promise.all([
      this.level.loadingHandler,
      this.player.loadingHandler,
      this.npcManager.loadingHandler,
    ]).then(() => this.startGame(onLoadGame));
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    window.addEventListener('resize', this.handleResize);
  }

  handleResize() {
    window.cancelAnimationFrame(this.drawInterval);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.level.resetTileSize();
    this.npcManager.resetPosition(this.level.TILE_SIZE);
    this.player.resetPosition(this.level.TILE_SIZE);
    this.camera.resetCameraOffset();

    window.requestAnimationFrame(this.mainDraw);
  }

  mainDraw() {
    this.camera.updateCameraOffset();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    this.context.translate(this.camera.offsetX, this.camera.offsetY);

    this.level.draw(this.camera.offsetX, this.camera.offsetY);
    this.npcManager.draw(this.level.TILE_SIZE);
    this.player.draw(this.level.TILE_SIZE);
    this.onDraw && this.onDraw();
    this.context.restore();

    this.drawInterval = window.requestAnimationFrame(this.mainDraw);
    this.eventManager.checkEvent(this.player);
  }

  startGame(onLoadCallback) {
    onLoadCallback && onLoadCallback();
    window.requestAnimationFrame(this.mainDraw);
  }
}

export default Game;
