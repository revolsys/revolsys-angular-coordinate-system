import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {CoordinateFromDistanceAngleComponent} from './coordinate-from-distance-angle/coordinate-from-distance-angle.component';
import {DistanceAngleComponent} from './distance-angle/distance-angle.component';

const routes: Routes = [
  {path: '', redirectTo: 'distance-angle', pathMatch: 'full'},
  {path: 'distance-angle', component: DistanceAngleComponent},
  {path: 'point-offset', component: CoordinateFromDistanceAngleComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
