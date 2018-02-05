import {Angle} from './Angle';
import {CS} from './CS';
import {GeoCS} from './GeoCS';

export class ProjCS extends CS {
  constructor(
    name: string,
    public geoCS: GeoCS
  ) {
    super(name);
  }

  distanceAndAngle(x1: number, y1: number, x2: number, y2: number): number[] {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return [
      distance,
      Angle.angleDegrees(x1, y1, x2, y2),
      Angle.angleDegrees(x2, y2, x1, y1)
    ];
  }

}
