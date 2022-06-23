import { IColor, IFlatColor, IGradient } from '../../Renderers.models';

const normalizedRgbToRgb = (nrgb: IColor) =>
  nrgb.map((value) => Math.floor(value * 255));

const getRgbValue = (color: IColor) =>
  `rgb(${normalizedRgbToRgb(color).join(',')})`;

class SkyRenderer {
  ctx: CanvasRenderingContext2D;
  bgColor: IFlatColor | IGradient;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;

    this.bgColor = { type: 'flat', color: [255, 255, 255] };
  }

  render() {
    const { ctx, bgColor } = this;

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);

    if (bgColor.type === 'flat') {
      gradient.addColorStop(0, getRgbValue(bgColor.color));
    } else {
      gradient.addColorStop(0, getRgbValue(bgColor.color[0]));
      gradient.addColorStop(1, getRgbValue(bgColor.color[1]));
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}

export default SkyRenderer;
