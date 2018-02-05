import {Component} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from './angle';
import {Ellipsoid} from './ellipsoid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private static EARTH_RADIUS = 6378137;

  form: FormGroup;

  result: number[];

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
      const lon1 = Angle.toDecimalDegrees(data.longitude1);
      const lat1 = Angle.toDecimalDegrees(data.latitude1);
      const lon2 = Angle.toDecimalDegrees(data.longitude2);
      const lat2 = Angle.toDecimalDegrees(data.latitude2);
      if (lon1 && lat1 && lon2 && lat2) {
        this.result = Ellipsoid.NAD83.distanceAndAzimuth(lon1, lat1, lon2, lat2);
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
