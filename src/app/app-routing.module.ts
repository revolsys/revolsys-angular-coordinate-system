import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PointOffsetComponent} from '../lib/point-offset/point-offset.component';
import {DistanceAngleComponent} from '../lib/distance-angle/distance-angle.component';
import {CoordinateSystemConversionComponent} from '../lib/coordinate-system-conversion/coordinate-system-conversion.component';

const routes: Routes = [
  {path: '', redirectTo: 'distance-angle', pathMatch: 'full'},
  {path: 'distance-angle', component: DistanceAngleComponent},
  {path: 'point-offset', component: PointOffsetComponent},
  {path: 'coordinate-system-conversion', component: CoordinateSystemConversionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
