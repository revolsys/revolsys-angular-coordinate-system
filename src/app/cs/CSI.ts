import {Angle} from './Angle';
import {Ellipsoid} from './Ellipsoid';
import {GeoCS} from './GeoCS';
import {ProjCS} from './ProjCS';
import {AlbersConicEqualArea} from './AlbersConicEqualArea';
import {TransverseMercator} from './TransverseMercator';

export class CSI {
  static NAD83 = new GeoCS('NAD83', Ellipsoid.NAD83, 0, Angle.RAD_DEGREE);

  static WGS84 = new GeoCS('WGS84', Ellipsoid.WGS84, 0, Angle.RAD_DEGREE);

  static BC_ALBERS = new AlbersConicEqualArea('NAD83 / BC Albers', CSI.NAD83, 50, 58.5, 45, -126, 1000000, 0);

  static utmN(zone: number): TransverseMercator {
    return new TransverseMercator(`NAD83 / UTM zone ${zone}N`, CSI.NAD83, 0, -183 + zone * 6, 0.9996, 500000, 0);
  }
}
