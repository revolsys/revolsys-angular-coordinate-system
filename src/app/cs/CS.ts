export abstract class CS {

  constructor(public name: string) {
  }

  abstract distanceAndAngle(x1: number, y1: number, x2: number, y2: number): number[];
}
