import { createSelector, createFeatureSelector } from '@ngrx/store';

import { State, STORE } from './store.reducer';
import { WorkflowState } from '../interfaces/workflow-state.enum';

const appState = createFeatureSelector<State>(STORE);

export const working = createSelector(appState, state =>
    state.classesState === WorkflowState.Loading ||
    state.notebookState === WorkflowState.Loading ||
    state.attributesState === WorkflowState.Loading ||
    state.attributeTypesState === WorkflowState.Loading
);

export const classesState = createSelector(appState, state => state.classesState);
export const notebookState = createSelector(appState, state => state.notebookState);
export const attributesState = createSelector(appState, state => state.attributesState);
export const attributeTypesState = createSelector(appState, state => state.attributeTypesState);

export const classesReady = createSelector(appState, state => state.classesState === WorkflowState.Loaded);
export const notebooksReady = createSelector(appState, state => state.notebookState === WorkflowState.Loaded);

export const errorPresent = createSelector(appState, state => !!state.errorMessage);
export const errorMessage = createSelector(appState, state => state.errorMessage);

export const classes = createSelector(appState, state => Object.values(state.repositoryClasses).sort((a, b) => a.displayNames.de > b.displayNames.de ? 1 : -1));

export const repositoryClass = (id: string) => createSelector(appState, state => state.repositoryClasses[id]);
export const notebook = (id: string) => createSelector(appState, state => state.notebooks[id]);
export const attributes = createSelector(appState, state => state.attributes);



