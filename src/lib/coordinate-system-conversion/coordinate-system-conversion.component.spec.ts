import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoordinateSystemConversionComponent } from './coordinate-system-conversion.component';

describe('CoordinateSystemConversionComponent', () => {
  let component: CoordinateSystemConversionComponent;
  let fixture: ComponentFixture<CoordinateSystemConversionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoordinateSystemConversionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoordinateSystemConversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
