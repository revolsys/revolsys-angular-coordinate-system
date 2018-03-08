import {AbstractCoordinateSystemComponent} from '../abstract-coordinate-system.component';
import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {GeoCS} from '../cs/GeoCS';

@Component({
  selector: 'rs-cs-point-field',
  templateUrl: './point-field.component.html',
  styleUrls: ['./point-field.component.css']
})
export class PointFieldComponent extends AbstractCoordinateSystemComponent implements OnInit {

  @Input('parentForm')
  parentForm: FormGroup;

  @Input('name')
  name: string;

  pointForm: FormGroup;

  @Input()
  editable = true;

  @Input()
  floatLabel = 'auto';

  get isGeographic(): boolean {
    return this.cs instanceof GeoCS;
  }

  @Input()
  prefix: string;

  constructor( @Inject(FormBuilder) private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    if (this.prefix) {
      this.prefix = this.prefix.trim() + ' ';
    }
    const value = this.parentForm.value[this.name];
    this.pointForm = <FormGroup>this.parentForm.controls[this.name];
    if (!this.pointForm) {
      this.pointForm = this.fb.group({
        'x': null,
        'y': null
      });
      this.parentForm.addControl(this.name, this.pointForm);
      const newValue = {};
      newValue[this.name] = this.pointForm.value;
      this.parentForm.patchValue(newValue);
    }
  }

  get x(): string {
    const coordinate = this.pointForm.value['x'];
    if (this.editable) {
      return coordinate;
    } else {
      return this.formatX(coordinate)
    }
  }

  set x(x: string) {
    if (this.editable) {
      this.pointForm.patchValue({'x': x});
    }
  }

  get y(): string {
    const coordinate = this.pointForm.value['y'];
    if (this.editable) {
      return coordinate;
    } else {
      return this.formatY(coordinate)
    }
  }

  set y(y: string) {
    if (this.editable) {
      this.pointForm.patchValue({'y': y});
    }
  }

}
