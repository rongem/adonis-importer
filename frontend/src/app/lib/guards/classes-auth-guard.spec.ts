import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkflowState } from '../enums/workflow-state.enum';
import { ApplicationStateService } from '../store/application-state.service';
import { canActivateClasses } from './classes-auth-guard';

describe('canActivateClasses', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => canActivateClasses(...guardParameters));

  let appState: ApplicationStateService;
  let fallbackTree: UrlTree;

  beforeEach(() => {
    fallbackTree = {} as UrlTree;

    TestBed.configureTestingModule({
      providers: [
        ApplicationStateService,
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(() => fallbackTree),
          },
        },
      ],
    });

    appState = TestBed.inject(ApplicationStateService);
  });

  it('allows activation when classes are loaded', () => {
    appState.classesState.set(WorkflowState.Loaded);

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(true);
  });

  it('redirects to root when classes are not loaded', () => {
    appState.classesState.set(WorkflowState.Loading);

    const result = executeGuard({} as any, {} as any);
    expect(result).toBe(fallbackTree);
  });
});
