import { computed, Injectable, signal } from "@angular/core";
import { WorkflowState } from "../enums/workflow-state.enum";

@Injectable({ providedIn: 'root' })
export class ApplicationStateService {
    // Workflow states
    readonly classesState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly notebookState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly attributesState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly repositoryState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly objectGroupsState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly itemsState = signal<WorkflowState>(WorkflowState.NotPresent);
    readonly targetState = signal<WorkflowState>(WorkflowState.NotPresent);

    // Readyness signals
    readonly working = computed(() =>
        this.classesState() === WorkflowState.Loading ||
        this.notebookState() === WorkflowState.Loading ||
        this.attributesState() === WorkflowState.Loading ||
        this.repositoryState() === WorkflowState.Loading ||
        this.objectGroupsState() === WorkflowState.Loading ||
        this.itemsState() === WorkflowState.Loading ||
        this.targetState() === WorkflowState.Loading
    );
    readonly classesReady = computed(() => this.classesState() === WorkflowState.Loaded);
    readonly notebooksReady = computed(() => this.notebookState() === WorkflowState.Loaded);
    readonly attributesReady = computed(() => this.attributesState() === WorkflowState.Loaded);
    readonly repositoryReady = computed(() => this.repositoryState() === WorkflowState.Loaded);
    readonly objectGroupReady = computed(() => this.objectGroupsState() === WorkflowState.Loaded);
    readonly itemReady = computed(() => this.itemsState() === WorkflowState.Loaded);
    readonly targetReady = computed(() => this.targetState() === WorkflowState.Loaded);

    // Error handling
    readonly errorMessage = signal<string | undefined>(undefined);
    readonly errorPresent = computed(() => this.errorMessage() !== undefined);

}