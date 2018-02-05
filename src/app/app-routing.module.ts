import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {CoordinateFromDistanceAngleComponent} from './coordinate-from-distance-angle/coordinate-from-distance-angle.component';
import {DistanceAngleComponent} from './distance-angle/distance-angle.component';

const routes: Routes = [
  {path: '', redirectTo: 'ellipsoid/inverse', pathMatch: 'full'},
  {path: 'ellipsoid/inverse', component: DistanceAngleComponent},
  {path: 'ellipsoid/direct', component: CoordinateFromDistanceAngleComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
