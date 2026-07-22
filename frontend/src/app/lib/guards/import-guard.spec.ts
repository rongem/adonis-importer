import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../store/adonis-import-store.service';
import { canActivateImport } from './import-guard';

describe('canActivateImport', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canActivateImport(...guardParameters));

  let importStoreMock: { selectedObjectGroup: ReturnType<typeof vi.fn> };
  let fallbackTree: UrlTree;

  beforeEach(() => {
    fallbackTree = {} as UrlTree;
    importStoreMock = {
      selectedObjectGroup: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AdonisImportStoreService, useValue: importStoreMock },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(() => fallbackTree),
          },
        },
      ],
    });
  });

  it('allows activation when an object group is selected', () => {
    importStoreMock.selectedObjectGroup.mockReturnValue({ id: 'grp-1' });

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('redirects to root when no object group is selected', () => {
    importStoreMock.selectedObjectGroup.mockReturnValue(undefined);

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(fallbackTree);
  });
});
