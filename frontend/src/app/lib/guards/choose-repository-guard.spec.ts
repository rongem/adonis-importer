import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { canChooseRepository } from './choose-repository-guard';

describe('canChooseRepository', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => canChooseRepository(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
