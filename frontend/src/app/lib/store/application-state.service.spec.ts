import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WorkflowState } from '../enums/workflow-state.enum';
import { ApplicationStateService } from './application-state.service';

describe('ApplicationStateService', () => {
  let appState: ApplicationStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    appState = TestBed.inject(ApplicationStateService);
  });

  it('is working while any workflow state is loading', () => {
    expect(appState.working()).toBe(false);

    appState.setState('objectGroups', WorkflowState.Loading);
    expect(appState.working()).toBe(true);

    appState.setState('objectGroups', WorkflowState.Loaded);
    expect(appState.working()).toBe(false);
  });

  it('reports errors with message, log and failed states', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const error = new Error('kaputt');

    appState.reportError('Fehler beim Laden', error, 'notebooks', 'attributes');

    expect(appState.errorMessage()).toBe('Fehler beim Laden');
    expect(appState.errorPresent()).toBe(true);
    expect(appState.notebookState()).toBe(WorkflowState.ErrorOccured);
    expect(appState.attributesState()).toBe(WorkflowState.ErrorOccured);
    expect(appState.classesState()).toBe(WorkflowState.NotPresent);
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });

  it('clears the error message', () => {
    appState.setError('Fehler');
    appState.clearError();

    expect(appState.errorPresent()).toBe(false);
  });
});
