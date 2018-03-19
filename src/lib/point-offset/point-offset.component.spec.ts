import {
  ComponentFixture,
  TestBed,
  async
} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";

import {
  AbstractControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';


import {CSI} from '../cs/CSI';

import {CsFieldComponent} from '../cs-field/cs-field.component';
import {PointFieldComponent} from '../point-field/point-field.component';

import {PointOffsetComponent} from './point-offset.component';

describe('PointOffsetComponent', () => {

  let component: PointOffsetComponent;
  let fixture: ComponentFixture<PointOffsetComponent>;
  let form: FormGroup;
  let controls: {[key: string]: AbstractControl;}
  let resultForm: FormGroup;
  let resultControls: {[key: string]: AbstractControl;}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MatToolbarModule,
        MatTooltipModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CsFieldComponent, PointFieldComponent, PointOffsetComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PointOffsetComponent);

    component = fixture.componentInstance;
    component.ngOnInit();
    form = component.form;
    controls = form.controls;
    resultForm = component.resultForm;
    resultControls = resultForm.controls;
  });

  it('form invalid when empty', () => {
    expect(form.valid).toBeFalsy();
  });
  for (let fieldName of ['point', 'azimuth', 'distance']) {
    it(`${fieldName} invalid when empty`, () => {
      expect(controls[fieldName].valid).toBeFalsy();
    });
  }
  it('default values', () => {
    expect(controls['cs'].value).toBe(CSI.NAD83);
    expect(controls['distance'].value).toBe('');
    expect(controls['azimuth'].value).toBe('');
  });

  const validValues = [
    [CSI.NAD83, '-109 0 0.12345', '45 0 0.12345', '1.234', '12 34 5.68', '109 00 00.11119W', '45 00 00.16247N', '192 34 05.69']
  ];
  for (let i = 0; i < validValues.length; i++) {
    const values = validValues[i];
    it('values ' + (i + 1), () => {
      form.patchValue({
        cs: values[0],
        point: {
          x: values[1],
          y: values[2]
        },
        distance: values[3],
        azimuth: values[4]
      });
      expect(form.valid).toBeTruthy();
      const toPoint: FormGroup = <FormGroup>resultControls['toPoint'];
      expect(component.formatX(toPoint.controls['x'].value)).toBe(values[5]);
      expect(component.formatY(toPoint.controls['y'].value)).toBe(values[6]);
      expect(component.formatAngle(component.azimuth2)).toBe(values[7]);
    });
  }
});