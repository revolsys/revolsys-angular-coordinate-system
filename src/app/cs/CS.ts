export abstract class CS {

  constructor(public name: string) {
  }

  abstract angle(x1: number, y1: number, x2: number, y2: number): number;

  abstract distance(x1: number, y1: number, x2: number, y2: number): number;

  abstract makePrecise(value: number): number;

  abstract pointOffset(x: number, y: number, distance: number, angle: number): number[];

  abstract toNumber(text: string);
}
