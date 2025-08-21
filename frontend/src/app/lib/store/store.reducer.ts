import { Action, ActionReducerMap, createReducer, on } from "@ngrx/store";
import * as StoreActions from './store.actions';
import { AdonisClassContainer } from "../models/adonis-rest/metadata/container/container-class.interface";
import { WorkflowState } from "../enums/workflow-state.enum";
import { AdonisNotebookContainer } from "../models/adonis-rest/metadata/container/container-notebook.interface";
import { AdonisAttributeContainer } from "../models/adonis-rest/metadata/container/container-attribute.interface";
import { CellContent } from "../models/table/cellcontent.model";
import { Column } from "../models/table/column.model";
import { ErrorList } from "../models/table/errorlist.model";
import { AdonisRepository } from "../models/adonis-rest/metadata/repository.interface";
import { AdonisObjectGroup } from "../models/adonis-rest/metadata/object-group.interface";
import { AdonisClass } from "../models/adonis-rest/metadata/class.interface";
import { AttributeOrRelation } from "../models/adonis-rest/metadata/notebook-elements.interface";
import { ExportAction } from "../enums/export-action.enum";
import { AdonisItem } from "../models/adonis-rest/search/result.interface";
import { RelationTargetsContainer } from "../models/table/relationtargets.model";

export const STORE = 'STORE';

export interface AppState {
    [STORE]: State,
}

export const appReducer: ActionReducerMap<AppState> = {
    [STORE]: storeReducer,
};


export interface State {
    authenticated: boolean;

    classesState: WorkflowState;
    notebookState: WorkflowState;
    attributesState: WorkflowState;
    repositoryState: WorkflowState;
    objectGroupState: WorkflowState;
    itemState: WorkflowState;
    targetState: WorkflowState;

    notAuthorized: boolean;

    repositoryClasses: AdonisClassContainer;
    notebooks: AdonisNotebookContainer;
    attributes: AdonisAttributeContainer;
    selectedClass?: AdonisClass;
    selectedProperties?: AttributeOrRelation[];

    repositories?: AdonisRepository[];
    selectedRepositoryId?: string;
    objectGroups?: AdonisObjectGroup;
    selectedObjectGroup?: AdonisObjectGroup;

    exportAction?: ExportAction;

    columnDefinitions?: Column[];
    cellContents: CellContent[];
    columnMapping: number[];
    errorMessage?: string;
    rowErrors: ErrorList[];
    canImport: boolean;
    items?: AdonisItem[];
    targetItems?: RelationTargetsContainer;
    importedRows?: number;
};

const initialState: State = {
    authenticated: false,

    classesState: WorkflowState.NotPresent,
    notebookState: WorkflowState.NotPresent,
    attributesState: WorkflowState.NotPresent,
    repositoryState: WorkflowState.NotPresent,
    objectGroupState: WorkflowState.NotPresent,
    itemState: WorkflowState.NotPresent,
    targetState: WorkflowState.NotPresent,

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
            authenticated: true,
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
            authenticated: false,
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
        on(StoreActions.ClassSelected, (state, action) => ({
            ...state,
            selectedClass: action.selectedClass,
        })),
        on(StoreActions.PropertiesSelected, (state, action) => ({
            ...state,
            selectedProperties: action.properties,
        })),
        on(StoreActions.ActionSelected, (state, action) => ({
            ...state,
            exportAction: action.action,
        })),
        on(StoreActions.SelectRepository, (state, action) => ({
            ...state,
            selectedRepositoryId: action.repositoryId,
            objectGroupState: WorkflowState.Loading,
            objectGroups: undefined,
        })),
        on(StoreActions.SelectObjectGroup, (state, action) => ({
            ...state,
            selectedObjectGroup: action.objectGroup,
        })),
        on(StoreActions.columnsLoaded, (state, action) => ({
            ...state,
            columnDefinitions: [...action.columns],
            cellContents: [],
            columnMapping: Array.from(Array(action.columns.length).keys()),
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.changeColumnOrder, (state, action) => ({
            ...state,
            columnMapping: [...action.columnMappings],
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.setCellContents, (state, action) => ({
            ...state,
            cellContents: [...action.contents],
            rowErrors: [],
        })),
        on(StoreActions.testRows, (state, action) => ({
            ...state,
            itemState: WorkflowState.Loading,
            targetState: WorkflowState.Loading,
            rowErrors: [],
            canImport: false,
        })),
        on(StoreActions.primaryItemsLoaded, (state, action) => ({
            ...state,
            itemState: WorkflowState.Loaded,
            items: [...action.items],
        })),
        on(StoreActions.targetItemsLoaded, (state, action) => ({
            ...state,
            targetState: WorkflowState.Loaded,
            targetItems: action.content,
        })),
        on(StoreActions.importRowsInBackend, (state, action) => ({
            ...state,
            rowErrors: [],
        })),
        on(StoreActions.setRowErrors, (state, action) => ({
            ...state,
            itemState: WorkflowState.Loaded,
            rowErrors: [...action.errors],
            canImport: action.errors.length === 0,
        })),
        on(StoreActions.backendTestSuccessful, (state, action) => ({
            ...state,
            canImport: true,
        })),
        on(StoreActions.importSuccessful, (state, action) => ({
            ...state,
            cellContents: [],
            rowErrors: [],
            canImport: false,
            importedRows: action.importedRows
        })),
    )(appState, appAction);
}

