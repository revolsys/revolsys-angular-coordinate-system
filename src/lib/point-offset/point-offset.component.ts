import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Component, OnInit, Injector, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
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
export class PointOffsetComponent extends AbstractCoordinateSystemComponent implements OnInit, AfterViewChecked {
  private _cs: CS = CSI.NAD83;

  get cs(): CS {
    return this._cs;
  }

  private pointForm = this.fb.group({
    cs: CSI.NAD83,
    x: null,
    y: null
  });

  form = this.fb.group({
    cs: CSI.NAD83,
    point: this.pointForm,
    azimuth: ['', Validators.required],
    distance: ['', Validators.required]
  });

  resultForm = this.fb.group({
    toPoint: this.fb.group({
      cs: CSI.NAD83,
      x: ['', Validators.required],
      y: null
    })
  });

  get distancePlaceholder(): string {
    if (this.cs instanceof GeoCS) {
      return 'Ellipsoidal Distance';
    } else {
      return 'Grid Distance';
    }
  }

  get anglePlaceholder(): string {
    if (this.cs instanceof GeoCS) {
      return 'Azimuth';
    } else {
      return 'Bearing';
    }
  }

  get hasResult(): boolean {
    return this.form.valid;
  }

  azimuth2: number;

  constructor(
    protected injector: Injector,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    super(injector, 'Point Offset', 'DMS');
  }


  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

  private initForm() {
    this.form.valueChanges.subscribe(data => {
      const cs: CS = data.cs;
      if (this._cs !== cs) {
        this._cs = cs;
        this.pointForm.patchValue({'cs': cs});
      }
      const x = cs.toX(data.point.x);
      const y = cs.toY(data.point.y);
      const distance = parseFloat(data.distance);
      const azimuth = Angle.toDecimalDegrees(data.azimuth);
      if (this.form.valid) {
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
            cs: cs,
            x: cs.makePrecise(x2),
            y: cs.makePrecise(y2)
          }
        });
      } else {
        this.resultForm.patchValue({
          toPoint: {
            x: null,
            y: null
          }
        });
      }
    });
    this.form.controls['cs'].valueChanges.subscribe(cs => {
      this.pointForm.markAsPending();
    });
  }

  ngOnInit() {
    this.initForm();
    //    this.form.patchValue({
    //      //      cs: CSI.utmN(7),
    //      point: {
    //        x: '-109 0 0.12345',
    //        y: '45 0 0.12345'
    //      },
    //      azimuth: '12 34 5.68',
    //      distance: '1.234'
    //    });
    //    this.form.patchValue({
    //      cs: CSI.utmN(10),
    //      point: {
    //        x: '500000',
    //        y: '5500000'
    //      },
    //      azimuth: '85',
    //      distance: '0.01'
    //    });
  }
}
