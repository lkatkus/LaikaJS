import { LevelManager } from './LevelManager';
import { EventManager } from './EventManager';
import { Camera } from './Camera';
import { Npc, Player } from './Entity';
import { EntinyManager } from './EntinyManager';

class Game {
  constructor(config, { onLoadGame, onDraw }) {
    const loadingHandlers = [];

    this.onDraw = onDraw;
    this.drawFn = this.drawFn.bind(this);
    this.mainDraw = this.mainDraw.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.startGame = this.startGame.bind(this);

    this.setCanvas(config.canvas);

    this.level = new LevelManager(this.canvas, config.level);
    loadingHandlers.push(this.level.loadingHandler);
    this.player = new Player(this.level, config.player);
    loadingHandlers.push(this.player.loadingHandler);
    this.camera = new Camera(this.level, this.player);
    this.camera.setInitialCamera(this.canvas.width, this.canvas.height);

    if (config.npc) {
      this.npcManager = new EntinyManager(this.level, config.npc, Npc);
      loadingHandlers.push(this.npcManager.loadingHandler);
    }

    if (config.events) {
      this.eventManager = new EventManager(config.events, {
        game: this,
        player: this.player,
      });
    }

    Promise.all(loadingHandlers).then(() => onLoadGame(this));
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

    this.level.resetTileSize(this.canvas);
    this.npcManager && this.npcManager.resetPosition(this.level.TILE_SIZE);
    this.player.resetPosition(this.level.TILE_SIZE);
    this.camera.resetCameraOffset(this.canvas.width, this.canvas.height);

    window.requestAnimationFrame(this.mainDraw);
  }

  drawFn(...props) {
    /**
     * @todo add adbility to pass drawFn from outside.
     * E.x. webgl context wrapper or something like that
     */
    this.context.drawImage(...props);
  }

  mainDraw() {
    this.camera.updateCameraOffset(this.canvas.width, this.canvas.height);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.save();
    this.context.translate(this.camera.offsetX, this.camera.offsetY);

    this.level.draw(this.drawFn, this.camera.offsetX, this.camera.offsetY);
    this.npcManager && this.npcManager.draw(this.drawFn, this.level.TILE_SIZE);
    this.player.draw(this.drawFn, this.level.TILE_SIZE);
    this.onDraw && this.onDraw();
    this.context.restore();

    this.drawInterval = window.requestAnimationFrame(this.mainDraw);
    this.eventManager && this.eventManager.checkEvent(this.player);
  }

  startGame() {
    window.requestAnimationFrame(this.mainDraw);
  }
}

export default Game;
