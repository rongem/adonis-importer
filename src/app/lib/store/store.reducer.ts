import { Action, ActionReducerMap, createReducer, on } from "@ngrx/store";
import * as StoreActions from './store.actions';
import { ClassContainer } from "../interfaces/container-class.interface";
import { WorkflowState } from "../interfaces/workflow-state.enum";
import { AttributeTypeContainer } from "../interfaces/container-attributetype.interface";
import { NotebookContainer } from "../interfaces/container-notebook.interface";
import { AttributeContainer } from "../interfaces/container-attribute.interface";

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
    attributeTypesState: WorkflowState;
    notAuthorized: boolean;
    repositoryClasses: ClassContainer;
    notebooks: NotebookContainer;
    attributes: AttributeContainer;
    attributeTypes: AttributeTypeContainer;
    errorMessage?: string;
};

const initialState: State = {
    classesState: WorkflowState.NotPresent,
    notebookState: WorkflowState.NotPresent,
    attributesState: WorkflowState.NotPresent,
    attributeTypesState: WorkflowState.NotPresent,
    notAuthorized: true,
    repositoryClasses: {},
    notebooks: {},
    attributes: {},
    attributeTypes: {},
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
        on(StoreActions.LoadAttributeTypes, (state, action) => ({
            ...state,
            attributeTypesState: WorkflowState.Loading,
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
        on(StoreActions.AttributeTypesLoadingFailed, (state, action) => ({
            ...state,
            attributeTypesState: WorkflowState.ErrorOccured,
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
        on(StoreActions.AttributeTypesLoaded, (state, action) => ({
            ...state,
            attributeTypesState: WorkflowState.Loaded,
            attributeTypes: action.attributeTypes,
        })),
    )(appState, appAction);
}

