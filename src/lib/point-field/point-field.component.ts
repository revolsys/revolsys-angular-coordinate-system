import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Angle} from '../cs/Angle';
import {Component, Inject, Input, OnInit, Injector} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {GeoCS} from '../cs/GeoCS';

@Component({
  selector: 'rs-cs-point-field',
  templateUrl: './point-field.component.html',
  styleUrls: ['./point-field.component.css']
})
export class PointFieldComponent extends AbstractCoordinateSystemComponent implements OnInit {
  private _cs: CS = CSI.NAD83;

  @Input('parentForm')
  parentForm: FormGroup;

  @Input('name')
  name: string;

  pointForm: FormGroup;

  @Input()
  readonly = false;

  @Input()
  floatLabel = 'auto';

  get cs(): CS {
    return this._cs;
  }

  get isGeographic(): boolean {
    return this.cs instanceof GeoCS;
  }

  @Input()
  prefix: string;

  @Input()
  required = false;

  get x(): string {
    const coordinate = this.pointForm.value['x'];
    return this.formatX(coordinate);
  }

  set x(x: string) {
  }

  get y(): string {
    const coordinate = this.pointForm.value['y'];
    return this.formatY(coordinate);
  }

  set y(y: string) {
  }

  constructor(
    @Inject(Injector) protected injector: Injector,
    @Inject(FormBuilder) private fb: FormBuilder,
  ) {
    super(injector, null);
  }

  ngOnInit(): void {
    if (this.prefix) {
      this.prefix = this.prefix.trim() + ' ';
    }
    const value = this.parentForm.value[this.name];
    this.pointForm = <FormGroup>this.parentForm.controls[this.name];
    if (this.pointForm) {
      if (!this.pointForm.controls['cs']) {
        this.pointForm.addControl('cs', this.fb.control(CSI.NAD83));
      }
      this._cs = this.pointForm.controls['cs'].value;
      this.setValidators();
    } else {
      this.pointForm = this.fb.group({
        'cs': CSI.NAD83,
        'x': null,
        'y': null
      });
      this.setValidators();
      this.parentForm.addControl(this.name, this.pointForm);
      const newValue = {};
      newValue[this.name] = this.pointForm.value;
      this.parentForm.patchValue(newValue);
    }
    this.pointForm.controls['cs'].valueChanges.subscribe(data => {
      this._cs = data;
      this.setValidators();
    });
  }

  getErrorMessage(form: FormGroup, controlName: string): string {
    const messages = [];
    const control = form.controls[controlName];
    if (control.hasError('required')) {
      messages.push('Required');
    }
    const patternError = control.getError('pattern');
    if (patternError) {
      messages.push('Invalid value');
    }
    return messages.join(', ');
  }

  private setValidators() {
    const form = this.pointForm;
    if (form) {
      const cs = form.controls['cs'].value;
      const controlX = form.controls['x'];
      const controlY = form.controls['y'];
      const validatorsX = [];
      const validatorsY = [];
      if (this.required) {
        validatorsX.push(Validators.required);
        validatorsY.push(Validators.required);
      }
      if (cs instanceof GeoCS) {
      } else {
        validatorsX.push(Validators.pattern(/^-?\d+(\.\d{1,3})?$/));
        validatorsY.push(Validators.pattern(/^-?\d+(\.\d{1,3})?$/));
      }
      controlX.setValidators(validatorsX);
      controlY.setValidators(validatorsY);
      controlX.updateValueAndValidity();
      controlY.updateValueAndValidity();
    }
  }

}
