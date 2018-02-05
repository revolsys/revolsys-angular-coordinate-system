import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistanceAngleComponent } from './distance-angle.component';

describe('DistanceAngleComponent', () => {
  let component: DistanceAngleComponent;
  let fixture: ComponentFixture<DistanceAngleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistanceAngleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistanceAngleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
