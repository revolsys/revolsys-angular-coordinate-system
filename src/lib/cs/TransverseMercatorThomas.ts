import {Angle} from './Angle';
import {ProjCS} from './ProjCS';
import {GeoCS} from './GeoCS';
import {TransverseMercator} from './TransverseMercator';

export class TransverseMercatorThomas extends TransverseMercator {
  private a0: number;

  private a2: number;

  private a4: number;

  private a6: number;

  private a8: number;

  private mo: number;

  private e: number;

  constructor(
    id: number,
    name: string,
    geoCs: GeoCS,
    latitudeOfOrigin: number,
    centralMeridan: number,
    ko: number,
    xo: number,
    yo: number,
  ) {
    super(id, name, geoCs, latitudeOfOrigin, centralMeridan, ko, xo, yo);
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

    let φ1 = y / a;
    let deltaφ;
    do {
      deltaφ = (a * (this.a0 * φ1 - this.a2 * Math.sin(φ1 * 2) + this.a4 * Math.sin(φ1 * 4)
        - this.a6 * Math.sin(φ1 * 6) + this.a8 * Math.sin(φ1 * 8)) - y)
        / (a * (this.a0 - this.a2 * 2 * Math.cos(φ1 * 2) + this.a4 * 4. * Math.cos(φ1 * 4)
          - this.a6 * 6 * Math.cos(φ1 * 6) + this.a8 * 8 * Math.cos(φ1 * 8)));
      φ1 -= deltaφ;

    } while (Math.abs(deltaφ) >= 1e-15);

    const tanφ = Math.tan(φ1);
    const tanφPow2 = tanφ * tanφ;
    const tanφPow4 = tanφPow2 * tanφPow2;
    const tanφPow6 = tanφPow2 * tanφPow4;

    const sinφ = Math.sin(φ1);
    const sinφPow2 = sinφ * sinφ;
    const cosφ = Math.cos(φ1);

    const eta = Math.sqrt((a * a - b * b) / (b * b) * (cosφ * cosφ));
    const etaPow2 = eta * eta;
    const etaPow4 = etaPow2 * etaPow2;
    const etaPow6 = etaPow2 * etaPow4;
    const etaPow8 = etaPow4 * etaPow4;
    const ePow2 = e * e;
    const dn = a / Math.sqrt(1. - ePow2 * (sinφ * sinφ));
    const d__2 = 1 - ePow2 * sinφPow2;
    const dm = a * (1 - ePow2) / Math.sqrt(d__2 * (d__2 * d__2));
    const xOverDn = x / dn;
    const xOverDnPow2 = xOverDn * xOverDn;
    const xOverDnPow4 = xOverDnPow2 * xOverDnPow2;
    const xOverDnPow6 = xOverDnPow2 * xOverDnPow4;
    const λ = this.λo + (xOverDn - xOverDn * xOverDnPow2 / 6 * (tanφPow2 * 2 + 1 + etaPow2)
      + xOverDn * xOverDnPow4 / 120
      * (etaPow2 * 6 + 5 + tanφPow2 * 28 - etaPow4 * 3 + tanφPow2 * 8 * etaPow2 + tanφPow4 * 24
        - etaPow6 * 4 + tanφPow2 * 4 * etaPow4 + tanφPow2 * 24 * etaPow6)
      - xOverDn * xOverDnPow6 / 5040 * (tanφPow2 * 662 + 61 + tanφPow4 * 1320 + tanφPow6 * 720))
      / cosφ;

    const φ = φ1 + tanφ * (-(x * x) / (dm * 2 * dn)
      + xOverDn * xOverDnPow2 * x / (dm * 24)
      * (tanφPow2 * 3 + 5 + etaPow2 - etaPow4 * 4. - etaPow2 * 9 * tanφPow2)
      - xOverDn * xOverDnPow4 * x / (dm * 720)
      * (tanφPow2 * 90 + 61 + etaPow2 * 46 + tanφPow4 * 45 - tanφPow2 * 252 * etaPow2
        - etaPow4 * 3 + etaPow6 * 100 - tanφPow2 * 66 * etaPow4 - tanφPow4 * 90 * etaPow2
        + etaPow8 * 88 + tanφPow4 * 225 * etaPow4 + tanφPow2 * 84 * etaPow6
        - tanφPow2 * 192 * etaPow8)
      + xOverDn * xOverDnPow6 * x / (dm * 40320)
      * (tanφPow2 * 3633 + 1385 + tanφPow4 * 4095 + tanφPow6 * 1574));

    return [
      λ,
      φ
    ];
  }

  public projectRadians(λ: number, φ: number): number[] {
    const deltaλ = λ - this.λo;
    const sinφ = Math.sin(φ);
    const sinφPow2 = sinφ * sinφ;
    const cosφ = Math.cos(φ);
    const cosφPow2 = cosφ * cosφ;
    const cosφPow4 = cosφPow2 * cosφPow2;
    const cosφPow6 = cosφPow2 * cosφPow4;
    const tanφ = Math.tan(φ);
    const tanφPow2 = tanφ * tanφ;
    const tanφPow4 = tanφPow2 * tanφPow2;
    const tanφPow6 = tanφPow2 * tanφPow4;
    const a = this.a;
    const b = this.b;
    const e = this.e;

    const eta = Math.sqrt((a * a - b * b) / (b * b) * cosφPow2);
    const sφ = a * (this.a0 * φ - this.a2 * Math.sin(φ * 2) + this.a4 * Math.sin(φ * 4)
      - this.a6 * Math.sin(φ * 6) + this.a8 * Math.sin(φ * 8));

    const dn = a / Math.sqrt(1. - e * e * sinφPow2);
    let x = 0;
    let y = sφ;
    if (Math.abs(deltaλ) >= 2e-9) {
      const deltaλPow2 = deltaλ * deltaλ;
      const deltaλPow4 = deltaλPow2 * deltaλPow2;
      const deltaλPow6 = deltaλPow2 * deltaλPow4;
      const etaPow2 = eta * eta;
      const etaPow4 = etaPow2 * etaPow2;
      const etaPow6 = etaPow2 * etaPow4;
      const etaPow8 = etaPow4 * etaPow4;
      x = dn
        * (deltaλ * cosφ + deltaλ * deltaλPow2 * (cosφ * cosφPow2) / 6 * (1 - tanφPow2 + etaPow2)
          + deltaλ * deltaλPow4 * (cosφ * cosφPow4) / 120
          * (5 - tanφPow2 * 18 + tanφPow4 + etaPow2 * 14 - tanφPow2 * 58 * etaPow2 + etaPow4 * 13
            + etaPow6 * 4 - etaPow4 * 64 * tanφPow2 - etaPow6 * 24 * tanφPow2)
          + deltaλ * deltaλPow6 / 5040. * (cosφ * cosφPow6)
          * (61 - tanφPow2 * 479 + tanφPow4 * 179 - tanφPow6));

      y = sφ + dn * (deltaλPow2 / 2 * sinφ * cosφ
        + deltaλPow4 / 24 * sinφ * (cosφ * cosφPow2) * (5 - tanφPow2 + etaPow2 * 9 + etaPow4 * 4)
        + deltaλPow6 / 720. * sinφ * (cosφ * cosφPow4)
        * (61 - tanφPow2 * 58 + tanφPow4 + etaPow2 * 270 - tanφPow2 * 330 * etaPow2
          + etaPow4 * 445 + etaPow6 * 324 - etaPow4 * 680 * tanφPow2 + etaPow6 * 88
          - etaPow6 * 600 * tanφPow2 - etaPow8 * 192 * tanφPow2)
        + deltaλPow4 * deltaλPow4 / 40320 * sinφ * (cosφ * cosφPow6)
        * (1385 - tanφPow2 * 3111 + tanφPow4 * 543 - tanφPow6));
    }
    x = this.xo + this.ko * x;
    y = this.ko * y;
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
    const x0 = this.xo;
    const sinφ = this.sinφ(x1, y1, x2, y2);

    const xi = x1 - x0;
    const xj = x2 - x0;
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
    const x0 = this.xo;
    const sf = this.ko;

    const sinφ = this.sinφ(x1, y1, x2, y2);

    const xi = x1 - x0;
    const xj = x2 - x0;
    const bOverA = b / a;
    const esq = 1 - bOverA * bOverA;
    const r = b / (1 - esq * (sinφ * sinφ));
    const rsq = r * r;
    const rsq6 = rsq * 6;
    const xusq = xi * xi + xi * xj + xj * xj;
    return sf * (xusq / rsq6 * (xusq / (rsq * 36) + 1) + 1);
  }
}
