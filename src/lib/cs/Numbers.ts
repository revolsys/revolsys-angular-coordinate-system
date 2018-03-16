export class Numbers {

  static makePrecise(precision: number, value: number): number {
    if (precision) {
      return Math.round(value * precision) / precision;
    } else {
      return value;
    }
  }
}
