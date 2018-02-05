export class Angle {
  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  static toDecimalDegrees(text: string): number {
    if (text) {
      text = text.trim();
      if (text.length > 0) {
        const parts = text.split(/[°'":\s]+/);
        let decimalDegrees = 0;
        if (parts.length > 0) {
          decimalDegrees = parseFloat(parts[0]);
        }
        if (parts.length > 1) {
          decimalDegrees += parseFloat(parts[1]) / 60;
        }
        if (parts.length > 2) {
          decimalDegrees += parseFloat(parts[2]) / 3600;
        }
        return decimalDegrees;
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
