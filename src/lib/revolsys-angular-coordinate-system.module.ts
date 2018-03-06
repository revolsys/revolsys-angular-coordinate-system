import {NgModule, ModuleWithProviders} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';

import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';

import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';


import {CoordinateSystemConversionComponent} from './coordinate-system-conversion/coordinate-system-conversion.component';
import {CsFieldComponent} from './cs-field/cs-field.component';
import {DistanceAngleComponent} from './distance-angle/distance-angle.component';
import {MeridianConvergenceComponent} from "./meridian-convergence/meridian-convergence.component";
import {PointFieldComponent} from './point-field/point-field.component';
import {PointOffsetComponent} from './point-offset/point-offset.component';
import {ScaleFactorTtCorrectionComponent} from './scale-factor-tt-correction/scale-factor-tt-correction.component';

const components = [
  CoordinateSystemConversionComponent,
  CsFieldComponent,
  DistanceAngleComponent,
  MeridianConvergenceComponent,
  PointFieldComponent,
  PointOffsetComponent,
  ScaleFactorTtCorrectionComponent
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule,

    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  declarations: components,
  exports: components
})
export class RevolsysAngularCoordinateSystemModule {
}
