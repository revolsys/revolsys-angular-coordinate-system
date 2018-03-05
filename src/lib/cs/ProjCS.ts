import {Angle} from './Angle';
import {Ellipsoid} from './Ellipsoid';
import {CS} from './CS';
import {GeoCS} from './GeoCS';
import {Numbers} from './Numbers';

export class ProjCS extends CS {
  constructor(
    id: number,
    name: string,
    public geoCS: GeoCS
  ) {
    super(id, name);
  }

  angle(x1: number, y1: number, x2: number, y2: number): number {
    return Angle.angleCompassDegrees(x1, y1, x2, y2);
  }

  public convertPoint(cs: CS, x: number, y: number): number[] {
    if (this === cs) {
      return [x, y];
    } else if (cs instanceof GeoCS) {
      return this.inverse(x, y);
    } else if (cs instanceof ProjCS) {
      const lonLat = this.inverse(x, y);
      // No datum conversion
      const projCs = <ProjCS>cs;
      return projCs.project(lonLat[0], lonLat[1]);
    } else {
      return null;
    }
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

  public inverse(x: number, y: number): number[] {
    throw new Error('Inverse operation not supported');
  }

  public project(lon: number, lat: number): number[] {
    throw new Error('Project operation not supported');
  }


}
