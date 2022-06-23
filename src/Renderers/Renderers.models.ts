export type IColor = [number, number, number];

export interface IFlatColor {
  type: 'flat';
  color: IColor;
}

export interface IGradient {
  type: 'gradient';
  color: [IColor, IColor];
}
