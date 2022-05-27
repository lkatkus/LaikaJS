export type ITileType = string | number;
export type ITileTexture = {
  x: number;
  y: number;
};

export class LevelTile {
  x: number;
  y: number;
  row: number;
  col: number;
  type: ITileType;
  texture: ITileTexture | -1;
  width: number;
  height: number;

  constructor(
    row: number,
    col: number,
    tileSize: number,
    texture: ITileTexture | -1,
    type: ITileType
  ) {
    this.x = col * tileSize;
    this.y = row * tileSize;
    this.row = row;
    this.col = col;
    this.type = type;
    this.texture = texture;
    this.width = tileSize;
    this.height = tileSize;
  }

  updateTileSize(newTileSize: number) {
    this.x = this.col * newTileSize;
    this.y = this.row * newTileSize;
    this.width = newTileSize;
    this.height = newTileSize;
  }
}
