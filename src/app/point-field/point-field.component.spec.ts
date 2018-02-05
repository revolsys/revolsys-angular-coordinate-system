import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointFieldComponent } from './point-field.component';

describe('PointFieldComponent', () => {
  let component: PointFieldComponent;
  let fixture: ComponentFixture<PointFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
