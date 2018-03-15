import {Angle} from './Angle';
import {GeoCS} from './GeoCS';
import {ProjCS} from './ProjCS';

export class AlbersConicEqualArea extends ProjCS {

  c: number;

  e: number;

  ee: number;

  lambda0: number;

  n: number;

  phi0: number;

  phi1: number;

  phi2: number;

  rho0: number;
  semiMajorAxis: number;

  x0: number;

  y0: number;

  constructor(
    id: number,
    name: string,
    geoCs: GeoCS,
    standard_parallel_1: number,
    standard_parallel_2: number,
    latitude_of_center: number,
    longitude_of_center: number,
    false_easting: number,
    false_northing: number
  ) {
    super(id, name, geoCs);
    const firstStandardParallel = standard_parallel_1;
    const secondStandardParallel = standard_parallel_2;
    const centralMeridian = longitude_of_center;
    const latitudeOfProjection = latitude_of_center;
    const ellipsoid = geoCs.ellipsoid;
    this.x0 = false_easting;
    this.y0 = false_northing;
    this.lambda0 = Angle.toRadians(centralMeridian);
    this.phi0 = Angle.toRadians(latitudeOfProjection);
    this.phi1 = Angle.toRadians(firstStandardParallel);
    this.phi2 = Angle.toRadians(secondStandardParallel);
    this.semiMajorAxis = ellipsoid.semiMajorAxis;
    this.e = ellipsoid.eccentricity;
    this.ee = ellipsoid.eccentricitySquared;
    const m1 = this.m(this.phi1);
    const m2 = this.m(this.phi2);
    const q0 = this.q(this.phi0);
    const q1 = this.q(this.phi1);
    const q2 = this.q(this.phi2);
    this.n = (m1 * m1 - m2 * m2) / (q2 - q1);
    this.c = m1 * m1 + this.n * q1;
    this.rho0 = this.semiMajorAxis * Math.sqrt(this.c - this.n * q0) / this.n;
  }
  public inverse(x: number, y: number): number[] {
    const dX = x - this.x0;
    const dY = y - this.y0;
    const theta = Math.atan(dX / (this.rho0 - dY));
    const rho = Math.sqrt(dX * dX + Math.pow(this.rho0 - dY, 2.0));
    const q = (this.c
      - rho * rho * this.n * this.n / (this.semiMajorAxis * this.semiMajorAxis)) / this.n;
    const lambda = this.lambda0 + theta / this.n;
    let li = Math.asin(q / 2.0);
    if (!isNaN(li)) {
      let delta = 10e010;
      const maxIter = 1000;
      let i = 0;
      do {
        const sinLi = Math.sin(li);
        const j1 = Math.pow(1.0 - this.ee * Math.pow(sinLi, 2.0), 2.0)
          / (2.0 * Math.cos(li));
        const k1 = q / (1.0 - this.ee);
        const k2 = sinLi / (1.0 - this.ee * Math.pow(sinLi, 2.0));
        const k3 = 1.0 / (2.0 * this.e)
          * Math.log((1.0 - this.e * sinLi) / (1.0 + this.e * sinLi));
        const lip1 = li + j1 * (k1 - k2 + k3);
        delta = Math.abs(lip1 - li);
        li = lip1;
        i++;
      } while (!isNaN(li) && delta > 1.0e-011 && i < maxIter);
    }
    let phi;
    if (isNaN(li)) {
      phi = Math.PI / 2;
    } else {
      phi = li;
    }
    return [
      Angle.toDegrees(lambda),
      Angle.toDegrees(phi)
    ];
  }
  private m(phi: number): number {
    const sinPhi = Math.sin(phi);
    const m = Math.cos(phi) / Math.sqrt(1.0 - this.ee * sinPhi * sinPhi);
    return m;
  }

  public project(lon: number, lat: number): number[] {
    const lambda = Angle.toRadians(lon);
    const phi = Angle.toRadians(lat);
    const q = this.q(phi);
    const lminusl0 = lambda - this.lambda0;
    const n = this.n;
    const theta = n * lminusl0;
    const sqrtCminsNQOverN = Math.sqrt(this.c - n * q) / n;
    const rho = this.semiMajorAxis * sqrtCminsNQOverN;
    const x = this.x0 + rho * Math.sin(theta);
    const y = this.y0 + this.rho0 - rho * Math.cos(theta);
    return [x, y];
  }
  private q(phi: number): number {
    const sinPhi = Math.sin(phi);
    const eSinPhi = this.e * sinPhi;
    const q = (1.0 - this.ee) * (sinPhi / (1.0 - this.ee * sinPhi * sinPhi)
      - 1.0 / (2.0 * this.e) * Math.log((1.0 - eSinPhi) / (1.0 + eSinPhi)));
    return q;
  }
}
