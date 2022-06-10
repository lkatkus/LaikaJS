import { ITile } from '../../LevelManager';
import { M3x3 } from '../utils';
import { TilesRenderer } from './TilesRenderer';
import { SpriteRenderer } from './SpriteRenderer';
import { ITilesRendererOptions } from './TilesRenderer/TilesRenderer';

interface IParallaxConfig {
  x: number;
  y: number;
}

export interface IWebGlRendererOptions {
  parallaxScaling?: IParallaxConfig;
  clearColor?: [number, number, number, number];
}

class WebGlRenderer {
  gl: WebGLRenderingContext;
  screenWidth: number;
  screenHeight: number;
  parallaxScaling: IParallaxConfig;
  wRatio: number;
  offsetX: number;
  offsetY: number;
  worldSpaceMatrix: M3x3;
  scaleWorldSpaceMatrix: M3x3;
  bgRenderer: TilesRenderer;

  constructor(gl: WebGLRenderingContext, options: IWebGlRendererOptions = {}) {
    const { drawingBufferWidth, drawingBufferHeight } = gl;

    this.gl = gl;
    this.screenWidth = drawingBufferWidth;
    this.screenHeight = drawingBufferHeight;
    this.parallaxScaling = {
      x: options.parallaxScaling?.x || 1,
      y: options.parallaxScaling?.y || 1,
    };
    this.wRatio = this.screenWidth / this.screenHeight;

    this.worldSpaceMatrix = new M3x3();
    this.worldSpaceMatrix = this.worldSpaceMatrix
      .transition(-1, 1)
      .scale(2 / this.screenWidth, -2 / this.screenHeight);

    this.scaleWorldSpaceMatrix = new M3x3();
    this.scaleWorldSpaceMatrix = this.worldSpaceMatrix
      .transition(-1, 1)
      .scale(2 / this.screenWidth, -2 / this.screenHeight);

    this.gl.clearColor(...(options.clearColor || [0, 0, 0, 0]));

    this.renderLevel = this.renderLevel.bind(this);
    this.renderSprite = this.renderSprite.bind(this);

    this.initBackgroundRenderer = this.initBackgroundRenderer.bind(this);
    this.initSpriteRenderer = this.initSpriteRenderer.bind(this);

    this.offsetX = 0;
    this.offsetY = 0;
  }

  initBackgroundRenderer(
    texture: TexImageSource,
    config: ITilesRendererOptions
  ) {
    this.bgRenderer = new TilesRenderer(this.gl, texture, config);
  }

  initSpriteRenderer(
    texture: {
      source: TexImageSource;
      height: number;
      width: number;
      tileCols: number;
      drawOffset: number;
      drawHeightOffset: number;
      drawWidthOffset: number;
    },
    tileSize: number
  ) {
    return new SpriteRenderer(this.gl, texture.source, {
      width: texture.width,
      height: texture.height,
      renderWidth: tileSize * (texture.drawWidthOffset || 1),
      renderHeight: tileSize * (texture.drawHeightOffset || 1),
    });
  }

  onBeforeRender() {
    const { gl, screenWidth, screenHeight } = this;

    gl.viewport(0, 0, screenWidth, screenHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  onAfterRender() {
    const { gl } = this;

    gl.flush();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    gl.endFrameEXP && gl.endFrameEXP(); // Required for react native app using expo gl-view
  }

  renderLevel(tilesToRender: ITile[]) {
    this.bgRenderer.render(
      tilesToRender,
      this.worldSpaceMatrix,
      this.scaleWorldSpaceMatrix
    );
  }

  renderSprite(
    renderer: SpriteRenderer,
    image: TexImageSource,
    sx: number,
    sy: number,
    sWidth: number,
    sHeight: number,
    dx: number,
    dy: number
  ) {
    const frames = {
      x: sx > 0 ? (sx * image.width) / sWidth / image.width : 0,
      y: sy > 0 ? (sy * image.height) / sHeight / image.height : 0,
    };

    renderer.render({ x: dx, y: dy }, frames, this.worldSpaceMatrix);
  }

  translate(x = 0, y = 0) {
    const nextOffsetX = -(this.offsetX - x);
    const nextOffsetY = -(this.offsetY - y);
    // @TODO handle twitching, when changing offset
    const scaledNextOffsetX = -(
      this.offsetX - Math.floor(x / this.parallaxScaling.x)
    );
    const scaledNextOffsetY = -(
      this.offsetY - Math.floor(y / this.parallaxScaling.y)
    );

    this.worldSpaceMatrix = this.worldSpaceMatrix.transition(
      nextOffsetX,
      nextOffsetY
    );
    this.scaleWorldSpaceMatrix = this.worldSpaceMatrix.transition(
      scaledNextOffsetX,
      scaledNextOffsetY
    );

    this.offsetX = x;
    this.offsetY = y;
  }
}

export default WebGlRenderer;
