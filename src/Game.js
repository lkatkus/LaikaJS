import { LevelManager } from './LevelManager';
import { EventManager } from './EventManager';
import { Camera } from './Camera';
import { Npc, Player } from './Entity';
import { EntinyManager } from './EntinyManager';

class Game {
  constructor(config, { onAfterInit, onLoadGame, onDraw }) {
    const loadingHandlers = [];

    this.onDraw = onDraw;
    this.renderer = config.initRenderer({
      parallaxScaling: config.level.parallaxScaling,
    });

    if (config.initAudioPlayer) {
      this.audioPlayer = config.initAudioPlayer(config.options.audio);
    }

    this.mainDraw = this.mainDraw.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.startGame = this.startGame.bind(this);

    this.level = new LevelManager(this.renderer, config.level);
    loadingHandlers.push(this.level.loadingHandler);

    this.player = new Player(
      this.level,
      config.player,
      this.renderer.initSpriteRenderer
    );
    loadingHandlers.push(this.player.loadingHandler);

    this.camera = new Camera(this.level, this.player);
    this.camera.setInitialCamera(
      this.renderer.screenWidth,
      this.renderer.screenHeight
    );

    if (config.npc) {
      this.npcManager = new EntinyManager(
        this.level,
        config.npc,
        Npc,
        this.renderer.initSpriteRenderer
      );

      loadingHandlers.push(this.npcManager.loadingHandler);
    }

    if (config.events) {
      this.eventManager = new EventManager(config.events, {
        game: this,
        player: this.player,
      });
    }

    onAfterInit && onAfterInit(this);

    Promise.all(loadingHandlers).then(() => onLoadGame(this));
  }

  handleResize(screenWidth, screenHeight) {
    window.cancelAnimationFrame(this.drawInterval);

    this.level.resetTileSize(screenWidth, screenHeight);
    this.npcManager && this.npcManager.resetPosition(this.level.TILE_SIZE);
    this.player.resetPosition(this.level.TILE_SIZE);
    this.camera.resetCameraOffset(screenWidth, screenHeight);

    window.requestAnimationFrame(this.mainDraw);
  }

  mainDraw(currentTime) {
    const deltaTime = (currentTime - this.previousTime) / 1000.0;
    this.previousTime = currentTime;

    this.renderer.onBeforeRender();

    this.camera.updateCameraOffset(
      this.renderer.screenWidth,
      this.renderer.screenHeight,
      deltaTime
    );
    this.renderer.translate(this.camera.offsetX, this.camera.offsetY);

    this.level.draw(
      this.renderer.renderLevel,
      this.camera.offsetX,
      this.camera.offsetY
    );
    this.npcManager &&
      this.npcManager.draw(this.renderer.renderSprite, deltaTime);
    this.player.draw(this.renderer.renderSprite, deltaTime);

    this.renderer.onAfterRender();

    this.drawInterval = window.requestAnimationFrame(this.mainDraw);
    this.eventManager && this.eventManager.checkEvent(this.player);

    this.onDraw && this.onDraw(this);
  }

  startGame() {
    window.requestAnimationFrame(
      function (currentTime) {
        this.previousTime = currentTime;
        this.mainDraw(currentTime);
      }.bind(this)
    );
  }
}

export default Game;
