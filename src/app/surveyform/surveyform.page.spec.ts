import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyformPage } from './surveyform.page';

describe('SurveyformPage', () => {
  let component: SurveyformPage;
  let fixture: ComponentFixture<SurveyformPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyformPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
