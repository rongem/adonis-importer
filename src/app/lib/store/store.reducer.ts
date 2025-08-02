import { Action, ActionReducerMap, createReducer, on } from "@ngrx/store";
import * as StoreActions from './store.actions';
import { ClassContainer } from "../interfaces/class-container.interface";
import { WorkflowState } from "../interfaces/workflow-state.enum";

export const STORE = 'STORE';

export interface AppState {
    [STORE]: State,
}

export const appReducer: ActionReducerMap<AppState> = {
    [STORE]: storeReducer,
};


export interface State {
    classesState: WorkflowState;
    attributesState: WorkflowState;
    attributeTypesState: WorkflowState;
    notAuthorized: boolean;
    repositoryClasses: ClassContainer;
    attributes: Object[];
    attributeTypes: Object[];
    errorMessage?: string;
};

const initialState: State = {
    classesState: WorkflowState.NotPresent,
    attributesState: WorkflowState.NotPresent,
    attributeTypesState: WorkflowState.NotPresent,
    notAuthorized: true,
    repositoryClasses: {},
    attributes: [],
    attributeTypes: [],
};

export function storeReducer(appState: State | undefined, appAction: Action) {
    return createReducer(
        initialState,
        on(StoreActions.LoadClasses, (state, action) => ({
            ...state,
            classesState: WorkflowState.Loading,
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
    )(appState, appAction);
}

