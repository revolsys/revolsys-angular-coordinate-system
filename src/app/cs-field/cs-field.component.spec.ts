import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CsFieldComponent } from './cs-field.component';

describe('CsFieldComponent', () => {
  let component: CsFieldComponent;
  let fixture: ComponentFixture<CsFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CsFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CsFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
