# LaikaJS
It's a simple JavaScript game engine for 2D games based on HTML Canvas.

### Installing
Install the package

```
npm install laikajs
```

Import `Game` and provide configurations

```javascript
import { Game } from 'laikajs'

const PLAYER_CONFIG = {
  // Player entity name
  name: 'player',
  // Player movement parameters
  movement: {
    // Initial player horizontal movement speed
    speedX: 10,
    // Initial player vertical movement speed
    speedY: 12,
  },
  // Player entity texture configuration
  texture: {
    // Tile sheet image source
    source: playerTileSheet,
    // Single sprite frame height
    height: 200,
    // Single sprite frame width
    width: 100,
    // Amount of sprite frames in the tile sheet row
    tileCols: 8,
    // Vertical offset for player sprite
    drawOffset: 1,
    // Vertical size scaling for the player sprite
    drawHeightOffset: 2,
  },
};

const LEVEL_CONFIG = {
  // Level layout. Array of rows, where row is an array of tile indeces from the tile sheet.
  layout: [
    [0, 0, 0, 0, 0, 0],
    [0, 3, 22, 2, 0, 0],
    [0, 'x', 23, 0, 0, 0],
    [1, 1, 1, 1, 1, 1],
  ],
  // Tile marker for the player to be spawned in
  spawnMarker: 'x',
  // Tile sheet configuration object
  tileSheet: {
    // Tile sheet image source
    src: levelTileSheet,
    // Amount of tile to be fitted on screen.
    tilesPerRow: 10,
    // Tile sheet width in px.
    width: 1200,
    // Tile sheet height in px.
    height: 1200,
    // Amount of tile rows in the tile sheet.
    rows: 20,
    // Amount of tiles in a single tile sheet row.
    cols: 20,
    // A single tile size in px.
    spriteSize: 1200 / 20,
    // Configuration for different types of tiles.
    types: {
      // Solid tiles for collision
      solid: [1, 2, 3],
      // Tiles that can be climbed
      climbable: [22, 23],
      // Tiles without any texture, but checkt for collision
      nonTexture: [-1],
    },
  },
};

const StartGame = () => {
  const MyGame = new Game(
    {
      canvas: document.getElementById('canvas'),
      player: PLAYER_CONFIG,
      level: LEVEL_CONFIG,
    },
    {
      onLoadGame: (game) => {
        // Function called after the game and all assets have been loaded
        // To actually start the game script, you must call game.startGame
        game.startGame()
      },
      onDraw: (game) => {
        // Function called on each draw cycle
        // Useful for debugging as it get the whole game object
      },
    }
  );
};

StartGame();
```

## Demos
- [katkus.eu](http://www.katkus.eu/)

## Authors
- **Laimonas Katkus** - [Github](https://github.com/lkatkus/)

## License
This project is licensed under the ISC License.
