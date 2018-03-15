export class Angle {
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

  static toDecimalDegrees(text: string): number {
    if (text) {
      text = text.toString().trim();

      if (text.length > 0) {
        let negative = false;
        if (text.endsWith('S') || text.endsWith('W')) {
          negative = true;
          text = text.substring(0, text.length).trim();
        } else if (text.endsWith('E') || text.endsWith('N')) {
          text = text.substring(0, text.length).trim();
        }
        const parts = text.split(/[\*°'":\s]+/);
        let decimalDegrees = 0;
        if (parts.length > 0) {
          decimalDegrees = parseFloat(parts[0]);
          if (decimalDegrees < 0) {
            negative = true;
            decimalDegrees = -decimalDegrees;
          }
        }
        if (parts.length > 1) {
          const minutes = parseFloat(parts[1]) / 60;
          if (!isNaN(minutes)) {
            decimalDegrees += minutes;
          }
        }
        if (parts.length > 2) {
          const seconds = parseFloat(parts[2]) / 3600;
          if (!isNaN(seconds)) {
            decimalDegrees += seconds;
          }
        }
        if (negative) {
          return -decimalDegrees;
        } else {
          return decimalDegrees;
        }
      }
    }
    return null;
  }

  static toDegreesMinutesSeconds(decimalDegrees: number): string {
    if (decimalDegrees !== null) {
      const degrees = Math.floor(decimalDegrees);
      let text = degrees + '°';
      const decimal = decimalDegrees - degrees;
      const minutes = Math.floor(decimal * 60);
      if (minutes < 10) {
        text += '0';
      }
      text += minutes + '\'';
      const seconds = (decimal * 3600) % 60;
      if (seconds < 10) {
        text += '0';
      }
      text += seconds + '\'';
      return text;
    }
    return null;
  }
}
