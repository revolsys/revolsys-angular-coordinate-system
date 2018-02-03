import {Component} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private static EARTH_RADIUS = 6378137;

  form: FormGroup;

  result: number[];

  static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
  }

  static distanceAndAzimuth(lon1: number, lat1: number, lon2: number, lat2: number): number[] {
    const inverseF = 298.257222101;
    const f = 1 / inverseF;
    const a = 6378137;
    const b = a - a * f;

    lon1 = AppComponent.toRadians(lon1);
    lon2 = AppComponent.toRadians(lon2);

    lat1 = AppComponent.toRadians(lat1);
    lat2 = AppComponent.toRadians(lat2);

    const deltaLon = lon2 - lon1;
    const tanU1 = (1 - f) * Math.tan(lat1), cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1)), sinU1 = tanU1 * cosU1;
    const tanU2 = (1 - f) * Math.tan(lat2), cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2)), sinU2 = tanU2 * cosU2;

    let lon = deltaLon;
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
      lon = deltaLon + (1 - C) * f * sinAlpha * (Sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
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
    return [
      distance,
      AppComponent.toDegrees(forwardAzimuth),
      AppComponent.toDegrees(reverseAzimuth)
    ];
  }

  public static toDecimalDegrees(text: string): number {
    if (text) {
      text = text.trim();
      if (text.length > 0) {
        const parts = text.split(/[°'":\s]+/);
        let decimalDegrees = 0;
        if (parts.length > 0) {
          decimalDegrees = parseFloat(parts[0]);
        }
        if (parts.length > 1) {
          decimalDegrees += parseFloat(parts[1]) / 60;
        }
        if (parts.length > 2) {
          decimalDegrees += parseFloat(parts[2]) / 3600;
        }
        return decimalDegrees;
      }
    }
    return null;
  }

  public static toDegreesMinutesSeconds(decimalDegrees: number): string {
    if (decimalDegrees !== null) {
      const degrees = Math.floor(decimalDegrees);
      let text = degrees + '°';
      const decimal = decimalDegrees - degrees;
      const minutes = Math.floor(decimal * 60);
      if (minutes < 10) {
        text += '0';
      }
      text += minutes + '\'';
      const seconds = (decimal * 3600) % 60;
      if (seconds < 10) {
        text += '0';
      }
      text += seconds + '\'';
      return text;
    }
    return null;
  }

  constructor(private fb: FormBuilder) {
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      longitude1: '-121',
      latitude1: '51',
      longitude2: '-120',
      latitude2: '50'
    });
    this.form.valueChanges.subscribe(data => {
      const lon1 = AppComponent.toDecimalDegrees(data.longitude1);
      const lat1 = AppComponent.toDecimalDegrees(data.latitude1);
      const lon2 = AppComponent.toDecimalDegrees(data.longitude2);
      const lat2 = AppComponent.toDecimalDegrees(data.latitude2);
      if (lon1 && lat1 && lon2 && lat2) {
        this.result = AppComponent.distanceAndAzimuth(lon1, lat1, lon2, lat2);
      } else {
        this.result = null;
      }
    });
    this.form.patchValue({
      longitude1: '-121',
      latitude1: '51',
      longitude2: '-120',
      latitude2: '50'
    });
  }


}
