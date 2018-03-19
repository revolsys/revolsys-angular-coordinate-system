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

  angleEllipsoid(x1: number, y1: number, x2: number, y2: number): number {
    const lonLat1 = this.inverse(x1, y1);
    const lonLat2 = this.inverse(x2, y2);
    return this.geoCS.angleEllipsoid(lonLat1[0], lonLat1[1], lonLat2[0], lonLat2[1]);
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

  distanceMetres(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  distanceMetresEllipsoid(x1: number, y1: number, x2: number, y2: number): number {
    const lonLat1 = this.inverse(x1, y1);
    const lonLat2 = this.inverse(x2, y2);
    return this.geoCS.distanceMetresEllipsoid(lonLat1[0], lonLat1[1], lonLat2[0], lonLat2[1]);
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

  toX(text: string): number {
    return parseFloat(text);
  }

  toY(text: string): number {
    return parseFloat(text);
  }

  makePrecise(value: number): number {
    return Math.round(value * 1000) / 1000.0;
  }

  public inverse(x: number, y: number): number[] {
    const point = this.inverseRadians(x, y);
    point[0] = Angle.toDegrees(point[0]);
    point[1] = Angle.toDegrees(point[1]);
    return point;
  }

  public inverseRadians(x: number, y: number): number[] {
    throw new Error('Inverse operation not supported');
  }

  public project(lon: number, lat: number): number[] {
    const λ = Angle.toRadians(lon);
    const φ = Angle.toRadians(lat);
    return this.projectRadians(λ, φ);
  }

  public projectRadians(λ: number, φ: number): number[] {
    throw new Error('Inverse operation not supported');
  }

}
