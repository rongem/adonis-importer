import { TestBed } from '@angular/core/testing';

import { DataAccess } from './data-access';

describe('DataAccess', () => {
  let service: DataAccess;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataAccess);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
