import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisStoreService } from '../store/adonis-store.service';
import { canActivateExport } from './export-guard';

describe('canActivateExport', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canActivateExport(...guardParameters));

  let storeMock: { purpose: ReturnType<typeof vi.fn> };
  let fallbackTree: UrlTree;

  beforeEach(() => {
    fallbackTree = {} as UrlTree;
    storeMock = {
      purpose: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AdonisStoreService, useValue: storeMock },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(() => fallbackTree),
          },
        },
      ],
    });
  });

  it('allows activation for config purpose', () => {
    storeMock.purpose.mockReturnValue('config');

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('redirects to root for non-config purpose', () => {
    storeMock.purpose.mockReturnValue('import');

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(fallbackTree);
  });
});
