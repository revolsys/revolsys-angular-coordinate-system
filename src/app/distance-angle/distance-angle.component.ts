import {Component} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';

@Component({
  selector: 'app-distance-angle',
  templateUrl: './distance-angle.component.html',
  styleUrls: ['./distance-angle.component.css']
})
export class DistanceAngleComponent {
  form: FormGroup;

  hasResult = false;

  azimuth1: number;

  azimuth2: number;

  distance: number;

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
        this.hasResult = true;
        const result = Ellipsoid.NAD83.distanceAndAzimuth(lon1, lat1, lon2, lat2);
        this.distance = result[0];
        this.azimuth1 = result[1];
        this.azimuth2 = result[2];
      } else {
        this.hasResult = false;
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
