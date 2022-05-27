import { ILevelManagerConfig, LevelManager } from './LevelManager';
import { EventManager, IEventsManagerConfig } from './EventManager';
import { Camera } from './Camera';
import { INpcConfig, IPlayerConfig, Npc, Player } from './Entity';
import { EntinyManager } from './EntinyManager';

export interface IGameConfig {
  initRenderer: any;
  initAudioPlayer: any;
  level: ILevelManagerConfig;
  player: IPlayerConfig;
  npc: INpcConfig[];
  events: IEventsManagerConfig;
}

interface IGameHandlers {
  onAfterInit: (game: Game) => void;
  onLoadGame: (game: Game) => void;
  onDraw: (game: Game) => void;
}

class Game {
  onDraw: (game: Game) => void;

  renderer: any;
  audioPlayer: any;
  level: LevelManager;
  player: Player;
  camera: Camera;
  npcManager: EntinyManager;
  eventManager: EventManager;

  previousTime: number;
  drawInterval: ReturnType<typeof window.requestAnimationFrame>;

  constructor(
    config: IGameConfig,
    { onAfterInit, onLoadGame, onDraw }: IGameHandlers
  ) {
    const loadingHandlers = [];

    this.onDraw = onDraw;
    this.renderer = config.initRenderer({
      parallaxScaling: config.level.parallaxScaling,
    });

    if (config.initAudioPlayer) {
      this.audioPlayer = config.initAudioPlayer();
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

  handleResize(screenWidth: number, screenHeight: number) {
    window.cancelAnimationFrame(this.drawInterval);

    this.level.resetTileSize(screenWidth, screenHeight);
    this.npcManager && this.npcManager.resetPosition(this.level.tileSize);
    this.player.resetPosition(this.level.tileSize);
    this.camera.resetCameraOffset(screenWidth, screenHeight);

    window.requestAnimationFrame(this.mainDraw);
  }

  mainDraw(currentTime: number) {
    const deltaTime = (currentTime - this.previousTime) / 1000.0;
    this.previousTime = currentTime;

    this.renderer.onBeforeRender();

    this.camera.updateCameraOffset(
      this.renderer.screenWidth,
      this.renderer.screenHeight,
      deltaTime
    );
    this.renderer.translate(this.camera.offsetX, this.camera.offsetY);

    this.level.onBeforeDraw(this.camera.offsetX, this.camera.offsetY);
    this.level.drawBackground(this.renderer.renderLevel);
    this.level.drawStage(this.renderer.renderLevel);

    if (this.npcManager) {
      this.npcManager.draw(this.renderer.renderSprite, deltaTime);
    }

    if (this.player.canFly) {
      this.level.drawForeground(this.renderer.renderLevel);
    }

    this.player.draw(this.renderer.renderSprite, deltaTime);

    if (!this.player.canFly) {
      this.level.drawForeground(this.renderer.renderLevel);
    }

    this.renderer.onAfterRender();

    this.drawInterval = window.requestAnimationFrame(this.mainDraw);
    this.eventManager && this.eventManager.checkEvent(this.player);

    this.onDraw && this.onDraw(this);
  }

  startGame() {
    window.requestAnimationFrame((currentTime) => {
      this.previousTime = currentTime;
      this.mainDraw(currentTime);
    });
  }
}

export default Game;
