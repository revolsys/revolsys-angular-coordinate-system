import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
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
  selector: 'rs-cs-point-offset',
  templateUrl: './point-offset.component.html',
  styleUrls: ['./point-offset.component.css']
})
export class PointOffsetComponent extends AbstractCoordinateSystemComponent implements OnInit {
  form: FormGroup;

  resultForm = this.fb.group({
    toPoint: this.fb.group({x: null, y: null}),
    cs: this.cs
  });

  hasResult = false;

  longitude2: number;

  latitude2: number;

  azimuth2: number;

  constructor(private fb: FormBuilder) {
    super('DMS');
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      point: this.fb.group({x: null, y: null}),
      toPoint: this.fb.group({x: null, y: null}),
      azimuth: null,
      distance: null,
      cs: this.cs
    });
    this.form.valueChanges.subscribe(data => {
      this.cs = data.cs;
      const x = this.cs.toNumber(data.point.x);
      const y = this.cs.toNumber(data.point.y);

      const distance = parseFloat(data.distance);
      const azimuth = Angle.toDecimalDegrees(data.azimuth);
      if (x != null && y != null && distance != null && azimuth != null) {
        this.hasResult = true;
        const result = this.cs.pointOffset(x, y, distance, azimuth);
        this.resultForm.patchValue({
          toPoint: {
            x: result[0],
            y: result[1]
          }
        });

        this.longitude2 = result[0];
        this.latitude2 = result[1];
        this.azimuth2 = this.cs.angle(this.longitude2, this.latitude2, x, y);
      } else {
        this.hasResult = false;
      }
    });
  }

  ngOnInit() {
    //    this.form.patchValue({
    //      point: {
    //        x: '-121',
    //        y: '50'
    //      },
    //      azimuth: '32.1453936',
    //      distance: '131935.9627804203'
    //    });
  }
}
