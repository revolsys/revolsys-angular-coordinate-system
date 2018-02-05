import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';
import {GeoCS} from '../cs/GeoCS';
import {CSI} from '../cs/CSI';

@Component({
  selector: 'app-distance-angle',
  templateUrl: './distance-angle.component.html',
  styleUrls: ['./distance-angle.component.css']
})
export class DistanceAngleComponent implements OnInit {
  form: FormGroup;

  hasResult = false;

  azimuth1: number;

  azimuth2: number;

  distance: number;

  cs = CSI.NAD83;

  constructor(private fb: FormBuilder) {
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      fromPoint: {
        x: null,
        y: null
      },
      toPoint: {
        x: null,
        y: null
      },
      cs: this.cs
    });
    this.form.valueChanges.subscribe(data => {
      const cs = data.cs;
      this.cs = data.cs;
      let x1 = data.fromPoint.x;
      let y1 = data.fromPoint.y;
      let x2 = data.toPoint.x;
      let y2 = data.toPoint.y;
      if (cs instanceof GeoCS) {
        x1 = Angle.toDecimalDegrees(x1);
        y1 = Angle.toDecimalDegrees(y1);
        x2 = Angle.toDecimalDegrees(x2);
        y2 = Angle.toDecimalDegrees(y2);
      }
      if (x1 && y1 && x2 && y2) {
        this.hasResult = true;
        const result = cs.distanceAndAngle(x1, y1, x2, y2);
        this.distance = result[0];
        this.azimuth1 = result[1];
        this.azimuth2 = result[2];
      } else {
        this.hasResult = false;
      }
    });
  }
  ngOnInit() {
    this.form.patchValue({
      fromPoint: {
        x: '-121',
        y: '50'
      },
      toPoint: {
        x: '-120',
        y: '51'
      }
    });
  }
}
