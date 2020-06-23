# LaikaJS
It's a simple JavaScript game engine for 2D games based on HTML Canvas.

### Installing
Install the package

```
npm install laikajs
```

Import `Game` and provide configurations

```
import { Game } from 'laikajs'

new Game(
  {
    player: PLAYER_CONFIG,
    npc: NPC_CONFIG,
    level: LEVEL_CONFIG,
    events: EVENTS_CONFIG,
    canvas: document.getElementById('canvasId') /** Canvas to be used. */,
  },
  {
    onLoadGame: () => {
      /** Called when game assets finished loading. */
    },
    onDraw: () => {
      /** Called on each draw cycle. */
    },
  }
);
```

## Demos
- [katkus.eu](http://www.katkus.eu/)

## Authors
- **Laimonas Katkus** - [Github](https://github.com/lkatkus/)

## License
This project is licensed under the ISC License.
