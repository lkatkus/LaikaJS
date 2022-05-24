class EntinyManager {
  constructor(level, entitiesConfig, Entity, initRenderer) {
    this.entities = entitiesConfig.map(
      (entityConfig) => new Entity(level, entityConfig, initRenderer)
    );

    this.loadingHandler = new Promise((resolve) => {
      const npcLodingHandler = this.entities.map(
        ({ loadingHandler }) => loadingHandler
      );

      Promise.all(npcLodingHandler).then(() => resolve());
    });
  }

  resetPosition(tileSize) {
    this.entities.map((entity) => {
      entity.resetPosition(tileSize);
    });
  }

  draw(drawFn, deltaTime) {
    this.entities.map((entity) => {
      entity.draw(drawFn, deltaTime);
    });
  }
}

export default EntinyManager;
