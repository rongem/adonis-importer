import { createSelector, createFeatureSelector } from '@ngrx/store';

import { State, STORE } from './store.reducer';
import { WorkflowState } from '../interfaces/workflow-state.enum';

const appState = createFeatureSelector<State>(STORE);

export const working = createSelector(appState, state => state.classesState === WorkflowState.Loading);
export const classesReady = createSelector(appState, state => state.classesState === WorkflowState.Loaded);

export const errorPresent = createSelector(appState, state => !!state.errorMessage);

export const classes = createSelector(appState, appState => Object.values(appState.repositoryClasses).sort((a, b) => a.class.displayNames.de > b.class.displayNames.de ? 1 : -1));

// export const tableNamesForSchema = (schema: string) => createSelector(tables, tables => tables.filter(t => t.schema === schema).map(t => t.name).sort());

