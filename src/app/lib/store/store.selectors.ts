import { createSelector, createFeatureSelector } from '@ngrx/store';

import { State, STORE } from './store.reducer';
import { WorkflowState } from '../enums/workflow-state.enum';
import { CellInformation } from '../models/cellinformation.model';

const appState = createFeatureSelector<State>(STORE);

export const working = createSelector(appState, state =>
    state.classesState === WorkflowState.Loading ||
    state.notebookState === WorkflowState.Loading ||
    state.attributesState === WorkflowState.Loading ||
    state.repositoryState === WorkflowState.Loading
);

export const classesState = createSelector(appState, state => state.classesState);
export const notebookState = createSelector(appState, state => state.notebookState);
export const attributesState = createSelector(appState, state => state.attributesState);
export const repositoryState = createSelector(appState, state => state.repositoryState);

export const classesReady = createSelector(appState, state => state.classesState === WorkflowState.Loaded);
export const notebooksReady = createSelector(appState, state => state.notebookState === WorkflowState.Loaded);

export const errorPresent = createSelector(appState, state => !!state.errorMessage);
export const errorMessage = createSelector(appState, state => state.errorMessage);

export const classes = createSelector(appState, state => Object.values(state.repositoryClasses).sort((a, b) => a.displayNames.de > b.displayNames.de ? 1 : -1));

export const repositoryClass = (id: string) => createSelector(appState, state => state.repositoryClasses[id]);
export const selectedClass = createSelector(appState, state => state.selectedClass);
export const notebook = (id: string) => createSelector(appState, state => state.notebooks[id]);
export const selectedNotebook = createSelector(appState, selectedClass, (state, cls) => state.notebooks[cls!.id]);
export const attributes = createSelector(appState, state => state.attributes);

export const selectedProperties = createSelector(appState, state => state.selectedProperties);

export const selectedAction = createSelector(appState, state => state.exportAction);

export const repositories = createSelector(appState, state => {
    const returnValue: {[key: string]: string} = {};
    state.repositories?.forEach(r => returnValue[r.id] = r.name);
    return returnValue;
});

export const columnDefinitions = createSelector(appState, state => state.columnDefinitions?.sort((a, b) => a.ordinalPosition - b.ordinalPosition) ?? []);

export const columnDefinition = (columnPosition: number) => createSelector(columnDefinitions, columns => columns.find(c => c.ordinalPosition === columnPosition + 1));

const cellContents = createSelector(appState, state => state.cellContents);

export const columnMappings = createSelector(appState, state => state.columnMapping);

export const rowNumbers = createSelector(cellContents, contents => [...new Set(contents.map(c => c.row))]);

export const cellInformations = createSelector(cellContents, columnMappings, columnDefinitions, (cells, columnMappings, columnDefinitions) => 
    cells.map(c => new CellInformation(c, columnDefinitions[columnMappings[c.column]]))
);

export const cellInformation = (rowIndex: number, columIndex: number) => createSelector(cellInformations, cells => cells.find(c => c.row === rowIndex && c.column === columIndex));

const allRowErrors = createSelector(appState, state => state.rowErrors);

export const errorsInRow = (rowIndex: number) => createSelector(allRowErrors, errors => errors.some(e => e.row === rowIndex));

export const rowErrors = (rowIndex: number) => createSelector(allRowErrors, cellInformations, (rowErrors, cellInformations) => [
    ...rowErrors.filter(e => e.row === rowIndex).map(e => e.msg),
    ...cellInformations.filter(c => c.row === rowIndex && c.containsErrors).map(c => /*$localize*/ `Column: ` + c.name + ': ' + c.errors.join(/*$localize*/ `, `)),
]);

export const rowContainsErrors = (rowIndex: number) => createSelector(cellInformations, errorsInRow(rowIndex), (cells, errors) => 
    errors || cells.some(c => c.row === rowIndex && c.containsErrors)
);

export const tableContainsErrors = createSelector(cellInformations, cells => cells.some(c => c.containsErrors));

export const canImport = createSelector(appState, state => state.canImport);

export const importedRows = createSelector(appState, state => state.importedRows);


