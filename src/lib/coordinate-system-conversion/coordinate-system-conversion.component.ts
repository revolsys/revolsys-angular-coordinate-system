import {Component, OnInit} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {AlbersConicEqualArea} from '../cs/AlbersConicEqualArea';
import {Angle} from '../cs/Angle';
import {Ellipsoid} from '../cs/Ellipsoid';
import {GeoCS} from '../cs/GeoCS';
import {CSI} from '../cs/CSI';
import {Numbers} from '../cs/Numbers';

@Component({
  selector: 'rs-cs-coordinate-system-conversion',
  templateUrl: './coordinate-system-conversion.component.html',
  styleUrls: ['./coordinate-system-conversion.component.css']
})
export class CoordinateSystemConversionComponent implements OnInit {
  sourceCs = CSI.NAD83;

  targetCs = CSI.BC_ALBERS;

  form: FormGroup;

  resultForm: FormGroup = this.fb.group({
    targetPoint: {
      x: null,
      y: null
    }
  });

  hasResult = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      sourcePoint: {
        x: null,
        y: null
      },
      targetPoint: {
        x: null,
        y: null
      },
      sourceCs: this.sourceCs,
      targetCs: this.targetCs
    });
    this.form.valueChanges.subscribe(data => {
      this.sourceCs = data.sourceCs;
      this.targetCs = data.targetCs;
      const x1 = this.sourceCs.toNumber(data.sourcePoint.x);
      const y1 = this.sourceCs.toNumber(data.sourcePoint.y);
      if (x1 != null && y1 != null) {
        const targetPoint = this.sourceCs.convertPoint(this.targetCs, x1, y1);
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
    this.form.patchValue({
      sourcePoint: {
        x: '-121',
        y: '50'
      },
    });
  }

}
