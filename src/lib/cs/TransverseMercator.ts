import {Angle} from './Angle';
import {ProjCS} from './ProjCS';
import {GeoCS} from './GeoCS';

export class TransverseMercator extends ProjCS {
  private a: number;

  private b: number;

  private a0: number;

  private a2: number;

  private a4: number;

  private a6: number;

  private a8: number;


  private λo: number;

  private m0: number;

  public get x0(): number {
    return this.xo;
  }


  public get y0(): number {
    return this.yo;
  }

  private e: number;

  constructor(
    id: number,
    name: string,
    geoCs: GeoCS,
    public readonly latitudeOfOrigin: number,
    public readonly centralMeridan: number,
    public readonly ko: number,
    public readonly xo: number,
    public readonly yo: number,
  ) {
    super(id, name, geoCs);
    const latitudeOfNaturalOrigin = latitudeOfOrigin;
    const centralMeridian = centralMeridan;

    const ellipsoid = this.geoCS.ellipsoid;
    this.λo = Angle.toRadians(centralMeridian);
    this.a = ellipsoid.semiMajorAxis;
    this.b = ellipsoid.semiMinorAxis;

    const e2 = (this.a * this.a - this.b * this.b) / (this.a * this.a);
    this.e = Math.sqrt(e2);

    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const e8 = e6 * e2;
    this.a0 = 1 - e2 / 4 - e4 * 3 / 64 - e6 * 5 / 256 - e8 * 175 / 16384;
    this.a2 = (e2 + e4 / 4. + e6 * 15. / 128. - e8 * 455. / 4096.) * .375;
    this.a4 = (e4 + e6 * 3. / 4. - e8 * 77. / 128.) * .05859375;
    this.a6 = (e6 - e8 * 41. / 32.) * .011393229166666666;
    this.a8 = e8 * -315. / 131072.;
  }

  public inverseRadians(x: number, y: number): number[] {
    x = (x - this.xo) / this.ko;
    y /= this.ko;
    const a = this.a;
    const b = this.b;
    const e = this.e;

    let phi1 = y / a;
    let dphi;
    do {
      dphi = (a * (this.a0 * phi1 - this.a2 * Math.sin(phi1 * 2) + this.a4 * Math.sin(phi1 * 4)
        - this.a6 * Math.sin(phi1 * 6) + this.a8 * Math.sin(phi1 * 8)) - y)
        / (a * (this.a0 - this.a2 * 2 * Math.cos(phi1 * 2) + this.a4 * 4. * Math.cos(phi1 * 4)
          - this.a6 * 6 * Math.cos(phi1 * 6) + this.a8 * 8 * Math.cos(phi1 * 8)));
      phi1 -= dphi;
    } while (Math.abs(dphi) >= 1e-15);

    const t = Math.tan(phi1);
    const tp2 = t * t;
    const tp4 = tp2 * tp2;
    const tp6 = tp2 * tp4;

    const sp = Math.sin(phi1);
    const sp2 = sp * sp;
    const cp = Math.cos(phi1);

    const eta = Math.sqrt((a * a - b * b) / (b * b) * (cp * cp));
    const etap2 = eta * eta;
    const etap4 = etap2 * etap2;
    const etap6 = etap2 * etap4;
    const etap8 = etap4 * etap4;
    const dn = a / Math.sqrt(1. - e * e * (sp * sp));
    const d__2 = 1. - e * e * sp2;
    const dm = a * (1 - e * e) / Math.sqrt(d__2 * (d__2 * d__2));
    const xbydn = x / dn;

    const φ = phi1 + t * (-(x * x) / (dm * 2 * dn)
      + xbydn * (xbydn * xbydn) * x / (dm * 24)
      * (tp2 * 3 + 5 + etap2 - etap4 * 4. - etap2 * 9 * tp2)
      - xbydn * (xbydn * xbydn * xbydn * xbydn) * x / (dm * 720)
      * (tp2 * 90 + 61 + etap2 * 46 + tp4 * 45 - tp2 * 252 * etap2 - etap4 * 3 + etap6 * 100
        - tp2 * 66 * etap4 - tp4 * 90 * etap2 + etap8 * 88 + tp4 * 225 * etap4 + tp2 * 84. * etap6
        - tp2 * 192. * etap8)
      + xbydn * xbydn * xbydn * (xbydn * xbydn * xbydn * xbydn) * x / (dm * 40320)
      * (tp2 * 3633 + 1385 + tp4 * 4095 + tp6 * 1574));

    const λ = this.λo + (xbydn - xbydn * (xbydn * xbydn) / 6 * (tp2 * 2 + 1. + etap2)
      + xbydn * (xbydn * xbydn * xbydn * xbydn) / 120
      * (etap2 * 6 + 5 + tp2 * 28 - etap4 * 3 + tp2 * 8 * etap2 + tp4 * 24 - etap6 * 4
        + tp2 * 4 * etap4 + tp2 * 24 * etap6)
      - xbydn * xbydn * xbydn * (xbydn * xbydn * xbydn * xbydn) / 5040
      * (tp2 * 662 + 61 + tp4 * 1320 + tp6 * 720))
      / cp;

    return [
      λ,
      φ
    ];
  }

  public project(lon: number, lat: number): number[] {
    const deltaLambda = -Angle.toRadians(-lon) - this.λo;
    const phi = Angle.toRadians(lat);

    const sing = 2e-9;
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    const t = Math.tan(phi);
    const a = this.a;
    const b = this.b;
    const e = Math.sqrt((a * a - b * b) / (a * a));
    const eta = Math.sqrt((a * a - b * b) / (b * b) * (cp * cp));

    const e2 = (a * a - b * b) / (a * a);
    const e4 = e2 * e2;
    const e6 = e4 * e2;
    const e8 = e6 * e2;
    const a0 = 1 - e2 / 4 - e4 * 3 / 64 - e6 * 5 / 256 - e8 * 175 / 16384;
    const a2 = (e2 + e4 / 4. + e6 * 15. / 128. - e8 * 455. / 4096.) * .375;
    const a4 = (e4 + e6 * 3. / 4. - e8 * 77. / 128.) * .05859375;
    const a6 = (e6 - e8 * 41. / 32.) * .011393229166666666;
    const a8 = e8 * -315. / 131072.;
    const sphi = a * (a0 * phi - a2 * Math.sin(phi * 2) + a4 * Math.sin(phi * 4) - a6 *
      Math.sin(phi * 6) + a8 * Math.sin(phi * 8));

    const dn = a / Math.sqrt(1. - e * e * (sp * sp));
    let x = 0;
    let y = sphi;
    if (Math.abs(deltaLambda) >= sing) {
      const deltaLambdaSq = deltaLambda * deltaLambda;
      const cpSq = cp * cp;
      const tSq = t * t;
      const etaSq = eta * eta;
      x = dn * (deltaLambda * cp + deltaLambda * (deltaLambda * deltaLambda) * (cp * (cp * cp)) /
        6. * (1. - t * t + eta * eta) + deltaLambda * (deltaLambdaSq * deltaLambdaSq) * (
          cp * (cpSq * cpSq)) / 120. * (5. - t * t * 18. + tSq
            * tSq + eta * eta * 14. - t * t * 58. * (eta *
              eta) + etaSq * etaSq * 13. + etaSq * (etaSq * etaSq) * 4. -
            etaSq * etaSq * 64. * (t * t) - etaSq * (etaSq * etaSq) *
            24. * (t * t)) + deltaLambda * deltaLambda * deltaLambda * (deltaLambda * deltaLambda * deltaLambda * deltaLambda) / 5040. * (cpSq * cp
              * (cpSq * cpSq)) * (61. - t * t * 479. + tSq * tSq *
                179. - tSq * (tSq * tSq)));

      y = sphi + dn * (deltaLambda * deltaLambda / 2. * sp * cp
        + deltaLambdaSq * deltaLambdaSq / 24. * sp * (cp * (cp * cp))
        * (5. - t * t + eta * eta * 9. + etaSq * etaSq * 4.)
        + deltaLambdaSq * (deltaLambdaSq * deltaLambdaSq) / 720. * sp * (cp * (cpSq * cpSq))
        * (61. - t * t * 58. + tSq * tSq + eta * eta * 270. - t * t * 330. * (eta * eta)
          + etaSq * etaSq * 445. + etaSq * (etaSq * etaSq) * 324. - etaSq * etaSq * 680. * (t * t)
          + eta * etaSq * (eta * etaSq) * 88. - etaSq * (etaSq * etaSq) * 600. * (t * t)
          - etaSq * etaSq * (etaSq * etaSq) * 192. * (t * t))
        + deltaLambdaSq * deltaLambdaSq * (deltaLambdaSq * deltaLambdaSq) / 40320. * sp
        * ((cp * cpSq) * (cpSq * cpSq))
        * (1385. - t * t * 3111. + tSq * tSq * 543. - tSq * (tSq * tSq)));
    }

    x = this.xo + this.ko * x;
    y = this.ko * y;
    return [x, y];
  }

  public inverse(x: number, y: number): number[] {
    const point = this.inverseRadians(x, y);
    point[0] = Angle.toDegrees(point[0]);
    point[1] = Angle.toDegrees(point[1]);
    return point;
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
