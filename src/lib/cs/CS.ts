export abstract class CS {

  constructor(
    public id: number,
    public name: string
  ) {
  }

  abstract angle(x1: number, y1: number, x2: number, y2: number): number;

  abstract distance(x1: number, y1: number, x2: number, y2: number): number;

  abstract makePrecise(value: number): number;

  abstract pointOffset(x: number, y: number, distance: number, angle: number): number[];

  abstract toNumber(text: string);

  abstract convertPoint(cs: CS, x: number, y: number): number[];

  public equals(cs: CS): boolean {
    if (this === cs) {
      return true;
    } else if (cs) {
      return this.name === cs.name;
    } else {
      return false;
    }
  }

  public project(lon: number, lat: number): number[] {
    return [lon, lat];
  }
}
