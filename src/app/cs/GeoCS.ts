import {Angle} from './Angle';
import {CS} from './CS';
import {Ellipsoid} from './Ellipsoid';

export class GeoCS extends CS {
  private _df: number;
  constructor(
    name: string,
    private _e: Ellipsoid,
    private _pm: number,
    private _rf: number
  ) {
    super(name);
    if (_rf = Angle.RAD_DEGREE) {
      this._df = 1;
    } else {
      this._df = Angle.toDegrees(this._rf);
    }
  }

  get conversionFactor(): number {
    return this._rf;
  }

  get ellipsoid(): Ellipsoid {
    return this._e;
  }

  get primeMeridian(): number {
    return this._pm;
  }

  distanceAndAngle(x1: number, y1: number, x2: number, y2: number): number[] {
    return this._e.distanceAndAngle(x1, y1, x2, y2);
  }

  toDegrees(value: number): number {
    if (this._df === 1) {
      return value;
    } else {
      return value * this._df;
    }
  }

  toRadians(value: number): number {
    if (this._rf === 1) {
      return value;
    } else {
      return value * this._rf;
    }
  }

}
