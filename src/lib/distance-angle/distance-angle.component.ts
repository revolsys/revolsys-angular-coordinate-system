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
import {Numbers} from '../cs/Numbers';

@Component({
  selector: 'rs-cs-distance-angle',
  templateUrl: './distance-angle.component.html',
  styleUrls: ['./distance-angle.component.css']
})
export class DistanceAngleComponent extends AbstractCoordinateSystemComponent implements OnInit {
  form: FormGroup;

  hasResult = false;

  azimuth1: number;

  azimuth2: number;

  distance: number;

  constructor(private fb: FormBuilder) {
    super('DMS');
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
      this.cs = data.cs;
      const x1 = this.cs.toNumber(data.fromPoint.x);
      const y1 = this.cs.toNumber(data.fromPoint.y);
      const x2 = this.cs.toNumber(data.toPoint.x);
      const y2 = this.cs.toNumber(data.toPoint.y);
      if (x1 != null && y1 != null && x2 != null && y2 != null) {
        this.hasResult = true;
        this.distance = Numbers.makePrecise(1000, this.cs.distance(x1, y1, x2, y2));
        this.azimuth1 = Numbers.makePrecise(10000000, this.cs.angle(x1, y1, x2, y2));
        this.azimuth2 = Numbers.makePrecise(10000000, this.cs.angle(x2, y2, x1, y1));
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
