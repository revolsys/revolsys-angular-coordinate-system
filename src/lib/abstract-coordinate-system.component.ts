import {CS} from "./cs/CS";
import {Input} from '@angular/core';
import {GeoCS} from './cs/GeoCS';
import {Numbers} from './cs/Numbers';
import {CSI} from './cs/CSI';

export class AbstractCoordinateSystemComponent {
  @Input('cs')
  cs: CS = CSI.NAD83;

  @Input()
  public angleFormat: string

  constructor(angleFormat?: string
  ) {
    this.angleFormat = angleFormat;
  }

  formatAngle(value: number, decimalPlaces: number = -1): string {
    if (value) {
      if ('DMS' === this.angleFormat) {
        if (decimalPlaces < 0) {
          decimalPlaces = 5;
        }
        return Numbers.degreesToDms(value, decimalPlaces);
      } else if (decimalPlaces < 0) {
        return value.toFixed(2);
      } else {
        return value.toString();
      }
    } else {
      return '-';
    }
  }

  formatX(value: number): string {
    if (value) {
      if (this.cs instanceof GeoCS) {
        if ('DMS' === this.angleFormat) {
          return Numbers.degreesToDmsLon(value, 5);
        } else {
          return value.toString();
        }
      } else {
        return value.toFixed(3);
      }
    } else {
      return '-';
    }
  }

  formatY(value: number): string {
    if (value) {
      if (this.cs instanceof GeoCS) {
        if ('DMS' === this.angleFormat) {
          return Numbers.degreesToDmsLat(value, 5);
        } else {
          return value.toString();
        }
      } else {
        return value.toFixed(3);
      }
    } else {
      return '-';
    }
  }
}