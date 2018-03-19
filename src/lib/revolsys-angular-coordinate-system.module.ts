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
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {CoordinateSystemConversionComponent} from './coordinate-system-conversion/coordinate-system-conversion.component';
import {CsFieldComponent} from './cs-field/cs-field.component';
import {LineMetricsComponent} from './line-metrics/line-metrics.component';
import {MeridianConvergenceComponent} from './meridian-convergence/meridian-convergence.component';
import {PointFieldComponent} from './point-field/point-field.component';
import {PointOffsetComponent} from './point-offset/point-offset.component';

const components = [
  CoordinateSystemConversionComponent,
  CsFieldComponent,
  LineMetricsComponent,
  MeridianConvergenceComponent,
  PointFieldComponent,
  PointOffsetComponent
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
    MatExpansionModule,
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
