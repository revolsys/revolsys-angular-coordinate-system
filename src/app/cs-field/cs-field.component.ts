import {Component, Input, OnInit, ViewChild, forwardRef} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, } from '@angular/forms';
import {MatSelect} from '@angular/material';

import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';

@Component({
  selector: 'app-cs-field',
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
export class CsFieldComponent implements OnInit, ControlValueAccessor {
  coordinateSystems: CS[] = [CSI.NAD83, CSI.BC_ALBERS, CSI.utmN(7), CSI.utmN(8), CSI.utmN(9), CSI.utmN(10), CSI.utmN(11)];

  @ViewChild(MatSelect)
  select: MatSelect;

  @Input()
  placeholder = 'Coordinate System';

  constructor() {
  }

  @Input()
  get value(): any {
    return this.select.value;
  }
  set value(newValue: any) {
    this.select.value = newValue;
  }

  ngOnInit() {

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
