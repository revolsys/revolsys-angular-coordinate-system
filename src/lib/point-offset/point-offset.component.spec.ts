import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateFromDistanceAngleComponent } from './point-offset.component';

describe('CoordinateFromDistanceAngleComponent', () => {
  let component: CoordinateFromDistanceAngleComponent;
  let fixture: ComponentFixture<CoordinateFromDistanceAngleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoordinateFromDistanceAngleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinateFromDistanceAngleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
