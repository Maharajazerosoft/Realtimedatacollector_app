import { TestBed } from '@angular/core/testing';

import { AddressComplete } from './address-complete';

describe('AddressComplete', () => {
  let service: AddressComplete;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddressComplete);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
