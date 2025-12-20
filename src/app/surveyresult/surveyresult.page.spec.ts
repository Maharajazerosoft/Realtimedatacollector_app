import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveyresultPage } from './surveyresult.page';

describe('SurveyresultPage', () => {
  let component: SurveyresultPage;
  let fixture: ComponentFixture<SurveyresultPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyresultPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
