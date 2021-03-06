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
  MatExpansionModule,
  MatFormFieldModule,
  MatInputModule,
  MatMenuModule,
  MatSelectModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {RevolsysAngularCoordinateSystemModule} from '../lib/revolsys-angular-coordinate-system.module';
import {RevolsysAngularFrameworkModule} from 'revolsys-angular-framework';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
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
    MatTooltipModule,
    AppRoutingModule,
    RevolsysAngularCoordinateSystemModule,
    RevolsysAngularFrameworkModule.forRoot({
      basePath: '/pub/mascotw',
      title: 'mascot'
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
