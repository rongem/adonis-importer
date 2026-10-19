import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisStoreService } from '../store/adonis-store.service';
import { canChooseRepository } from './choose-repository-guard';

describe('canChooseRepository', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canChooseRepository(...guardParameters));

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

  it('allows activation when purpose is import', () => {
    storeMock.purpose.mockReturnValue('import');

    expect(executeGuard({} as any, {} as any)).toBe(true);
  });

  it('redirects to root for non-import purpose', () => {
    storeMock.purpose.mockReturnValue('config');

    expect(executeGuard({} as any, {} as any)).toBe(fallbackTree);
  });
});
