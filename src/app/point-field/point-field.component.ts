import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormGroup, FormBuilder} from '@angular/forms';
import {CS} from '../cs/CS';
import {CSI} from '../cs/CSI';
import {GeoCS} from '../cs/GeoCS';

@Component({
  selector: 'app-point-field',
  templateUrl: './point-field.component.html',
  styleUrls: ['./point-field.component.css']
})
export class PointFieldComponent implements OnInit {

  @Input('parentForm')
  parentForm: FormGroup;

  @Input('name')
  name: string;

  @Input('cs')
  cs = CSI.NAD83;

  form: FormGroup;

  get isGeographic(): boolean {
    return this.cs instanceof GeoCS;
  }

  @Input()
  title: string;

  constructor( @Inject(FormBuilder) private fb: FormBuilder) {
  }

  ngOnInit(): void {
    const value = this.parentForm.value[this.name];
    this.form = this.fb.group({
      'x': null,
      'y': null
    });
    this.form.patchValue(value);
    this.parentForm.controls[this.name] = null;
    this.parentForm.addControl(this.name, this.form);
    const newValue = {};
    newValue[this.name] = this.form.value;
    this.parentForm.patchValue(newValue);
  }
}
