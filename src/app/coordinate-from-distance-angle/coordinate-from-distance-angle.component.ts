import {Component} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';

@Component({
  selector: 'app-coordinate-from-distance-angle',
  templateUrl: './coordinate-from-distance-angle.component.html',
  styleUrls: ['./coordinate-from-distance-angle.component.css']
})
export class CoordinateFromDistanceAngleComponent {
  form: FormGroup;

  hasResult = false;

  longitude2: number;

  latitude2: number;

  azimuth2: number;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      longitude1: null,
      latitude1: null,
      azimuth: null,
      distance: null
    });
    this.form.valueChanges.subscribe(data => {
      const lon1 = Angle.toDecimalDegrees(data.longitude1);
      const lat1 = Angle.toDecimalDegrees(data.latitude1);
      const distance = data.distance;
      const azimuth = Angle.toDecimalDegrees(data.azimuth);
      if (lon1 && lat1 && distance && azimuth) {
        this.hasResult = true;
        const result = Ellipsoid.NAD83.pointOffsetAndAngle(lon1, lat1, distance, azimuth);
        this.longitude2 = result[0];
        this.latitude2 = result[1];
        this.azimuth2 = result[2];
      } else {
        this.hasResult = false;
      }
    });
    this.form.patchValue({
      longitude1: '-121',
      latitude1: '51',
      azimuth: '147.08294439752578',
      distance: '131935.9627804203'
    });
  }
}
