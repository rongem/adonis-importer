import { Action, ActionReducerMap, createReducer, on } from "@ngrx/store";
import * as StoreActions from './store.actions';
import { ClassContainer } from "../interfaces/container-class.interface";
import { WorkflowState } from "../interfaces/workflow-state.enum";
import { NotebookContainer } from "../interfaces/container-notebook.interface";
import { AttributeContainer } from "../interfaces/container-attribute.interface";
import { CellContent } from "../models/cellcontent.model";
import { Column } from "../models/rest-backend/column.model";
import { ErrorList } from "../models/rest-backend/errorlist.model";
import { AdonisRepository } from "../interfaces/adonis-repository.interface";
import { AdonisObjectGroup } from "../interfaces/adonis-object-group.interface";

export const STORE = 'STORE';

export interface AppState {
    [STORE]: State,
}

export const appReducer: ActionReducerMap<AppState> = {
    [STORE]: storeReducer,
};


export interface State {
    classesState: WorkflowState;
    notebookState: WorkflowState;
    attributesState: WorkflowState;
    repositoryState: WorkflowState;
    objectGroupState: WorkflowState;
    notAuthorized: boolean;
    repositoryClasses: ClassContainer;
    notebooks: NotebookContainer;
    attributes: AttributeContainer;
    repositories?: AdonisRepository[];
    selectedRepositoryId?: string;
    objectGroups?: AdonisObjectGroup;
    columnDefinitions?: Column[];
    cellContents: CellContent[];
    columnMapping: number[];
    errorMessage?: string;
    rowErrors: ErrorList[];
    canImport: boolean;
    importedRows?: number;
};

const initialState: State = {
    classesState: WorkflowState.NotPresent,
    notebookState: WorkflowState.NotPresent,
    attributesState: WorkflowState.NotPresent,
    repositoryState: WorkflowState.NotPresent,
    objectGroupState: WorkflowState.NotPresent,
    notAuthorized: true,
    repositoryClasses: {},
    notebooks: {},
    attributes: {},
    cellContents: [],
    columnMapping: [],
    rowErrors: [],
    canImport: false,
};

export function storeReducer(appState: State | undefined, appAction: Action) {
    return createReducer(
        initialState,
        on(StoreActions.LoadClasses, (state, action) => ({
            ...state,
            classesState: WorkflowState.Loading,
            errorMessage: undefined,
        })),
        on(StoreActions.LoadNotebooks, (state, action) => ({
            ...state,
            notebookState: WorkflowState.Loading,
        })),
        on(StoreActions.LoadAttributes, (state, action) => ({
            ...state,
            attributesState: WorkflowState.Loading,
        })),
        on(StoreActions.LoadRepositories, (state, action) => ({
            ...state,
            repositoryState: WorkflowState.Loading,
        })),
        on(StoreActions.LoadObjectGroups, (state, action) => ({
            ...state,
            objectGroupState: WorkflowState.Loading,
        })),
        on(StoreActions.ClassesLoadingFailed, (state, action) => ({
            ...state,
            classesState: WorkflowState.ErrorOccured,
            errorMessage: action.errorMessage,
        })),
        on(StoreActions.NotebooksLoadingFailed, (state, action) => ({
            ...state,
            notebookState: WorkflowState.ErrorOccured,
            errorMessage: action.errorMessage,
        })),
        on(StoreActions.AttributesLoadingFailed, (state, action) => ({
            ...state,
            attributesState: WorkflowState.ErrorOccured,
            errorMessage: action.errorMessage,
        })),
        on(StoreActions.RepositoryLoadingFailed, (state, action) => ({
            ...state,
            repositoryState: WorkflowState.ErrorOccured,
            errorMessage: action.errorMessage,
        })),
        on(StoreActions.ObjectGroupLoadingFailed, (state, action) => ({
            ...state,
            objectGroupState: WorkflowState.ErrorOccured,
            errorMessage: action.errorMessage,
        })),
        on(StoreActions.ClassesLoaded, (state, action) => ({
            ...state,
            classesState: WorkflowState.Loaded,
            repositoryClasses: action.classContainer,
        })),
        on(StoreActions.NotebooksLoaded, (state, action) => ({
            ...state,
            notebookState: WorkflowState.Loaded,
            notebooks: action.notebookContainer,
        })),
        on(StoreActions.AttributesLoaded, (state, action) => ({
            ...state,
            attributesState: WorkflowState.Loaded,
            attributes: action.attributesContainer,
        })),
        on(StoreActions.RepositoriesLoaded, (state, action) => ({
            ...state,
            repositoryState: WorkflowState.Loaded,
            repositories: action.repositoryList.repos,
        })),
        on(StoreActions.ObjectGroupsLoaded, (state, action) => ({
            ...state,
            objectGroupState: WorkflowState.Loaded,
            objectGroups: action.objectGroup,
        })),
        on(StoreActions.columnsLoaded, (state, action) => ({
            ...state,
            columnDefinitions: [...action.columns],
            cellContents: [],
            columnMapping: Array.from(Array(action.columns.length).keys()),
            working: false,
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.changeColumnOrder, (state, action) => ({
            ...state,
            columnMapping: [...action.columnMappings],
            working: false,
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.setCellContents, (state, action) => ({
            ...state,
            cellContents: [...action.contents],
            rowErrors: [],
        })),
        on(StoreActions.testRowsInBackend, (state, action) => ({
            ...state,
            working: true,
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.importRowsInBackend, (state, action) => ({
            ...state,
            working: true,
            rowErrors: [],
        })),
        on(StoreActions.setRowErrors, (state, action) => ({
            ...state,
            working: false,
            // rowErrors: [...action.errors],
            // canImport: action.errors.length === 0,
        })),
        on(StoreActions.backendTestSuccessful, (state, action) => ({
            ...state,
            canImport: true,
            working: false,
        })),
        on(StoreActions.importSuccessful, (state, action) => ({
            ...state,
            cellContents: [],
            rowErrors: [],
            working: false,
            canImport: false,
            importedRows: action.importedRows
        })),
    )(appState, appAction);
}

