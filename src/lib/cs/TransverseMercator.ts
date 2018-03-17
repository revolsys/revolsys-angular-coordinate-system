import {Angle} from './Angle';
import {ProjCS} from './ProjCS';
import {GeoCS} from './GeoCS';

export class TransverseMercator extends ProjCS {
  public readonly a: number;

  public readonly b: number;

  public readonly λo: number;

  public readonly φo: number;


  constructor(
    id: number,
    name: string,
    geoCS: GeoCS,
    public readonly latitudeOfOrigin: number,
    public readonly centralMeridan: number,
    public readonly ko: number,
    public readonly xo: number,
    public readonly yo: number,
  ) {
    super(id, name, geoCS);
    const latitudeOfNaturalOrigin = latitudeOfOrigin;
    const centralMeridian = centralMeridan;

    const ellipsoid = geoCS.ellipsoid;
    this.λo = Angle.toRadians(centralMeridian);
    this.φo = Angle.toRadians(centralMeridian);
    this.a = ellipsoid.semiMajorAxis;
    this.b = ellipsoid.semiMinorAxis;
  }

  public sinPhi(x1: number, y1: number, x2: number, y2: number): number {
    const phi1 = this.inverseRadians(x1, y1)[1];
    const phi2 = this.inverseRadians(x2, y2)[1];
    const phi = (phi1 + phi2) / 2;
    return Math.sin(phi);
  }

  public ttCorrection(x1: number, y1: number, x2: number, y2: number): number {
    const a = this.a;
    const b = this.b;
    const x0 = this.xo;
    const sinPhi = this.sinPhi(x1, y1, x2, y2);

    const xi = x1 - x0;
    const xj = x2 - x0;
    const bOverA = b / a;
    const esq = 1 - bOverA * bOverA;
    const r = b / (1 - esq * (sinPhi * sinPhi));
    const rsq = r * r;
    const rsq6 = rsq * 6;
    const x = xj + xi * 2;
    let tt = (y2 - y1) * x / rsq6 * (1 - x * x / (rsq * 27));
    if (tt < 0) {
      tt = -tt;
    }
    return Angle.toDegrees360(tt) * 3600 % 60;
  }

  public lineScaleFactor(x1: number, y1: number, x2: number, y2: number): number {
    const a = this.a;
    const b = this.b;
    const x0 = this.xo;
    const sf = this.ko;

    const sinPhi = this.sinPhi(x1, y1, x2, y2);

    const xi = x1 - x0;
    const xj = x2 - x0;
    const bOverA = b / a;
    const esq = 1 - bOverA * bOverA;
    const r = b / (1 - esq * (sinPhi * sinPhi));
    const rsq = r * r;
    const rsq6 = rsq * 6;
    const xusq = xi * xi + xi * xj + xj * xj;
    return sf * (xusq / rsq6 * (xusq / (rsq * 36) + 1) + 1);
  }
}
