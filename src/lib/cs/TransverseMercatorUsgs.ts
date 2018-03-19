import {Angle} from './Angle';
import {ProjCS} from './ProjCS';
import {GeoCS} from './GeoCS';
import {TransverseMercator} from './TransverseMercator';

export class TransverseMercatorUsgs extends TransverseMercator {

  private ePow4: number;

  private ePow6: number;

  private ePrimeSq: number;

  private eSq: number;

  private sqrt1MinusESq: number;

  private mo: number;

  private e1Time2Div2MinusE1Pow3Times27Div32: number;

  private e1Pow2Times21Div16MinusE1Pow4Times55Div32: number;

  private e1Pow3Times151Div96: number;

  private e1Pow4Times1097Div512: number;

  private aTimes1MinusEsqDiv4MinesEPow4Times3Div64MinusEPow6Times5Div256: number;

  private ePrimeSqTimes9: number;

  private ePrimeSqTimes8: number;

  constructor(
    id: number,
    name: string,
    geoCs: GeoCS,
    latitudeOfOrigin: number,
    centralMeridan: number,
    scaleFactor: number,
    falseEasting: number,
    falseNorthing: number,
  ) {
    super(id, name, geoCs, latitudeOfOrigin, centralMeridan, scaleFactor, falseEasting, falseNorthing);
    const ellipsoid = this.geoCS.ellipsoid;
    this.eSq = ellipsoid.eccentricitySquared;
    this.sqrt1MinusESq = Math.sqrt(1 - this.eSq);

    this.ePow4 = this.eSq * this.eSq;
    this.ePow6 = this.ePow4 * this.eSq;
    this.mo = this.m(this.φo);
    this.ePrimeSq = this.eSq / (1 - this.eSq);
    this.ePrimeSqTimes9 = 9 * this.ePrimeSq;
    this.ePrimeSqTimes8 = 8 * this.ePrimeSq;

    const e1 = (1 - this.sqrt1MinusESq) / (1 + this.sqrt1MinusESq);
    const e1Pow2 = e1 * e1;
    const e1Pow3 = e1Pow2 * e1;
    const e1Pow4 = e1Pow2 * e1Pow2;
    this.e1Time2Div2MinusE1Pow3Times27Div32 = e1 * 3 / 2 - e1Pow3 * 27 / 32;
    this.e1Pow2Times21Div16MinusE1Pow4Times55Div32 = e1Pow2 * 21 / 16 - e1Pow4 * 55 / 32;
    this.e1Pow3Times151Div96 = 151 * e1Pow3 / 96;
    this.e1Pow4Times1097Div512 = 1097 * e1Pow4 / 512;
    this.aTimes1MinusEsqDiv4MinesEPow4Times3Div64MinusEPow6Times5Div256 = this.a
      * (1 - this.eSq / 4 - this.ePow4 * 3 / 64 - this.ePow6 * 5 / 256);
  }

  public inverseRadians(x: number, y: number): number[] {
    const eSq = this.eSq;
    const a = this.a;
    const ko = this.ko;
    const ePrimeSq = this.ePrimeSq;

    const m = this.mo + (y - this.yo) / ko;
    const mu = m / this.aTimes1MinusEsqDiv4MinesEPow4Times3Div64MinusEPow6Times5Div256;
    const φ1 = mu + this.e1Time2Div2MinusE1Pow3Times27Div32 * Math.sin(2 * mu)
      + this.e1Pow2Times21Div16MinusE1Pow4Times55Div32 * Math.sin(4 * mu)
      + this.e1Pow3Times151Div96 * Math.sin(6 * mu) + this.e1Pow4Times1097Div512 * Math.sin(8 * mu);
    const cosφ1 = Math.cos(φ1);
    const sinφ = Math.sin(φ1);
    const tanφ1 = Math.tan(φ1);

    const oneMinusESqSinφ1Sq = 1 - eSq * sinφ * sinφ;
    const nu1 = a / Math.sqrt(oneMinusESqSinφ1Sq);
    const rho1 = a * (1 - eSq) / (oneMinusESqSinφ1Sq * Math.sqrt(oneMinusESqSinφ1Sq));
    const c1 = ePrimeSq * cosφ1 * cosφ1;
    const d = (x - this.xo) / (nu1 * ko);
    const d2 = d * d;
    const d3 = d2 * d;
    const d4 = d2 * d2;
    const d5 = d4 * d;
    const d6 = d4 * d2;
    const t1 = tanφ1 * tanφ1;

    const c1Sq = c1 * c1;
    const t1Sq = t1 * t1;
    const φ = φ1 - nu1 * tanφ1 / rho1
      * (d2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1Sq - this.ePrimeSqTimes9) * d4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1Sq - 252 * ePrimeSq - 3 * c1Sq) * d6 / 720);

    const λ = this.λo + (d - (1 + 2 * t1 + c1) * d3 / 6
      + (5 - 2 * c1 + 28 * t1 - 3 * c1Sq + this.ePrimeSqTimes8 + 24 * t1Sq) * d5 / 120) / cosφ1;
    return [
      λ,
      φ
    ];
  }

  public project(lon: number, lat: number): number[] {
    const deltaλ = -Angle.toRadians(-lon) - this.λo;
    const φ = Angle.toRadians(lat);

    const sing = 2e-9;
    const sp = Math.sin(φ);
    const cp = Math.cos(φ);
    const t = Math.tan(φ);
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
    const sφ = a * (a0 * φ - a2 * Math.sin(φ * 2) + a4 * Math.sin(φ * 4) - a6 *
      Math.sin(φ * 6) + a8 * Math.sin(φ * 8));

    const dn = a / Math.sqrt(1. - e * e * (sp * sp));
    let x = 0;
    let y = sφ;
    if (Math.abs(deltaλ) >= sing) {
      const deltaλSq = deltaλ * deltaλ;
      const cpSq = cp * cp;
      const tSq = t * t;
      const etaSq = eta * eta;
      x = dn * (deltaλ * cp + deltaλ * (deltaλ * deltaλ) * (cp * (cp * cp)) /
        6. * (1. - t * t + eta * eta) + deltaλ * (deltaλSq * deltaλSq) * (
          cp * (cpSq * cpSq)) / 120. * (5. - t * t * 18. + tSq
            * tSq + eta * eta * 14. - t * t * 58. * (eta *
              eta) + etaSq * etaSq * 13. + etaSq * (etaSq * etaSq) * 4. -
            etaSq * etaSq * 64. * (t * t) - etaSq * (etaSq * etaSq) *
            24. * (t * t)) + deltaλ * deltaλ * deltaλ * (deltaλ * deltaλ * deltaλ * deltaλ) / 5040. * (cpSq * cp
              * (cpSq * cpSq)) * (61. - t * t * 479. + tSq * tSq *
                179. - tSq * (tSq * tSq)));

      y = sφ + dn * (deltaλ * deltaλ / 2. * sp * cp
        + deltaλSq * deltaλSq / 24. * sp * (cp * (cp * cp))
        * (5. - t * t + eta * eta * 9. + etaSq * etaSq * 4.)
        + deltaλSq * (deltaλSq * deltaλSq) / 720. * sp * (cp * (cpSq * cpSq))
        * (61. - t * t * 58. + tSq * tSq + eta * eta * 270. - t * t * 330. * (eta * eta)
          + etaSq * etaSq * 445. + etaSq * (etaSq * etaSq) * 324. - etaSq * etaSq * 680. * (t * t)
          + eta * etaSq * (eta * etaSq) * 88. - etaSq * (etaSq * etaSq) * 600. * (t * t)
          - etaSq * etaSq * (etaSq * etaSq) * 192. * (t * t))
        + deltaλSq * deltaλSq * (deltaλSq * deltaλSq) / 40320. * sp
        * ((cp * cpSq) * (cpSq * cpSq))
        * (1385. - t * t * 3111. + tSq * tSq * 543. - tSq * (tSq * tSq)));
    }

    x = this.xo + this.ko * x;
    y = this.yo * y;
    return [x, y];
  }

  public inverse(x: number, y: number): number[] {
    const point = this.inverseRadians(x, y);
    point[0] = Angle.toDegrees(point[0]);
    point[1] = Angle.toDegrees(point[1]);
    return point;
  }

  private m(φ: number): number {
    return this.a * ((1 - this.eSq / 4 - 3 * this.ePow4 / 64 - 5 * this.ePow6 / 256) * φ
      - (3 * this.eSq / 8 + 3 * this.ePow4 / 32 + 45 * this.ePow6 / 1024) * Math.sin(2 * φ)
      + (15 * this.ePow4 / 256 + 45 * this.ePow6 / 1024) * Math.sin(4 * φ)
      - 35 * this.ePow6 / 3072 * Math.sin(6 * φ));
  }

  public projectUsgs(lon: number, lat: number): number[] {
    const λ = Angle.toRadians(lon);
    const φ = Angle.toRadians(lat);

    const cosφ = Math.cos(φ);
    const sinφ = Math.sin(φ);
    const tanφ = Math.tan(φ);

    const nu = this.a / Math.sqrt(1 - this.eSq * sinφ * sinφ);
    const t = tanφ * tanφ;
    const tSq = t * t;
    const c = this.ePrimeSq * cosφ * cosφ;
    const cSq = c * c;
    const a1 = (λ - this.λo) * cosφ;
    const a1Pow2 = a1 * a1;
    const a1Pow3 = a1Pow2 * a1;
    const a1Pow4 = a1Pow2 * a1Pow2;
    const a1Pow5 = a1Pow4 * a1;
    const a1Pow6 = a1Pow4 * a1Pow2;
    const x = this.xo + this.ko * nu * (a1 + (1 - t + c) * a1Pow3 / 6
      + (5 - 18 * t + tSq + 72 * c - 58 * this.ePrimeSq) * a1Pow5 / 120);

    const m = this.m(φ);
    const y = this.yo
      + this.ko * (m - this.mo + nu * tanφ * (a1Pow2 / 2 + (5 - t + 9 * c + 4 * cSq) * a1Pow4 / 24
        + (61 - 58 * t + tSq + 600 * c - 330 * this.ePrimeSq) * a1Pow6 / 720));
    return [x, y];
  }

  public sinφ(x1: number, y1: number, x2: number, y2: number): number {
    const φ1 = this.inverseRadians(x1, y1)[1];
    const φ2 = this.inverseRadians(x2, y2)[1];
    const φ = (φ1 + φ2) / 2;
    return Math.sin(φ);
  }

  public ttCorrection(x1: number, y1: number, x2: number, y2: number): number {
    const a = this.a;
    const b = this.b;
    const xo = this.xo;
    const sinφ = this.sinφ(x1, y1, x2, y2);

    const xi = x1 - xo;
    const xj = x2 - xo;
    const bOverA = b / a;
    const esq = 1 - bOverA * bOverA;
    const r = b / (1 - esq * (sinφ * sinφ));
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
    const xo = this.xo;
    const sf = this.ko;

    const sinφ = this.sinφ(x1, y1, x2, y2);

    const xi = x1 - xo;
    const xj = x2 - xo;
    const bOverA = b / a;
    const esq = 1 - bOverA * bOverA;
    const r = b / (1 - esq * (sinφ * sinφ));
    const rsq = r * r;
    const rsq6 = rsq * 6;
    const xusq = xi * xi + xi * xj + xj * xj;
    return sf * (xusq / rsq6 * (xusq / (rsq * 36) + 1) + 1);
  }
}
