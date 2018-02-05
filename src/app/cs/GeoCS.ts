import {Ellipsoid} from './Ellipsoid';

export class GeoCS {
  constructor(
    private _e: Ellipsoid,
    private _pm: number,
    private _cf: number
  ) {
  }

  get conversionFactor(): number {
    return this._cf;
  }

  get ellipsoid(): Ellipsoid {
    return this._e;
  }

  get primeMeridian(): number {
    return this._pm;
  }
}
