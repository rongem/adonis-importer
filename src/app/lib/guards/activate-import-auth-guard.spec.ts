import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { canActivateImport } from './activate-import-auth-guard';

describe('activateImportAuthGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => canActivateImport(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
