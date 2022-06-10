import { INpcConfig, Npc } from '../Entity';
import { LevelManager } from '../LevelManager';

class EntinyManager {
  entities: Npc[];
  loadingHandler: Promise<void>;

  constructor(
    level: LevelManager,
    entitiesConfig: INpcConfig[],
    EntityConstructor: typeof Npc,
    initRenderer: any
  ) {
    this.entities = entitiesConfig.map(
      (entityConfig) => new EntityConstructor(level, entityConfig, initRenderer)
    );

    this.loadingHandler = new Promise<void>((res) => {
      const npcLodingHandler = this.entities.map(
        ({ loadingHandler }) => loadingHandler
      );

      Promise.all(npcLodingHandler).then(() => res());
    });
  }

  resetPosition(tileSize: number) {
    this.entities.map((entity) => {
      entity.resetPosition(tileSize);
    });
  }

  draw(drawFn: any, deltaTime: number) {
    this.entities.map((entity) => {
      entity.draw(drawFn, deltaTime);
    });
  }
}

export default EntinyManager;
