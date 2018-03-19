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

  vincentyInverse(lambda1: number, phi1: number, lambda2: number, phi2: number): number[] {
    const sing = 1e-12;
    if (Math.abs(phi1 - phi2) <= sing && Math.abs(lambda1 - lambda2) <= sing) {
      return [0, 0, 0];
    }

    const tpi = Math.PI * 2.;
    if (lambda1 > 0 && lambda1 < Math.PI) {
      lambda1 = tpi - lambda1;
    }
    if (lambda2 > 0 && lambda2 < Math.PI) {
      lambda2 = tpi - lambda2;
    }

    const a = this.a;
    //    const b = this.b;
    const b = 6356752.314;
    const f = (a - b) / a;

    const b2 = b * b;
    const omf = 1 - f;

    const pot = Math.PI / 2;
    let u1 = pot;
    if (phi1 < 0) {
      u1 = -u1;
    }
    if (Math.abs(Math.abs(phi1) - pot) > sing) {
      u1 = Math.atan(omf * Math.tan(phi1));
    }
    const su1 = Math.sin(u1);
    const cu1 = Math.cos(u1);
    let u2 = pot;
    if (phi2 < 0.) {
      u2 = -u2;
    }
    if (Math.abs(Math.abs(phi2) - pot) > sing) {
      u2 = Math.atan(omf * Math.tan(phi2));
    }
    const su2 = Math.sin(u2);
    const cu2 = Math.cos(u2);
    const cu1su2 = cu1 * su2;
    const su1cu2 = su1 * cu2;
    const su1su2 = su1 * su2;
    const cu1cu2 = cu1 * cu2;

    let iter = 0;
    const dlon = lambda2 - lambda1;
    if ((Math.abs(dlon - Math.PI)) < sing && Math.abs(phi1) < sing && Math.abs(phi2) < sing) {
      return null;
    }
    let sig;
    let sdlas;
    let cdlas;
    let ssig;
    let csig;
    let ctsm;
    let ctsm2;
    let calph2;

    let dlas = dlon;
    do {
      sdlas = Math.sin(dlas);
      cdlas = Math.cos(dlas);
      const d__1 = cu2 * sdlas;
      const d__2 = cu1su2 - su1cu2 * cdlas;
      ssig = Math.sqrt(d__1 * d__1 + d__2 * d__2);
      csig = su1su2 + cu1cu2 * cdlas;
      const tsig = ssig / csig;
      sig = Math.acos(csig);
      const salpha = cu1cu2 * sdlas / ssig;
      calph2 = 1. - salpha * salpha;
      ctsm = 0.;
      if (Math.abs(calph2) > sing) {
        ctsm = csig - su1su2 * 2. / calph2;
      }
      ctsm2 = ctsm * ctsm;
      const c = f / 16. * calph2 * (f * (4. - calph2 * 3.) + 4.);
      const dlasup = dlon + (1. - c) * f * salpha * (sig + c * ssig * (ctsm + c *
        csig * (ctsm2 * 2. - 1.)));
      if ((Math.abs(dlasup - dlas)) < sing) {
        break;
      }
      dlas = dlasup;
      ++iter;
      if (iter > 50) {
        return null;
      }
    } while (true);


    const usq = calph2 * (a * a - b2) / b2;
    const a3 = usq / 16384. * (usq * (usq * (320. - usq * 175.) - 768.) + 4096.) + 1.;
    const b4 = usq / 1024. * (usq * (usq * (74. - usq * 47.) - 128.) + 256.);
    const delsig = b4 * ssig * (ctsm + b4 / 4. * (csig * (ctsm2 * 2. - 1.) - b4 /
      6. * ctsm * (ssig * ssig * 4. - 3.) * (ctsm2 * 4. - 3.)));
    const s12 = b * a3 * (sig - delsig);

    let a12 = Math.atan2(cu2 * sdlas, cu1su2 - su1cu2 * cdlas);
    let a21 = Math.atan2(-cu1 * sdlas, su1cu2 - cu1su2 * cdlas);
    if (a12 > tpi) {
      a12 -= tpi;
    }
    if (a12 < 0.) {
      a12 += tpi;
    }
    if (a21 > tpi) {
      a21 -= tpi;
    }
    if (a21 < 0.) {
      a21 += tpi;
    }
    return [s12, a12, a21];
  }

  vincenty(lambda1: number, phi1: number, s12: number, a12: number): number[] {
    const pi = Math.PI;
    const sing = 1e-12;
    const a = this.a;
    const b = this.b;
    const f = (a - b) / a;

    let west = false;
    if (lambda1 > 0 && lambda1 < pi) {
      lambda1 = pi * 2 - lambda1;
      west = true;
    }

    const b2 = b * b;
    const omf = 1 - f;

    const smax = a * pi;
    if (s12 > smax) {
      return [NaN, NaN];
    }

    const tpi = pi * 2;
    const pot = pi / 2;
    let redlat = pot;
    if (phi1 < 0.) {
      redlat = -redlat;
    }
    if ((Math.abs(Math.abs(phi1) - pot)) > sing) {
      redlat = Math.atan(omf * Math.tan(phi1));
    }
    const su = Math.sin(redlat);
    const cu = Math.cos(redlat);

    const ca12 = Math.cos(a12);
    const sa12 = Math.sin(a12);

    let sig1 = 0;
    if (Math.abs(ca12) > sing) {
      sig1 = Math.atan2(su / cu, ca12);
    }

    const sa = cu * sa12;
    const sa2 = sa * sa;
    const alpha = Math.asin(sa);
    const ca = Math.cos(alpha);
    const ca2 = 1. - sa2;

    const usq = ca2 * (a * a - b2) / b2;

    const a3 = usq / 16384. * (usq * (usq * (320. - usq * 175.) - 768.) + 4096.) +
      1.;
    const b4 = usq / 1024. * (usq * (usq * (74. - usq * 47.) - 128.) + 256.);


    let iter = 0;
    const tsig1 = sig1 * 2.;
    const soba = s12 / b / a3;
    let sig = soba;
    let ddsig = 0.;
    let csig = 0;
    let ssig = 0;
    let ctsm;
    let ctsm2 = 0;
    do {
      const tsigm = tsig1 + sig;
      ctsm = Math.cos(tsigm);
      ctsm2 = ctsm * ctsm;
      ssig = Math.sin(sig);
      const ssig2 = ssig * ssig;
      csig = Math.cos(sig);
      const delsig = b4 * ssig * (ctsm + b4 / 4. * (csig * (ctsm2 * 2. - 1.) - b4 /
        6. * ctsm * (ssig2 * 4. - 3.) * (ctsm2 * 4. - 3.)));
      sig = soba + delsig;
      ctsm2 = ddsig - delsig;
      if (Math.abs(ctsm2) < sing) {
        break;
      }
      ddsig = delsig;
      ++iter;
      if (iter > 50) {
        return [NaN, NaN];
      }
    } while (true);

    const sucs = su * csig;
    const cuss = cu * ssig;
    const suss = su * ssig;
    const cucs = cu * csig;

    let phi2 = 0;
    let dnum = sucs + cuss * ca12;
    const d__1 = suss - cucs * ca12;
    let den = omf * Math.sqrt(sa2 + d__1 * d__1);
    if (Math.abs(dnum) > sing || Math.abs(den) > sing) {
      phi2 = Math.atan2(dnum, den);
    }

    let dlas = 0;
    dnum = ssig * sa12;
    den = cucs - suss * ca12;
    if (Math.abs(dnum) > sing || Math.abs(den) > sing) {
      dlas = Math.atan2(dnum, den);
    }


    const c = f / 16. * ca2 * (f * (4. - ca2 * 3.) + 4.);
    const dlam = dlas - (1. - c) * f * sa * (sig + c * ssig * (ctsm + c * csig * (
      ctsm2 * 2. - 1.)));
    let lambda2 = lambda1 + dlam;
    if (lambda2 < 0.) {
      lambda2 += tpi;
    }
    if (lambda2 > tpi) {
      lambda2 -= tpi;
    }
    if (west) {
      lambda2 = tpi - lambda2;
    }
    let a21;
    if (Math.abs(a12) < sing) {
      a21 = pi;
    }
    if (Math.abs(a12 - pi) < sing) {
      a21 = 0.;
    }
    den = suss - cucs * ca12;
    if (Math.abs(sa) > sing || Math.abs(den) > sing) {
      a21 = Math.atan2(-sa, den);
    }
    if (a21 > tpi) {
      a21 -= tpi;
    }
    if (a21 < 0.) {
      a21 += tpi;
    }
    return [lambda2, phi2, a21];
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
    return Angle.toDegrees360(spaz);
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
    return Angle.toDegrees360(radians);
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
    const c1 = 0; // (-(xsi) * Math.sin(a12) + eta * Math.cos(a12)) * 0 / sqrt(ssq - 0 * 0);

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

  public horizontalEllipsoidFactor(lon1: number, lat1: number, h1: number,
    lon2: number, lat2: number, h2: number, spatialDistance: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    return this.horizontalEllipsoidFactorRadians(lambda1, phi1, h1,
      lambda2, phi2, h2, spatialDistance);
  }

  public horizontalEllipsoidFactorRadians(lambda1: number, phi1: number, h1: number,
    lambda2: number, phi2: number, h2: number, spatialDistance: number): number {
    const distanceAndAngles = this.vincentyInverse(lambda1, phi1, lambda2, phi2);
    const a12 = distanceAndAngles[1];
    const a21 = distanceAndAngles[2];
    const r1 = this.radius(phi1, a12);
    const r2 = this.radius(phi2, a21);
    const deltaH = Math.abs(h2 - h1);
    if (deltaH > 30) {
      return r1 / (r1 + h1);
    } else {
      return 1 / Math.sqrt((h1 / r1 + 1) * (h2 / r2 + 1));
    }
  }

  public spatialDistance(lon1: number, lat1: number, h1: number, heightOfInstrument: number, heightOfTarget: number,
    lon2: number, lat2: number, h2: number, spatialDistance: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    return this.spatialDistanceRadians(lambda1, phi1, h1, heightOfInstrument, heightOfTarget, lambda2,
      phi2, h2, spatialDistance);
  }

  public spatialDistanceRadians(lambda1: number, phi1, h1: number, heightOfInstrument: number, heightOfTarget: number,
    lambda2: number, phi2, h2: number, spatialDistance: number): number {

    const a12 = this.azimuthRadians(lambda1, phi1, lambda2, phi2);
    const a21 = this.azimuthRadians(lambda2, phi2, lambda1, phi1);
    const r1 = this.radius(phi1, a12);
    const r2 = this.radius(phi2, a21);

    h1 += heightOfInstrument;
    h2 += heightOfTarget;
    const deltaH = h2 - h1;
    const deltaHSq = deltaH * deltaH;
    if (spatialDistance * spatialDistance - deltaHSq >= 0) {
      const twor = r1 + r2;
      const lo = Math
        .sqrt((spatialDistance * spatialDistance - deltaHSq) / ((h1 / r1 + 1) * (h2 / r2 + 1)));
      return twor * Math.asin(lo / twor);
    } else {
      return spatialDistance;
    }
  }

  public ellipsoidDirection(lon1: number, lat1: number, h1: number, xsi: number, eta: number,
    lon2: number, lat2: number, h2: number, x0: number, y0: number, z0: number, spatialDirection: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    eta = Angle.toRadians(eta);
    xsi = Angle.toRadians(xsi);
    spatialDirection = Angle.toRadians(spatialDirection);
    const radians = this.ellipsoidDirectionRadians(lambda1, phi1, h1, xsi, eta, lambda2, phi2, h2,
      x0, y0, z0, spatialDirection);
    return Angle.toDegrees360(radians);
  }

  public ellipsoidDirectionRadians(lambda1: number, phi1: number, h1: number, xsi: number, eta: number,
    lambda2: number, phi2: number, h2: number, x0: number, y0: number, z0: number, spatialDirection: number) {
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    const esq = (a * a - b * b) / (a * a);

    const sinPhi1 = Math.sin(phi1);
    const sinPhi2 = Math.sin(phi2);
    const d__1 = Math.sqrt(1. - esq * (sinPhi1 * sinPhi1));
    const d__4 = Math.sqrt(1 - esq * (sinPhi2 * sinPhi2));
    const mm = (a * (1 - esq) / (d__1 * (d__1 * d__1))
      + a * (1 - esq) / (d__4 * (d__4 * d__4))) / 2.;
    const nm = (a / Math.sqrt(1 - esq * (sinPhi1 * sinPhi1))
      + a / Math.sqrt(1 - esq * (sinPhi2 * sinPhi2))) / 2.;

    const s12 = this.distanceMetresRadians(lambda1, phi1, lambda2, phi2);
    const a12 = this.azimuthRadians(lambda1, phi1, lambda2, phi2);

    const slopeDistance = this.slopeDistanceRadians(lambda1, phi1, h1, lambda2, phi2, h2, x0,
      y0, z0);

    const dh = h2 - h1;
    const c1 = (-xsi * Math.sin(a12) + eta * Math.cos(a12)) * dh / Math.sqrt(slopeDistance * slopeDistance - dh * dh);

    const cosPhi2 = Math.cos(phi2);
    const c2 = h2 * esq * Math.sin(a12) * Math.cos(a12) * cosPhi2 * cosPhi2 / mm;

    const phim = (phi1 + phi2) / 2;
    const cosPhim = Math.cos(phim);
    const c3 = -esq * s12 * s12 * cosPhim * cosPhim * Math.sin(a12 * 2) / (nm * nm * 12);
    return spatialDirection + c1 + c2 + c3;
  }

  public slopeDistance(lon1: number, lat1: number, h1: number, lon2: number, lat2: number, h2: number,
    x0: number, y0: number, z0: number): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);
    return this.slopeDistanceRadians(lambda1, phi1, h1, lambda2, phi2, h2, x0, y0, z0);
  }

  public slopeDistanceRadians(lambda1: number, phi1: number, h1: number, lambda2: number, phi2: number, h2: number,
    x0: number, y0: number, z0: number): number {
    const p1 = this.toCartesian(lambda1, phi1, h1, x0, y0, z0);
    const p2 = this.toCartesian(lambda2, phi2, h2, x0, y0, z0);

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

  private toCartesian(lambda: number, phi: number, h: number, x0: number, y0: number, z0: number): number[] {
    const a = this.semiMajorAxis;
    const b = this.semiMinorAxis;

    const e2 = (a * a - b * b) / (a * a);
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);

    const n = a / Math.sqrt(1 - e2 * (sp * sp));
    const x = x0 + (n + h) * cp * Math.cos(lambda);
    const y = y0 + (n + h) * cp * Math.sin(lambda);
    const z = z0 + (n * (1. - e2) + h) * sp;
    return [
      x, y, z
    ];
  }

  azimuth(lon1: number, lat1: number, lon2: number, lat2: number, precision: number = 10000000): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);

    const azimuth = this.azimuthRadians(lambda1, phi1, lambda2, phi2);
    return Numbers.makePrecise(precision, Angle.toDegrees360(azimuth));
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
      lon = deltaLambda + (1 - C) * f * sinAlpha *
        (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    return Math.atan2(cosU2 * sinlon, cosU1 * sinU2 - sinU1 * cosU2 * coslon);
  }

  azimuthBackwards(lon1: number, lat1: number, lon2: number, lat2: number, precision: number = 10000000): number {
    const lambda1 = Angle.toRadians(lon1);
    const phi1 = Angle.toRadians(lat1);
    const lambda2 = Angle.toRadians(lon2);
    const phi2 = Angle.toRadians(lat2);

    const azimuth = this.azimuthBackwardsRadians(lambda1, phi1, lambda2, phi2);
    return Numbers.makePrecise(precision, Angle.toDegrees360(azimuth));
  }

  azimuthBackwardsRadians(lambda1: number, phi1: number, lambda2: number, phi2: number): number {
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
      lon = deltaLambda + (1 - C) * f * sinAlpha *
        (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lon - lastLon) > 1e-12 && --iterationLimit > 0);
    if (iterationLimit === 0) {
      throw new Error('Formula failed to converge');
    }

    return Math.atan2(cosU1 * sinlon, -sinU1 * cosU2 + cosU1 * sinU2 * coslon);
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

    const a = this.a;
    const b = this.b;
    const f = (a - b) / a;
    const ecc = f * (2. - f);

    const sinPhi = Math.sin(phi);
    const denom = Math.sqrt(1. - ecc * (sinPhi * sinPhi));
    const pvrad = a / denom;
    const merrad = a * (1. - ecc) / (denom * (denom * denom));
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

  pointOffset(lon: number, lat: number, distance: number, angle: number): number[] {
    let lambda1 = Angle.toRadians(-lon);
    const phi1 = Angle.toRadians(lat);
    const angle12 = Angle.toRadians(angle);

    const a = this.a;
    const b = this.b;
    const f = (a - b) / a;

    const sinangle = Math.sin(angle12);
    const cosangle = Math.cos(angle12);

    let west = false;
    if (lambda1 > 0 && lambda1 < Math.PI) {
      lambda1 = Math.PI * 2 - lambda1;
      west = true;
    }

    const b2 = b * b;

    const smax = a * Math.PI;
    if (distance > smax) {
      return [NaN, NaN];
    }

    const pot = Math.PI / 2;
    let redlat = pot;
    if (phi1 < 0.) {
      redlat = -redlat;
    }
    const sing = 1e-12;
    if ((Math.abs(Math.abs(phi1) - pot)) > sing) {
      redlat = Math.atan((1 - f) * Math.tan(phi1));
    }
    const su = Math.sin(redlat);
    const cu = Math.cos(redlat);

    let sigma1 = 0;
    if (Math.abs(cosangle) > sing) {
      sigma1 = Math.atan2(su / cu, cosangle);
    }

    const sa = cu * sinangle;
    const sa2 = sa * sa;
    const alpha = Math.asin(sa);
    const ca = Math.cos(alpha);
    const ca2 = 1. - sa2;

    const uSq = ca2 * (a * a - b2) / b2;
    const A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
    const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));

    let iter = 0;
    const tsigma1 = sigma1 * 2.;
    const soba = distance / b / A;
    let sigma = soba;
    let lastSigma;
    let cos2Sigma;
    let cos2SigmaSq;
    let sinSigma;
    let cosSigma;

    do {
      cos2Sigma = Math.cos(2 * sigma1 + sigma);
      cos2SigmaSq = cos2Sigma * cos2Sigma;
      sinSigma = Math.sin(sigma);
      const sinSigmaSq = sinSigma * sinSigma;
      cosSigma = Math.cos(sigma);
      const deltaSigma = B * sinSigma * (cos2Sigma + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaSq) -
        B / 6 * cos2Sigma * (-3 + 4 * sinSigmaSq) * (-3 + 4 * cos2SigmaSq)));
      sigma = soba + deltaSigma;
      if (Math.abs(lastSigma - deltaSigma) < sing) {
        break;
      }
      lastSigma = deltaSigma;
      ++iter;
      if (iter > 50) {
        return [NaN, NaN];
      }
    } while (true);

    const sucs = su * cosSigma;
    const cuss = cu * sinSigma;
    const suss = su * sinSigma;
    const cucs = cu * cosSigma;

    let phi2 = 0;
    let dnum = sucs + cuss * cosangle;
    const d__1 = suss - cucs * cosangle;
    let den = (1 - f) * Math.sqrt(sa2 + d__1 * d__1);
    if (Math.abs(dnum) > sing || Math.abs(den) > sing) {
      phi2 = Math.atan2(dnum, den);
    }

    let dlas = 0;
    dnum = sinSigma * sinangle;
    den = cucs - suss * cosangle;
    if (Math.abs(dnum) > sing || Math.abs(den) > sing) {
      dlas = Math.atan2(dnum, den);
    }


    const c = f / 16. * ca2 * (f * (4. - ca2 * 3.) + 4.);
    const dlam = dlas - (1. - c) * f * sa * (sigma + c * sinSigma * (cos2Sigma + c * cosSigma * (
      cos2SigmaSq * 2. - 1.)));
    let lambda2 = lambda1 + dlam;
    if (lambda2 < 0) {
      lambda2 += Math.PI;
    }
    if (lambda2 > Math.PI) {
      lambda2 -= Math.PI;
    }
    if (west) {
      lambda2 = Math.PI - lambda2;
    }
    let a21;
    if (Math.abs(angle12) < sing) {
      a21 = Math.PI;
    }
    if (Math.abs(angle12 - Math.PI) < sing) {
      a21 = 0;
    }
    den = suss - cucs * cosangle;
    if (Math.abs(sa) > sing || Math.abs(den) > sing) {
      a21 = Math.atan2(-sa, den);
    }
    if (a21 > Math.PI) {
      a21 -= Math.PI;
    }
    if (a21 < 0.) {
      a21 += Math.PI;
    }
    return [
      Angle.toDegrees(-lambda2),
      Angle.toDegrees(phi2)
    ];
  }
}
