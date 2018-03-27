import {Angle} from './cs/Angle';
import {CS} from './cs/CS';
import {
  Input,
  Injector
} from '@angular/core';
import {GeoCS} from './cs/GeoCS';
import {Numbers} from './cs/Numbers';
import {CSI} from './cs/CSI';
import {BaseComponent} from 'revolsys-angular-framework';

export class AbstractCoordinateSystemComponent extends BaseComponent<any> {
  get cs(): CS {
    return CSI.NAD83;
  }

  @Input()
  public angleFormat: string;

  constructor(
    protected injector: Injector,
    title: string,
    angleFormat?: string
  ) {
    super(injector, null, title);
    this.angleFormat = angleFormat;
  }

  formatAngle(value: number, decimalPlaces: number = -1): string {
    if (value) {
      if ('DMS' === this.angleFormat) {
        if (decimalPlaces < 0) {
          decimalPlaces = 2;
        }
        return Angle.toDegreesMinutesSeconds(value, decimalPlaces);
      } else if (decimalPlaces < 0) {
        return value.toFixed(2);
      } else {
        return value.toString();
      }
    } else {
      return '-';
    }
  }

  formatX(value: any): string {
    if (typeof value === 'number') {
      if (value) {
        if (this.cs instanceof GeoCS) {
          if ('DMS' === this.angleFormat) {
            return Angle.toDegreesMinutesSecondsLon(value, 5);
          } else {
            return value.toString();
          }
        } else {
          return value.toFixed(3);
        }
      } else {
        return '-';
      }
    } else {
      return value.toString();
    }
  }

  formatY(value: any): string {
    if (typeof value === 'number') {
      if (value) {
        if (this.cs instanceof GeoCS) {
          if ('DMS' === this.angleFormat) {
            return Angle.toDegreesMinutesSecondsLat(value, 5);
          } else {
            return value.toString();
          }
        } else {
          return value.toFixed(3);
        }
      } else {
        return '-';
      }
    } else {
      return value.toString();
    }
  }
}
