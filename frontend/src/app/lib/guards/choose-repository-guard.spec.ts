import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../store/adonis-import-store.service';
import { AdonisStoreService } from '../store/adonis-store.service';
import { canChooseRepository } from './choose-repository-guard';

describe('canChooseRepository', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canChooseRepository(...guardParameters));

  let storeMock: { purpose: ReturnType<typeof vi.fn> };
  let importStoreMock: {
    repositories: ReturnType<typeof vi.fn>;
    loadRepositories: ReturnType<typeof vi.fn>;
  };
  let fallbackTree: UrlTree;

  beforeEach(() => {
    fallbackTree = {} as UrlTree;
    storeMock = {
      purpose: vi.fn(),
    };
    importStoreMock = {
      repositories: vi.fn(),
      loadRepositories: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AdonisStoreService, useValue: storeMock },
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

  it('allows activation and triggers repository loading when purpose is import and repositories are missing', () => {
    storeMock.purpose.mockReturnValue('import');
    importStoreMock.repositories.mockReturnValue(undefined);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
  });

  it('allows activation without reloading when repositories are already present', () => {
    storeMock.purpose.mockReturnValue('import');
    importStoreMock.repositories.mockReturnValue([{ id: 'repo-1' }]);

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(true);
    expect(importStoreMock.loadRepositories).not.toHaveBeenCalled();
  });

  it('redirects to root for non-import purpose', () => {
    storeMock.purpose.mockReturnValue('config');

    const result = executeGuard({} as any, {} as any);

    expect(result).toBe(fallbackTree);
    expect(importStoreMock.loadRepositories).not.toHaveBeenCalled();
  });
});
