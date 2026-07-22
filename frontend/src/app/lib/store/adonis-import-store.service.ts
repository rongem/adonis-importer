import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { firstValueFrom, catchError, of, tap } from "rxjs";
import { ApplicationStateService } from "./application-state.service";
import { AdonisStoreService } from "./adonis-store.service";
import { ImportTableService } from "./import-table.service";
import { DataAccess } from "../data-access/data-access";
import { AdonisObjectGroup } from "../models/adonis-rest/metadata/object-group.interface";
import { AdonisRepository } from "../models/adonis-rest/metadata/repository.interface";
import { ErrorList } from "../models/table/errorlist.model";
import { SucceededImports, SucceededRelations } from "../models/table/succeeded-operations.model";
import { WorkflowState } from "../enums/workflow-state.enum";
import { sortGroup } from "../helpers/group-sorter.functions";
import { ImportPlan } from "../models/table/import-plan.model";
import { Column } from "../models/table/column.model";
import { AdonisItem } from "../models/adonis-rest/read/item.interface";

@Injectable({ providedIn: 'root'})
export class AdonisImportStoreService {
    private readonly appState = inject(ApplicationStateService);
    private readonly adonisStore = inject(AdonisStoreService);
    private readonly tableStore = inject(ImportTableService);
    private readonly dataAccess = inject(DataAccess);

    // import signals
    private readonly _repositories = signal<AdonisRepository[] | undefined>(undefined);
    readonly repositories = this._repositories.asReadonly();
    private readonly _selectedRepositoryId = signal<string | undefined>(undefined);
    readonly selectedRepositoryId = this._selectedRepositoryId.asReadonly();
    private readonly _objectGroups = signal<AdonisObjectGroup | undefined>(undefined);
    readonly objectGroups = this._objectGroups.asReadonly();
    private readonly _selectedObjectGroup = signal<AdonisObjectGroup | undefined>(undefined);
    readonly selectedObjectGroup = this._selectedObjectGroup.asReadonly();

    private _columnDefinitions = signal<Column[]>([]);
    readonly columnDefinitions = this._columnDefinitions.asReadonly()
    private readonly _items = signal<AdonisItem[]>([]);
    readonly items = this._items.asReadonly();
    private readonly _importing = signal(false);
    readonly importing = this._importing.asReadonly();
    private readonly _importErrors = signal<ErrorList[]>([]);
    readonly importErrors = this._importErrors.asReadonly();
    private readonly _succeededImports = signal<SucceededImports[]>([]);
    readonly succeededImports = this._succeededImports.asReadonly();
    private readonly _succeededRelations = signal<SucceededRelations[]>([]);
    readonly succeededRelations = this._succeededRelations.asReadonly();
    readonly advancedTestingStarted = signal(false);
    private readonly _canImport = signal(false);
    readonly canImport = this._canImport.asReadonly();
    private readonly _previewPlan = signal<ImportPlan | undefined>(undefined);
    readonly previewPlan = this._previewPlan.asReadonly();

    // computed signals
    readonly sortedRepositories = computed(() => {
        const repos = this.repositories();
        if (!repos || repos.length === 0) return [];
        return repos.slice().sort((a, b) => a.name > b.name ? 1 : -1);
    });
    readonly selectedRepository = computed(() => {
        const repoId = this.selectedRepositoryId();
        if (!repoId || !this.repositories()) return undefined;
        return this.repositories()!.find(r => r.id === repoId);
    });
    readonly rowsWithExistingItems = computed(() => {
        const itemNames = this.items().map(item => item.name);
        const primaryColumnIndex = this.tableStore.columnDefinitions().findIndex(column => column.primary);
        const cellsInPrimaryColumn = this.tableStore.cellInformations().filter(cell => cell.column === primaryColumnIndex);
        return cellsInPrimaryColumn.filter(cell => itemNames.includes(cell.value)).map(cell => cell.row);
    });
    readonly importedRelationsForRow = (row: number) => {
        return computed(() => this.succeededRelations().filter(r => r.rowNumber === row));
    };
    readonly importErrorsForRow = (row: number) => computed(() => {
        return this.importErrors().filter(e => e.row === row);
    });

    // load repositories from ADONIS. If only one repository is accessible, select it directly.
    async loadRepositories() {
        const baseUrl = this.adonisStore.restBaseUrl();
        if (!baseUrl) {
            this.appState.repositoryState.set(WorkflowState.ErrorOccured);
            this.appState.errorMessage.set('Keine ADONIS-Verbindung vorhanden. Bitte zuerst anmelden.');
            return;
        }
        this.appState.repositoryState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveRepositories(baseUrl).pipe(
            tap((repositoryList) => {
                this.appState.repositoryState.set(WorkflowState.Loaded);
                this._repositories.set(repositoryList.repos);
                if (repositoryList.repos.length === 1) {
                    this.selectRepository(repositoryList.repos[0].id);
                }
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.repositoryState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Repositories: ${error.message}`);
                return of({} as AdonisRepository);
            }),
        ));
    }

    // select repository and load object groups
    selectRepository(repositoryId: string) {
        this._selectedRepositoryId.set(repositoryId);
        this.loadObjectGroups();
    }

    // load object groups for selected repository
    private async loadObjectGroups() {
        const context = this.getImportContext();
        if (!context) {
            return;
        }
        this.appState.objectGroupsState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveObjectGroupStructure(context.baseUrl, context.repositoryId).pipe(
            tap((objectGroupList) => {
                this._objectGroups.set(sortGroup(objectGroupList).group);
                this.appState.objectGroupsState.set(WorkflowState.Loaded);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.objectGroupsState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Objektgruppen: ${error.message}`);
                return of({} as AdonisObjectGroup[]);
            }),
        ));
    }

    // select object group for import
    selectObjectGroup(objectGroup: AdonisObjectGroup) {
        this._selectedObjectGroup.set(objectGroup);
    }

    setItems(items: AdonisItem[]) {
        this._items.set(items);
    }

    setAdvancedTestingStarted(value: boolean) {
        this.advancedTestingStarted.set(value);
    }

    setCanImport(value: boolean) {
        this._canImport.set(value);
    }

    setPreviewPlan(plan: ImportPlan) {
        this._previewPlan.set(plan);
    }

    beginImport() {
        this._importing.set(true);
        this._importErrors.set([]);
        this._succeededImports.set([]);
        this._succeededRelations.set([]);
    }

    finishImport(entries: SucceededImports[], errors: ErrorList[], relations: SucceededRelations[]) {
        this._succeededImports.set(entries);
        this._importErrors.set(errors);
        this._succeededRelations.set(relations);
        this._importing.set(false);
    }

    failImport(errors: ErrorList[]) {
        this._importErrors.set(errors);
        this._importing.set(false);
    }

    private getImportContext() {
        const baseUrl = this.adonisStore.restBaseUrl();
        const repositoryId = this.selectedRepositoryId();
        if (!baseUrl || !repositoryId) {
            this.appState.errorMessage.set('Import-Kontext unvollständig. Bitte Verbindung und Repository prüfen.');
            this.appState.targetState.set(WorkflowState.ErrorOccured);
            return undefined;
        }
        return { baseUrl, repositoryId };
    }
}