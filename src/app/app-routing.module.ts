import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {PointOffsetComponent} from './point-offset/point-offset.component';
import {DistanceAngleComponent} from './distance-angle/distance-angle.component';

const routes: Routes = [
  {path: '', redirectTo: 'distance-angle', pathMatch: 'full'},
  {path: 'distance-angle', component: DistanceAngleComponent},
  {path: 'point-offset', component: PointOffsetComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
