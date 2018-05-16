import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {
  Component,
  OnInit,
  Injector
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {AlbersConicEqualArea} from '../cs/AlbersConicEqualArea';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';
import {GeoCS} from '../cs/GeoCS';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {Numbers} from '../cs/Numbers';

@Component({
  selector: 'rs-cs-coordinate-system-conversion',
  templateUrl: './coordinate-system-conversion.component.html',
  styleUrls: ['./coordinate-system-conversion.component.css']
})
export class CoordinateSystemConversionComponent extends AbstractCoordinateSystemComponent implements OnInit {
  get cs(): CS {
    if (this.form) {
      return this.form.controls['sourceCs'].value;
    } else {
      return null;
    }
  }

  targetCs = CSI.BC_ALBERS;

  form: FormGroup;

  resultForm: FormGroup = this.fb.group({
    targetPoint: this.fb.group({
      cs: CSI.BC_ALBERS,
      x: null,
      y: null
    })
  });

  hasResult = false;

  constructor(
    protected injector: Injector,
    private fb: FormBuilder) {
    super(injector, 'Coordinate System Conversion', 'DMS');
    this.form = this.fb.group({
      sourcePoint: this.fb.group({
        cs: CSI.NAD83,
        x: null,
        y: null
      }),
      sourceCs: CSI.NAD83,
      targetCs: this.targetCs
    });
    this.form.controls['sourceCs'].valueChanges.subscribe(cs => {
      this.form.controls['sourcePoint'].patchValue({cs: cs});
    });
    this.form.controls['targetCs'].valueChanges.subscribe(cs => {
      this.resultForm.controls['targetPoint'].patchValue({cs: cs});
    });
    this.form.valueChanges.subscribe(data => {
      const sourceCs: CS = data.sourceCs;
      this.targetCs = data.targetCs;
      if (this.form.valid) {
        const x1 = sourceCs.toX(data.sourcePoint.x);
        const y1 = sourceCs.toY(data.sourcePoint.y);
        const targetPoint = sourceCs.convertPoint(this.targetCs, x1, y1);
        if (targetPoint) {
          this.hasResult = true;
          const x2 = this.targetCs.makePrecise(targetPoint[0]);
          const y2 = this.targetCs.makePrecise(targetPoint[1]);
          this.resultForm.patchValue({
            targetPoint: {
              x: x2,
              y: y2
            },
          });
        } else {
          this.hasResult = false;
        }

      } else {
        this.hasResult = false;
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();
    //    this.form.patchValue({
    //      sourcePoint: {
    //        x: '-121',
    //        y: '50'
    //      },
    //    });
    //    this.form.patchValue({
    //      targetCs: CSI.utmN(10),
    //      sourcePoint: {
    //        x: '120 13 04.80242W',
    //        y: '55 44 41.39955N'
    //      },
    //    });

    //    this.form.patchValue({
    //      sourceCs: CSI.utmN(10),
    //      targetCs: CSI.NAD83,
    //      sourcePoint: {
    //        x: '674623.543',
    //        y: '6181185.988'
    //      },
    //    });
  }

}
