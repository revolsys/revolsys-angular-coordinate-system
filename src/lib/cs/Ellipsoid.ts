import {Angle} from './Angle';
import {Numbers} from './Numbers';

export class Ellipsoid {

  static NAD83 = new Ellipsoid(6378137, 298.257222101);

  static WGS84 = new Ellipsoid(6378137, 298.257223563);

  readonly f: number; // flattening

  readonly b: number; // semiMinorAxis

  readonly eSq: number;

  readonly e: number;

  constructor(
    public readonly semiMajorAxis: number, // semiMajorAxis
    public readonly inverseFlattening: number
  ) {
    this.f = 1 / inverseFlattening;
    this.b = this.a - this.a * this.f;
    this.eSq = this.f + this.f - this.f * this.f;
    this.e = Math.sqrt(this.eSq);
  }

  get eccentricitySquared(): number {
    return this.eSq;
  }

  get eccentricity(): number {
    return this.e;
  }

  get a(): number {
    return this.semiMajorAxis;
  }

  get semiMinorAxis(): number {
    return this.b;
  }

  public astronomicAzimuth(lon1: number, lat1: number, h1: number, xsi: number,
    eta: number, lon2: number, lat2: number, h2: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    eta = Angle.toRadians(eta);
    xsi = Angle.toRadians(xsi);
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;


    const phim = (phi1 + phi2) / 2;
    const esq = (a * a - b * b) / (a * a);

    const sinPhi1 = Math.sin(phi1);
    const d__1 = Math.sqrt(1. - esq * (sinPhi1 * sinPhi1));
    const sinPhi2 = Math.sin(phi2);
    const d__4 = Math.sqrt(1. - esq * (sinPhi2 * sinPhi2));
    const mm = (a * (1. - esq) / (d__1 * (d__1 * d__1))
      + a * (1. - esq) / (d__4 * (d__4 * d__4))) / 2.;
    const nm = (a / Math.sqrt(1 - esq * (sinPhi1 * sinPhi1))
      + a / Math.sqrt(1 - esq * (sinPhi2 * sinPhi2))) / 2;

    const distance = this.distanceMetres(lon1, lat1, lon2, lat2);
    const azimuth = this.azimuthRadians(lambda1, phi1, lambda2, phi2);

    // c1 is always 0 as dh is 0

    const cosPhi2 = Math.cos(phi2);
    const c2 = h2 / mm * esq * Math.sin(azimuth) * Math.cos(azimuth) * (cosPhi2 * cosPhi2);

    const cosPhim = Math.cos(phim);
    const c3 = -esq * (distance * distance) * (cosPhim * cosPhim) * Math.sin(azimuth * 2)
      / (nm * nm * 12);

    let spaz = azimuth + eta * Math.tan(phi1) - c2 - c3;

    if (spaz < 0) {
      spaz = Angle.PI_TIMES_2 + spaz;
    }
    return Angle.toDegrees(spaz);
  }


  public geodeticAzimuth(lon1: number, lat1: number, h1: number, xsi: number,
    eta: number, lon2: number, lat2: number, h2: number, x0: number,
    y0: number, z0: number, spaz: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    spaz = Angle.toRadians(spaz);
    xsi = Angle.toRadians(xsi);
    eta = Angle.toRadians(eta);
    const radians = this.geodeticAzimuthRadians(lambda1, phi1, h1, xsi, eta, lambda2, phi2, h2,
      x0, y0, z0, spaz);
    return Angle.toDegrees(radians);
  }

  public geodeticAzimuthRadians(lambda1: number, phi1: number, h1: number,
    xsi: number, eta: number, lambda2: number, phi2: number, h2: number,
    x0: number, y0: number, z0: number, astronomicAzimuth: number): number {
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    const phim = (phi1 + phi2) / 2.;
    const esq = (a * a - b * b) / (a * a);
    const sinPhi1 = Math.sin(phi1);
    const mm1 = Math.sqrt(1. - esq * (sinPhi1 * sinPhi1));
    const sinPhi2 = Math.sin(phi2);
    const mm2 = Math.sqrt(1. - esq * (sinPhi2 * sinPhi2));
    const mm = (a * (1 - esq) / (mm1 * (mm1 * mm1)) + a * (1 - esq) / (mm2 * (mm2 * mm2)))
      / 2;
    const nm = (a / mm1 + a / mm2) / 2;

    const a12 = this.azimuthRadians(lambda1, phi1, lambda2, phi2);

    const s12 = this.distanceMetresRadians(lambda1, phi1, lambda2, phi2);

    // Always 0 as dh = 0
    const c1 = 0;// (-(xsi) * Math.sin(a12) + eta * Math.cos(a12)) * 0 / sqrt(ssq - 0 * 0);

    const cosPhi2 = Math.cos(phi2);
    const c2 = h2 / mm * esq * Math.sin(a12) * Math.cos(a12) * (cosPhi2 * cosPhi2);

    const cosPhim = Math.cos(phim);
    const c3 = -esq * (s12 * s12) * (cosPhim * cosPhim) * Math.sin(a12 * 2) / (nm * nm * 12);

    let geodeticAzimuth = astronomicAzimuth - eta * Math.tan(phi1) + c1 + c2 + c3;
    if (geodeticAzimuth < 0) {
      geodeticAzimuth = Angle.PI_TIMES_2 + geodeticAzimuth;
    }
    return geodeticAzimuth;
  }

  public slopeDistance(lon1: number, lat1: number, h1: number, lon2: number, lat2: number, h2: number, x0: number, y0: number, z0: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);

    const p1 = this.toCaresian(phi1, lambda1, h1, x0, y0, z0);
    const p2 = this.toCaresian(phi2, lambda2, h2, x0, y0, z0);

    const deltaX = p1[0] - p2[0];
    const deltaY = p1[1] - p2[1];
    const deltaZ = p1[2] - p2[2];
    const ssq = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
    const slopeDistance = Math.sqrt(ssq);

    return this.slopeDistanceRadians(lambda1, phi1, h1, lambda2, phi2, h2, x0, y0, z0);
  }

  public slopeDistanceRadians(lambda1: number, phi1: number, h1: number, lambda2: number, phi2: number, h2: number, x0: number, y0: number, z0: number): number {
    const p1 = this.toCaresian(phi1, lambda1, h1, x0, y0, z0);
    const p2 = this.toCaresian(phi2, lambda2, h2, x0, y0, z0);

    const deltaX = p1[0] - p2[0];
    const deltaY = p1[1] - p2[1];
    const deltaZ = p1[2] - p2[2];
    const ssq = deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ;
    const slopeDistance = Math.sqrt(ssq);

    return slopeDistance;
  }

  public spatialDirection(lon1: number, lat1: number, h1: number, xsi: number, eta: number,
    lon2: number, lat2: number, h2: number, x0: number, y0: number, z0: number, direction: number): number {
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    eta = Angle.toRadians(eta);
    xsi = Angle.toRadians(xsi);

    const phim = (phi1 + phi2) / 2;
    const esq = (a * a - b * b) / (a * a);

    const sinPhi1 = Math.sin(phi1);
    const sinPhi2 = Math.sin(phi2);
    const d__1 = Math.sqrt(1. - esq * (sinPhi1 * sinPhi1));
    const d__4 = Math.sqrt(1 - esq * (sinPhi2 * sinPhi2));
    const mm = (a * (1 - esq) / (d__1 * (d__1 * d__1))
      + a * (1 - esq) / (d__4 * (d__4 * d__4))) / 2.;
    const nm = (a / Math.sqrt(1 - esq * (sinPhi1 * sinPhi1))
      + a / Math.sqrt(1 - esq * (sinPhi2 * sinPhi2))) / 2.;

    const s12 = this.distanceMetres(lon1, lat1, lon2, lat2);
    const a12 = this.azimuthRadians(lambda1, phi1, lambda2, phi2);

    const ssq = this.slopeDistanceRadians(lambda1, phi1, h1, lambda2, phi2, h2, x0, y0, z0);

    const dh = 0;
    const c1 = (-xsi * Math.sin(a12) + eta * Math.cos(a12)) * dh / Math.sqrt(ssq - dh * dh);

    const cosPhi2 = Math.cos(phi2);
    const c2 = h2 / mm * esq * Math.sin(a12) * Math.cos(a12) * (cosPhi2 * cosPhi2);

    const cosPhim = Math.cos(phim);
    const c3 = -esq * (s12 * s12) * (cosPhim * cosPhim) * Math.sin(a12 * 2.)
      / (nm * nm * 12.);

    return direction - c1 - c2 - c3;
  }

  private toCaresian(phi: number, rlam: number, h: number, x0: number, y0: number, z0: number): number[] {
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    const e2 = (a * a - b * b) / (a * a);
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);

    const n = a / Math.sqrt(1 - e2 * (sp * sp));
    const x = x0 + (n + h) * cp * Math.cos(rlam);
    const y = y0 + (n + h) * cp * Math.sin(rlam);
    const z = z0 + (n * (1. - e2) + h) * sp;
    return [
      x, y, z
    ];
  }

  azimuthRadians(lambda1: number, phi1: number, lambda2: number, phi2: number): number {
    const a = this.a;
    const f = this.f;
    const b = this.b;


    const U1 = Math.atan((1 - f) * Math.tan(phi1));
    const U2 = Math.atan((1 - f) * Math.tan(phi2));

    const deltaLambda = lambda2 - lambda1;

    const cosU1 = Math.cos(U1);
    const sinU1 = Math.sin(U1);
    const cosU2 = Math.cos(U2);
    const sinU2 = Math.sin(U2);

    let lon = deltaLambda;
    let lastLon;
    let iterationLimit = 100;
    let cosSqAlpha;
    let sinSigma;
    let cos2SigmaM;
    let Sigma;
    let cosSigma;
    let sinlon;
    let coslon;

    do {
      sinlon = Math.sin(lon);
      coslon = Math.cos(lon);
      const sinSqSigma = (cosU2 * sinlon) * (cosU2 * sinlon) +
        (cosU1 * sinU2 - sinU1 * cosU2 * coslon) * (cosU1 * sinU2 - sinU1 * cosU2 * coslon);
      sinSigma = Math.sqrt(sinSqSigma);
      if (sinSigma === 0) { // co-incident points
        return 0;
      }
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * coslon;
      Sigma = Math.atan2(sinSigma, cosSigma);
      const sinAlpha = cosU1 * cosU2 * sinlon / sinSigma;
      cosSqAlpha = 1 - sinAlpha * sinAlpha;
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
      if (isNaN(cos2SigmaM)) {// equatorial line: cosSqAlpha=0 (§6)
        cos2SigmaM = 0;
      }
      const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      lastLon = lon;
      lon = deltaLambda + (1 - C) * f * sinAlpha * (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    return Math.atan2(cosU2 * sinlon, cosU1 * sinU2 - sinU1 * cosU2 * coslon);
  }

  azimuth(lon1: number, lat1: number, lon2: number, lat2: number, precision: number = 10000000): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);

    const azimuth = this.azimuthRadians(lambda1, phi1, lambda2, phi2);
    return Numbers.makePrecise(precision, Angle.toDegrees(azimuth));
  }

  distanceMetres(lon1: number, lat1: number, lon2: number, lat2: number, precision: number = 10000000): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    return this.distanceMetresRadians(lambda1, phi1, lambda2, phi2);
  }

  distanceMetresRadians(lambda1: number, phi1: number, lambda2: number, phi2: number, precision: number = 10000000): number {
    const f = this.f;
    const a = this.a;
    const b = this.b;

    const deltaLon = lambda2 - lambda1;
    const tanU1 = (1 - f) * Math.tan(phi1);
    const cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1));
    const sinU1 = tanU1 * cosU1;
    const tanU2 = (1 - f) * Math.tan(phi2);
    const cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2));
    const sinU2 = tanU2 * cosU2;

    let lon = deltaLon;
    let lastLon;
    let iterationLimit = 100;
    let cosSqAlpha;
    let sinSigma;
    let cos2SigmaM;
    let sigma;
    let cosSigma;
    let sinlon;
    let coslon;

    do {
      sinlon = Math.sin(lon);
      coslon = Math.cos(lon);
      const sinSqSigma = (cosU2 * sinlon) * (cosU2 * sinlon) +
        (cosU1 * sinU2 - sinU1 * cosU2 * coslon) * (cosU1 * sinU2 - sinU1 * cosU2 * coslon);
      sinSigma = Math.sqrt(sinSqSigma);
      if (sinSigma === 0) { // co-incident points
        return 0;
      }
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * coslon;
      sigma = Math.atan2(sinSigma, cosSigma);
      const sinAlpha = cosU1 * cosU2 * sinlon / sinSigma;
      cosSqAlpha = 1 - sinAlpha * sinAlpha;
      cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cosSqAlpha;
      if (isNaN(cos2SigmaM)) {// equatorial line: cosSqAlpha=0 (§6)
        cos2SigmaM = 0;
      }
      const C = f / 16 * cosSqAlpha * (4 + f * (4 - 3 * cosSqAlpha));
      lastLon = lon;
      lon = deltaLon + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigmaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

    const distance = b * A * (sigma - deltaSigmaSigma);

    return distance;
  }


  public radius(lat, alpha): number {
    const phi = Angle.toRadians(lat);
    const ecc = this.eccentricitySquared;
    const sinPhi = Math.sin(phi);
    const denom = Math.sqrt(1. - ecc * (sinPhi * sinPhi));
    const pvrad = this.semiMajorAxis / denom;
    const merrad = this.semiMajorAxis * (1. - ecc) / (denom * (denom * denom));
    const cosAlpha = Math.cos(alpha);
    const sinAlpha = Math.sin(alpha);
    return pvrad * merrad / (pvrad * (cosAlpha * cosAlpha) + merrad * (sinAlpha * sinAlpha));
  }

  public distanceMetresZ(lon1: number, lat1: number, h1: number,
    lon2: number, lat2: number, h2: number): number {
    const distance = this.distanceMetres(lon1, lat1, lon2, lat2);
    const angleForwards = this.azimuth(lon1, lat1, lon2, lat2);
    const angleBackwards = this.azimuth(lon1, lat1, lon2, lat2);

    const r1 = this.radius(lat1, angleForwards);
    const r2 = this.radius(lat2, angleBackwards);
    const deltaH = h2 - h1;
    const delhsq = deltaH * deltaH;
    const twor = r1 + r2;
    const lo = twor * Math.sin(distance / twor);
    const losq = lo * lo;
    return Math.sqrt(losq * (h1 / r1 + 1.) * (h2 / r2 + 1.) + delhsq);
  }

  pointOffset(lon: number, lat: number, distance: number, angle: number, precision: number = 10000000): number[] {
    const f = this.f;
    const a = this.a;
    const b = this.b;

    lon = Angle.toRadians(lon);
    lat = Angle.toRadians(lat);
    angle = Angle.toRadians(angle);

    const sinangle = Math.sin(angle);
    const cosangle = Math.cos(angle);

    const U1 = Math.atan((1 - f) * Math.tan(lat));
    const cosU1 = Math.cos(U1);
    const sinU1 = Math.sin(U1);
    const sigma1 = Math.atan2(Math.tan(U1), cosangle);
    const sinalpha = cosU1 * sinangle;
    const cosSqalpha = 1 - sinalpha * sinalpha;
    const uSq = cosSqalpha * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    let sigma = distance / (b * A);
    let lastSigma;
    let cos2SigmaM;
    let sinSigma;
    let cosSigma;

    do {
      cos2SigmaM = Math.cos(2 * sigma1 + sigma);
      sinSigma = Math.sin(sigma);
      cosSigma = Math.cos(sigma);
      const deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
        B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
      lastSigma = sigma;
      sigma = distance / (b * A) + deltaSigma;
    } while (Math.abs(sigma - lastSigma) > 1e-12);

    const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosangle;
    const lat2 = Math.atan2(sinU1 * cosSigma + cosU1 * sinSigma * cosangle, (1 - f) * Math.sqrt(sinalpha * sinalpha + tmp * tmp));
    const lambda = Math.atan2(sinSigma * sinangle, cosU1 * cosSigma - sinU1 * sinSigma * cosangle);
    const C = f / 16 * cosSqalpha * (4 + f * (4 - 3 * cosSqalpha));
    const L = lambda - (1 - C) * f * sinalpha *
      (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    const lon2 = (lon + L + 3 * Math.PI) % (2 * Math.PI) - Math.PI;  // normalise to -180...+180
    return [
      Numbers.makePrecise(precision, Angle.toDegrees180(lon2)),
      Numbers.makePrecise(precision, Angle.toDegrees180(lat2))
    ];
  }
}
