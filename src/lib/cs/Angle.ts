export class Angle {
  static readonly RE_DMS = new RegExp('^\\s*(-?\\d+)(?:\.(\\d+)?|(?:[*° ](60|[0-5]?\\d)(?:[ \'](60|[0-5]?\\d(?:\.\\d{1,6})?)"?)?)?)\\s*$');
  static readonly RE_LAT = new RegExp(
    '^\\s*(-?\\d+)(?:\.(\\d+)?|(?:[*° ](60|[0-5]?\\d)(?:[ \'](60|[0-5]?\\d(?:\.\\d{1,6})?)"?)?)?([NS])?)\\s*$');
  static readonly RE_LON = new RegExp(
    '^\\s*(-?\\d+)(?:\.(\\d+)?|(?:[*° ](60|[0-5]?\\d)(?:[ \'](60|[0-5]?\\d(?:\.\\d{1,6})?)"?)?)?([WE])?)\\s*$');

  static RAD_DEGREE = 0.01745329251994328;

  static PI_TIMES_2 = 2.0 * Math.PI;

  static angleDegrees(x1: number, y1: number, x2: number, y2: number): number {
    const width = x2 - x1;
    const height = y2 - y1;
    if (width === 0) {
      if (height < 0) {
        return 270;
      } else {
        return 90;
      }
    } else if (height === 0) {
      if (width < 0) {
        return 180;
      } else {
        return 0;
      }
    }
    const arctan = Math.atan(height / width);
    const degrees = Angle.toDegrees(arctan);
    if (width < 0) {
      return 180 + degrees;
    } else {
      return (360 + degrees) % 360;
    }
  }

  static angleCompassDegrees(x1: number, y1: number, x2: number, y2: number): number {
    return Angle.toCompass(Angle.angleDegrees(x1, y1, x2, y2));
  }

  static toCompass(degrees: number): number {
    return (450 - degrees) % 360;
  }

  static toCartesian(degrees: number): number {
    return (450 - degrees) % 360;
  }

  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static toDegrees360(radians: number): number {
    const degrees = (radians * 180) / Math.PI;
    if (degrees < 0) {
      return 360 + degrees;
    } else {
      return degrees;
    }
  }

  static toDegrees(radians: number): number {
    return radians * 180.0 / Math.PI;
  }

  static toDecimalDegrees(dms: any, regEx = Angle.RE_DMS): number {
    if (dms) {
      const dmsString = dms.toString().trim();
      const match = dmsString.match(regEx);
      if (match) {
        const degrees = match[1];
        const decimal = match[2];
        if (decimal) {
          return parseFloat(degrees + '.' + decimal);
        } else {
          const minutes = match[3];
          const seconds = match[4];
          const direction = match[5];
          let negative = direction === 'S' || direction === 'W';
          let result = parseFloat(degrees);
          if (result < 0) {
            negative = true;
            result = -result;
          }

          if (minutes) {
            result += parseFloat(minutes) / 60;
          }
          if (seconds) {
            result += parseFloat(seconds) / 3600;
          }

          if (negative) {
            return -result;
          } else {
            return result;
          }
        }
      }
    }
    return null;
  }

  static toDegreesMinutesSeconds(angle: any, secondsDecimalPlaces?: number): string {
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

  static toDegreesMinutesSecondsLat(angle: any, secondsDecimalPlaces?: number): string {
    if (angle < 0) {
      return this.toDegreesMinutesSeconds(-angle, secondsDecimalPlaces) + 'S';
    } else {
      return this.toDegreesMinutesSeconds(angle, secondsDecimalPlaces) + 'N';
    }
  }

  static toDegreesMinutesSecondsLon(angle: any, secondsDecimalPlaces?: number): string {
    if (angle < 0) {
      return this.toDegreesMinutesSeconds(-angle, secondsDecimalPlaces) + 'W';
    } else {
      return this.toDegreesMinutesSeconds(angle, secondsDecimalPlaces) + 'E';
    }
  }
}
