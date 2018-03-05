import {Angle} from './Angle';
import {ProjCS} from './ProjCS';
import {GeoCS} from './GeoCS';

export class TransverseMercator extends ProjCS {
  private a: number;

  private ePow4: number;

  private ePow6: number;

  private ePrimeSq: number;

  private eSq: number;

  private sqrt1MinusESq: number;

  private k0: number;

  private lambda0: number;

  private m0: number;

  private x0: number;

  private y0: number;

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
    private latitude_of_origin: number,
    private central_meridan: number,
    private scale_factor: number,
    private false_easting: number,
    private false_northing: number,
  ) {
    super(id, name, geoCs);
    const latitudeOfNaturalOrigin = latitude_of_origin;
    const centralMeridian = central_meridan;
    const scaleFactor = scale_factor;
    this.x0 = false_easting;
    this.y0 = false_northing;

    const ellipsoid = this.geoCS.ellipsoid;
    this.lambda0 = Angle.toRadians(centralMeridian);
    this.a = ellipsoid.semiMajorAxis;
    this.k0 = scaleFactor;
    const phi0 = Angle.toRadians(latitudeOfNaturalOrigin);
    this.eSq = ellipsoid.eccentricitySquared;
    this.sqrt1MinusESq = Math.sqrt(1 - this.eSq);

    this.ePow4 = this.eSq * this.eSq;
    this.ePow6 = this.ePow4 * this.eSq;
    this.m0 = this.m(phi0);
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

  public inverse(x: number, y: number): number[] {
    const eSq = this.eSq;
    const a = this.a;
    const k0 = this.k0;
    const ePrimeSq = this.ePrimeSq;

    const m = this.m0 + (y - this.y0) / k0;
    const mu = m / this.aTimes1MinusEsqDiv4MinesEPow4Times3Div64MinusEPow6Times5Div256;
    const phi1 = mu + this.e1Time2Div2MinusE1Pow3Times27Div32 * Math.sin(2 * mu)
      + this.e1Pow2Times21Div16MinusE1Pow4Times55Div32 * Math.sin(4 * mu)
      + this.e1Pow3Times151Div96 * Math.sin(6 * mu) + this.e1Pow4Times1097Div512 * Math.sin(8 * mu);
    const cosPhi1 = Math.cos(phi1);
    const sinPhi = Math.sin(phi1);
    const tanPhi1 = Math.tan(phi1);

    const oneMinusESqSinPhi1Sq = 1 - eSq * sinPhi * sinPhi;
    const nu1 = a / Math.sqrt(oneMinusESqSinPhi1Sq);
    const rho1 = a * (1 - eSq) / (oneMinusESqSinPhi1Sq * Math.sqrt(oneMinusESqSinPhi1Sq));
    const c1 = ePrimeSq * cosPhi1 * cosPhi1;
    const d = (x - this.x0) / (nu1 * k0);
    const d2 = d * d;
    const d3 = d2 * d;
    const d4 = d2 * d2;
    const d5 = d4 * d;
    const d6 = d4 * d2;
    const t1 = tanPhi1 * tanPhi1;

    const c1Sq = c1 * c1;
    const t1Sq = t1 * t1;
    const phi = phi1 - nu1 * tanPhi1 / rho1
      * (d2 / 2 - (5 + 3 * t1 + 10 * c1 - 4 * c1Sq - this.ePrimeSqTimes9) * d4 / 24
        + (61 + 90 * t1 + 298 * c1 + 45 * t1Sq - 252 * ePrimeSq - 3 * c1Sq) * d6 / 720);

    const lambda = this.lambda0 + (d - (1 + 2 * t1 + c1) * d3 / 6
      + (5 - 2 * c1 + 28 * t1 - 3 * c1Sq + this.ePrimeSqTimes8 + 24 * t1Sq) * d5 / 120) / cosPhi1;

    return [
      Angle.toDegrees(lambda),
      Angle.toDegrees(phi)
    ];
  }

  private m(phi: number): number {
    return this.a * ((1 - this.eSq / 4 - 3 * this.ePow4 / 64 - 5 * this.ePow6 / 256) * phi
      - (3 * this.eSq / 8 + 3 * this.ePow4 / 32 + 45 * this.ePow6 / 1024) * Math.sin(2 * phi)
      + (15 * this.ePow4 / 256 + 45 * this.ePow6 / 1024) * Math.sin(4 * phi)
      - 35 * this.ePow6 / 3072 * Math.sin(6 * phi));
  }

  public project(lon: number, lat: number): number[] {
    const lambda = Angle.toRadians(lon);
    const phi = Angle.toRadians(lat);

    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);
    const tanPhi = Math.tan(phi);

    const nu = this.a / Math.sqrt(1 - this.eSq * sinPhi * sinPhi);
    const t = tanPhi * tanPhi;
    const tSq = t * t;
    const c = this.ePrimeSq * cosPhi * cosPhi;
    const cSq = c * c;
    const a1 = (lambda - this.lambda0) * cosPhi;
    const a1Pow2 = a1 * a1;
    const a1Pow3 = a1Pow2 * a1;
    const a1Pow4 = a1Pow2 * a1Pow2;
    const a1Pow5 = a1Pow4 * a1;
    const a1Pow6 = a1Pow4 * a1Pow2;
    const x = this.x0 + this.k0 * nu * (a1 + (1 - t + c) * a1Pow3 / 6
      + (5 - 18 * t + tSq + 72 * c - 58 * this.ePrimeSq) * a1Pow5 / 120);

    const m = this.m(phi);
    const y = this.y0
      + this.k0 * (m - this.m0 + nu * tanPhi * (a1Pow2 / 2 + (5 - t + 9 * c + 4 * cSq) * a1Pow4 / 24
        + (61 - 58 * t + tSq + 600 * c - 330 * this.ePrimeSq) * a1Pow6 / 720));
    return [x, y];
  }

}
