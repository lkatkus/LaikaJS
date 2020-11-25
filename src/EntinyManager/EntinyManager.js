class EntinyManager {
  constructor(level, entitiesConfig, Entity) {
    this.entities = entitiesConfig.map(
      (entityConfig) => new Entity(level, entityConfig)
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

  draw(context, tileSize) {
    this.entities.map((entity) => {
      entity.draw(context, tileSize);
    });
  }
}

export default EntinyManager;
