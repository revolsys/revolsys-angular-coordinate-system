import {Ellipsoid} from './Ellipsoid';
import {GeoCS} from './GeoCS';
import {ProjCS} from './ProjCS';
import {AlbersConicEqualArea} from './AlbersConicEqualArea';
import {TransverseMercator} from './TransverseMercator';

export class CS {
  static NAD83 = new GeoCS(new Ellipsoid(6378137, 298.257222101), 0, 0.01745329251994328);

  static WGS84 = new GeoCS(new Ellipsoid(6378137, 298.257223563), 0, 0.01745329251994328);

  static BC_ALBERS = new AlbersConicEqualArea(CS.NAD83, 50, 58.5, 45, -126, 1000000, 0);

  static utmN(zone: number): TransverseMercator {
    return new TransverseMercator(CS.NAD83, 0, -183 + zone * 6, 0.9996, 500000, 0);
  }
}
