import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {AppComponent} from './app.component';
import {DistanceAngleComponent} from './distance-angle/distance-angle.component';
import {CoordinateFromDistanceAngleComponent} from './coordinate-from-distance-angle/coordinate-from-distance-angle.component';


import {AppRoutingModule} from './app-routing.module';


@NgModule({
  declarations: [
    AppComponent,
    DistanceAngleComponent,
    CoordinateFromDistanceAngleComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
