import {Observable} from 'rxjs/Observable';
import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Angle} from '../cs/Angle';
import {Component, Inject, Input, OnInit, forwardRef, OnChanges} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  AbstractControl,
  Validator
} from '@angular/forms';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {GeoCS} from '../cs/GeoCS';

export function createAngleValidator(angleValueType: string, required: boolean) {
  return function validateAngle(control: FormControl) {
    const value = control.value;
    let result;
    if (value === null || value.length === 0) {
      if (required) {
        result = {'required': true};
      } else {
        result = null;
      }
    } else {
      let min;
      let max;
      let angle;
      if ('longitude' === angleValueType) {
        min = -180;
        max = 180;
        angle = Angle.toDecimalDegrees(value, Angle.RE_LON);
      } else if ('latitude' === angleValueType) {
        min = -90;
        max = 90;
        angle = Angle.toDecimalDegrees(value, Angle.RE_LAT);
      } else {
        min = -360;
        max = 360;
        angle = Angle.toDecimalDegrees(value, Angle.RE_DMS);
      }
      if (angle == null) {
        result = {
          angleError: {
            angleValueType: angleValueType,
            actual: value
          }
        };
      } else if (angle < min) {
        result = {'min': {min: min, actual: value}};
      } else if (angle > max) {
        result = {'max': {max: max, actual: value}};
      } else {
        result = null;
      }
    }
    return result;
  };
}

@Component({
  selector: 'rs-cs-angle-field',
  templateUrl: './angle-field.component.html',
  styleUrls: ['./angle-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AngleFieldComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AngleFieldComponent),
      multi: true
    }
  ]
})
export class AngleFieldComponent implements ControlValueAccessor, OnChanges, Validator {

  get angle(): string {
    return this.form.controls['angle'].value;
  }

  set angle(angle: string) {
  }

  @Input()
  angleValueType = 'angle';

  @Input()
  public angleFormat: string;

  @Input('name')
  name: string;

  errorMessage: string;

  @Input()
  floatLabel = 'auto';

  form: FormGroup;

  control: FormControl;

  @Input()
  placeholder: string;

  @Input()
  readonly = false;

  @Input()
  required = false;

  validateFn: Function;

  private propagateChange: any = (_: any) => {};

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
  ) {
    this.control = this.fb.control('', [(c: FormControl) => this.validate(c)]);
    this.form = this.fb.group({angle: this.control});
    this.control.valueChanges.subscribe(value => this.propagateChange(value));
  }

  ngOnChanges(): void {
    this.validateFn = createAngleValidator(this.angleValueType, this.required);
  }

  getErrorMessage(errors): string {
    const messages = [];
    if (errors['required']) {
      messages.push('Required');
    }

    const minError = errors['min'];
    if (minError) {
      messages.push(`< ${minError.min}`);
    }

    const maxError = errors['max'];
    if (maxError) {
      messages.push(`> ${maxError.max}`);
    }
    const angleError = errors['angleError'];
    if (angleError) {
      messages.push(`Invalid ${angleError.angleValueType}`);
    }

    return messages.join(', ');
  }

  writeValue(obj: any): void {
    let value;
    if (obj === null || obj === undefined) {
      value = null;
    } else {
      value = obj.toString();
    }
    this.form.patchValue({angle: value});
  }

  formatAngle(value: number, decimalPlaces: number = -1): string {
    if (value) {
      if ('DMS' === this.angleFormat) {
        if (decimalPlaces < 0) {
          decimalPlaces = 2;
        }
        if ('longitude' === this.angleValueType) {
          return Angle.toDegreesMinutesSecondsLon(value, decimalPlaces);
        } else if ('latitude' === this.angleValueType) {
          return Angle.toDegreesMinutesSecondsLat(value, decimalPlaces);
        } else {
          return Angle.toDegreesMinutesSeconds(value, decimalPlaces);
        }
      } else if (decimalPlaces < 0) {
        return value.toFixed(2);
      } else {
        return value.toString();
      }
    } else {
      return '-';
    }
  }

  validate(control: FormControl) {
    let errors;
    if (!this.readonly && this.validateFn) {
      errors = this.validateFn(control);
    }
    if (errors) {
      this.errorMessage = this.getErrorMessage(errors);
    } else {
      this.errorMessage = null;
    }
    return errors;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
  }

  setDisabledState?(isDisabled: boolean): void {
  }
}
