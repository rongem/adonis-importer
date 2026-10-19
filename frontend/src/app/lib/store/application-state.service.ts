import { computed, Injectable, signal } from "@angular/core";
import { WorkflowState } from "../enums/workflow-state.enum";

export type WorkflowStateKey = 'classes' | 'notebooks' | 'attributes' | 'repositories' | 'objectGroups' | 'items' | 'target';

@Injectable({ providedIn: 'root' })
export class ApplicationStateService {
    // Workflow states
    private readonly states: Record<WorkflowStateKey, ReturnType<typeof signal<WorkflowState>>> = {
        classes: signal(WorkflowState.NotPresent),
        notebooks: signal(WorkflowState.NotPresent),
        attributes: signal(WorkflowState.NotPresent),
        repositories: signal(WorkflowState.NotPresent),
        objectGroups: signal(WorkflowState.NotPresent),
        items: signal(WorkflowState.NotPresent),
        target: signal(WorkflowState.NotPresent),
    };
    readonly classesState = this.states.classes.asReadonly();
    readonly notebookState = this.states.notebooks.asReadonly();
    readonly attributesState = this.states.attributes.asReadonly();
    readonly repositoryState = this.states.repositories.asReadonly();
    readonly objectGroupsState = this.states.objectGroups.asReadonly();
    readonly itemsState = this.states.items.asReadonly();
    readonly targetState = this.states.target.asReadonly();

    // Readyness signals
    readonly working = computed(() => Object.values(this.states).some(state => state() === WorkflowState.Loading));
    readonly classesReady = computed(() => this.classesState() === WorkflowState.Loaded);
    readonly notebooksReady = computed(() => this.notebookState() === WorkflowState.Loaded);
    readonly attributesReady = computed(() => this.attributesState() === WorkflowState.Loaded);
    readonly repositoryReady = computed(() => this.repositoryState() === WorkflowState.Loaded);

    // Error handling
    private readonly _errorMessage = signal<string | undefined>(undefined);
    readonly errorMessage = this._errorMessage.asReadonly();
    readonly errorPresent = computed(() => this.errorMessage() !== undefined);

    setState(key: WorkflowStateKey, state: WorkflowState) {
        this.states[key].set(state);
    }

    setError(message: string) {
        this._errorMessage.set(message);
    }

    clearError() {
        this._errorMessage.set(undefined);
    }

    // log the error, mark the affected workflow states as failed and show the message
    reportError(message: string, error?: unknown, ...keys: WorkflowStateKey[]) {
        if (error !== undefined) {
            console.error(error);
        }
        keys.forEach(key => this.setState(key, WorkflowState.ErrorOccured));
        this.setError(message);
    }
}
