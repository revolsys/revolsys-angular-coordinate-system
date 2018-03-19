import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {GeoCS} from '../cs/GeoCS';

@Component({
  selector: 'rs-cs-point-offset',
  templateUrl: './point-offset.component.html',
  styleUrls: ['./point-offset.component.css']
})
export class PointOffsetComponent extends AbstractCoordinateSystemComponent implements OnInit {
  get cs(): CS {
    return this.form.controls['cs'].value;
  }

  form: FormGroup;

  resultForm = this.fb.group({
    toPoint: this.fb.group({x: null, y: null})
  });

  hasResult = false;

  azimuth2: number;

  constructor(private fb: FormBuilder) {
    super('DMS');
    this.createForm();
  }


  private createForm() {
    this.form = this.fb.group({
      cs: CSI.NAD83,
      point: this.fb.group({
        x: null,
        y: null
      }),
      azimuth: ['', Validators.required],
      distance: ['', Validators.required]
    });
    this.form.valueChanges.subscribe(data => {
      const cs: CS = data.cs;
      const x = cs.toX(data.point.x);
      const y = cs.toY(data.point.y);
      const distance = parseFloat(data.distance);
      const azimuth = Angle.toDecimalDegrees(data.azimuth);
      if (this.form.valid) {
        this.hasResult = true;

        let x2;
        let y2;
        const result = cs.pointOffset(x, y, distance, azimuth);
        x2 = result[0];
        y2 = result[1];
        if (cs instanceof GeoCS) {
          const angleResult = cs.ellipsoid.vincenty(Angle.toRadians(-x), Angle.toRadians(y), distance, Angle.toRadians(azimuth));
          this.azimuth2 = Angle.toDegrees360(angleResult[2]);
        } else {
          this.azimuth2 = cs.angle(x2, y2, x, y);
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
      //      cs: CSI.utmN(7),
      point: {
        x: '-109 0 0.12345',
        y: '45 0 0.12345'
      },
      azimuth: '12 34 5.68',
      distance: '1.234'
    });
  }
}
