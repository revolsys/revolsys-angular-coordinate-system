import {Component, Input, ViewChild, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, } from '@angular/forms';
import {MatSelect} from '@angular/material';

import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';

@Component({
  selector: 'rs-cs-coordinate-system-field',
  templateUrl: './cs-field.component.html',
  styleUrls: ['./cs-field.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CsFieldComponent),
      multi: true
    }
  ]
})
export class CsFieldComponent implements ControlValueAccessor {
  @Input()
  coordinateSystems: CS[] = [CSI.NAD83, CSI.utmN(7), CSI.utmN(8), CSI.utmN(9), CSI.utmN(10), CSI.utmN(11), CSI.BC_ALBERS];

  @ViewChild(MatSelect)
  select: MatSelect;

  @Input()
  placeholder = 'Coordinate System';

  @Input()
  floatLabel = 'auto';

  constructor() {
  }

  @Input()
  get value(): any {
    return this.select.value;
  }
  set value(newValue: any) {
    this.select.value = newValue;
  }

  writeValue(obj: any): void {
    this.select.value = obj;
  }

  registerOnChange(fn: any): void {
    this.select.registerOnChange(fn);
  }

  registerOnTouched(fn: any): void {
    this.select.registerOnTouched(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    this.select.setDisabledState(isDisabled);
  }
}
