import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {
  PointOffsetComponent,
  DistanceAngleComponent,
  CoordinateSystemConversionComponent,
  MeridianConvergenceComponent
} from '../lib/public_api';
import {ScaleFactorTtCorrectionComponent} from "../lib/scale-factor-tt-correction/scale-factor-tt-correction.component";

const routes: Routes = [
  {path: '', redirectTo: 'distance-angle', pathMatch: 'full'},
  {path: 'distance-angle', component: DistanceAngleComponent},
  {path: 'point-offset', component: PointOffsetComponent},
  {path: 'coordinate-system-conversion', component: CoordinateSystemConversionComponent},
  {path: 'meridian-convergence', component: MeridianConvergenceComponent},
  {path: 'scale-factor-tt-correction', component: ScaleFactorTtCorrectionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
