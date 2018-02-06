import {Angle} from './Angle';
import {Ellipsoid} from './Ellipsoid';
import {CS} from './CS';
import {GeoCS} from './GeoCS';
import {Numbers} from './Numbers';

export class ProjCS extends CS {
  constructor(
    name: string,
    public geoCS: GeoCS
  ) {
    super(name);
  }

  angle(x1: number, y1: number, x2: number, y2: number): number {
    return Angle.angleCompassDegrees(x1, y1, x2, y2);
  }

  distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  pointOffset(x: number, y: number, distance: number, angle: number): number[] {
    angle = Angle.toRadians(Angle.toCartesian(angle));
    const x2 = this.makePrecise(x + distance * Math.cos(angle));
    const y2 = this.makePrecise(y + distance * Math.sin(angle));
    return [
      x2,
      y2
    ];
  }

  toNumber(text: string): number {
    return parseFloat(text);
  }

  makePrecise(value: number): number {
    return Math.round(value * 1000) / 1000.0;
  }

}
