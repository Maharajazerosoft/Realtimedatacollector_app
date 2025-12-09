import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentpagePage } from './contentpage.page';

describe('ContentpagePage', () => {
  let component: ContentpagePage;
  let fixture: ComponentFixture<ContentpagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
