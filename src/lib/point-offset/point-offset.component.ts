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

        let x2;
        let y2;
        const result = this.cs.pointOffset(x, y, distance, azimuth);
        x2 = result[0];
        y2 = result[1];
        if (this.cs instanceof GeoCS) {
          const angleResult = this.cs.ellipsoid.vincenty(Angle.toRadians(-x), Angle.toRadians(y), distance, Angle.toRadians(azimuth));
          this.azimuth2 = Angle.toDegrees(angleResult[2]);
        } else {
          this.azimuth2 = this.cs.angle(x2, y2, x, y);
        }
        this.resultForm.patchValue({
          toPoint: {
            x: x2,
            y: y2
          }
        });
      } else {
        this.hasResult = false;
      }
    });
  }

  ngOnInit() {
    this.form.patchValue({
      point: {
        x: '-109 0 0.12345',
        y: '45 0 0.12345'
      },
      azimuth: '12 34 5.68',
      distance: '1.234'
    });
  }
}
