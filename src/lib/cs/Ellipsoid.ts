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

  angle(x1: number, y1: number, x2: number, y2: number, precision: number = 10000000): number {
    const a = this.a;
    const f = this.f;
    const b = this.b;

    const lat1 = Angle.toRadians(y1); // Φ1
    const lat2 = Angle.toRadians(y2); // Φ2

    const U1 = Math.atan((1 - f) * Math.tan(lat1));
    const U2 = Math.atan((1 - f) * Math.tan(lat2));

    const lon1 = Angle.toRadians(x1);
    const lon2 = Angle.toRadians(x2);
    const L = lon2 - lon1;

    const cosU1 = Math.cos(U1);
    const sinU1 = Math.sin(U1);
    const cosU2 = Math.cos(U2);
    const sinU2 = Math.sin(U2);

    let lon = L;
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
      lon = L + (1 - C) * f * sinAlpha * (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    const forwardAzimuth = Math.atan2(cosU2 * sinlon, cosU1 * sinU2 - sinU1 * cosU2 * coslon);
    return Numbers.makePrecise(precision, Angle.toDegrees(forwardAzimuth));
  }

  // https://en.wikipedia.org/wiki/Vincenty%27s_formulae
  distanceAndAngle(x1: number, y1: number, x2: number, y2: number, precision: number = 10000000): number[] {
    const a = this.a;
    const f = this.f;
    const b = this.b;

    const lat1 = Angle.toRadians(y1); // Φ1
    const lat2 = Angle.toRadians(y2); // Φ2

    const U1 = Math.atan((1 - f) * Math.tan(lat1));
    const U2 = Math.atan((1 - f) * Math.tan(lat2));

    const lon1 = Angle.toRadians(x1);
    const lon2 = Angle.toRadians(x2);
    const L = lon2 - lon1;

    const cosU1 = Math.cos(U1);
    const sinU1 = Math.sin(U1);
    const cosU2 = Math.cos(U2);
    const sinU2 = Math.sin(U2);

    let lon = L;
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
        return [0, 0, 0];
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
      lon = L + (1 - C) * f * sinAlpha * (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    const uSq = cosSqAlpha * (a * a - b * b) / (b * b);
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
    const deltaSigmaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

    const distance = b * A * (Sigma - deltaSigmaSigma);

    const forwardAzimuth = Math.atan2(cosU2 * sinlon, cosU1 * sinU2 - sinU1 * cosU2 * coslon);
    const reverseAzimuth = Math.atan2(cosU1 * sinlon, -sinU1 * cosU2 + cosU1 * sinU2 * coslon);
    const angle1 = Numbers.makePrecise(precision, Angle.toDegrees(forwardAzimuth));
    const angle2 = Numbers.makePrecise(precision, Angle.toDegrees(reverseAzimuth));
    return [
      distance,
      Numbers.makePrecise(precision, angle1),
      Numbers.makePrecise(precision, angle2)
    ];
  }

  distance(x1: number, y1: number, x2: number, y2: number, precision: number = 10000000): number {
    const f = this.f;
    const a = this.a;
    const b = this.b;

    const lon1 = Angle.toRadians(x1);
    const lat1 = Angle.toRadians(y1);

    const lon2 = Angle.toRadians(x2);
    const lat2 = Angle.toRadians(y2);

    const deltaLon = lon2 - lon1;
    const tanU1 = (1 - f) * Math.tan(lat1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
    const tanU2 = (1 - f) * Math.tan(lat2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;

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
