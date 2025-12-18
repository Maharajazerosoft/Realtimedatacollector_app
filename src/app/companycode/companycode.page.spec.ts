import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanycodePage } from './companycode.page';

describe('CompanycodePage', () => {
  let component: CompanycodePage;
  let fixture: ComponentFixture<CompanycodePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanycodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
