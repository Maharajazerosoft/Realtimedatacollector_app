import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectIntroPage } from './select-intro.page';

describe('SelectIntroPage', () => {
  let component: SelectIntroPage;
  let fixture: ComponentFixture<SelectIntroPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectIntroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
