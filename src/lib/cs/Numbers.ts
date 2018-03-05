export class Numbers {

  static degreesToDms(angle: any, secondsDecimalPlaces?: number): string {
    let text = '';
    if (angle < 0) {
      text = '-';
      angle = -angle;
    }
    const degrees = Math.floor(angle);
    const minutes = Math.floor(angle * 60) % 60;
    const seconds = angle * 3600 % 60;

    text += degrees;
    text += ' ';
    if (minutes < 10) {
      text += '0';
    }
    text += minutes;
    text += ' ';
    if (seconds < 10) {
      text += '0';
    }
    if (secondsDecimalPlaces === undefined) {
      text += seconds;
    } else {
      text += seconds.toFixed(secondsDecimalPlaces);
    }
    return text;
  }

  static degreesToDmsLat(angle: any, secondsDecimalPlaces?: number): string {
    if (angle < 0) {
      return this.degreesToDms(-angle, secondsDecimalPlaces) + 'S';
    } else {
      return this.degreesToDms(angle, secondsDecimalPlaces) + 'N';
    }
  }

  static degreesToDmsLon(angle: any, secondsDecimalPlaces?: number): string {
    if (angle < 0) {
      return this.degreesToDms(-angle, secondsDecimalPlaces) + 'W';
    } else {
      return this.degreesToDms(angle, secondsDecimalPlaces) + 'E';
    }
  }

  static makePrecise(precision: number, value: number): number {
    if (precision) {
      return Math.round(value * precision) / precision;
    } else {
      return value;
    }
  }
}
