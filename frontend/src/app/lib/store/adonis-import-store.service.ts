import { computed, inject, Injectable, signal } from "@angular/core";
import { ImportTableService } from "./import-table.service";
import { AdonisObjectGroup } from "../models/adonis-rest/metadata/object-group.interface";
import { AdonisRepository } from "../models/adonis-rest/metadata/repository.interface";
import { ErrorList } from "../models/table/errorlist.model";
import { SucceededImports, SucceededRelations } from "../models/table/succeeded-operations.model";
import { ImportPlan } from "../models/table/import-plan.model";
import { AdonisItem } from "../models/adonis-rest/read/item.interface";

@Injectable({ providedIn: 'root'})
export class AdonisImportStoreService {
    private readonly tableStore = inject(ImportTableService);

    // import signals
    private readonly _repositories = signal<AdonisRepository[] | undefined>(undefined);
    readonly repositories = this._repositories.asReadonly();
    private readonly _selectedRepositoryId = signal<string | undefined>(undefined);
    readonly selectedRepositoryId = this._selectedRepositoryId.asReadonly();
    private readonly _objectGroups = signal<AdonisObjectGroup | undefined>(undefined);
    readonly objectGroups = this._objectGroups.asReadonly();
    private readonly _selectedObjectGroup = signal<AdonisObjectGroup | undefined>(undefined);
    readonly selectedObjectGroup = this._selectedObjectGroup.asReadonly();

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
    private readonly _advancedTestingStarted = signal(false);
    readonly advancedTestingStarted = this._advancedTestingStarted.asReadonly();
    private readonly _canImport = signal(false);
    readonly canImport = this._canImport.asReadonly();
    private readonly _previewPlan = signal<ImportPlan | undefined>(undefined);
    readonly previewPlan = this._previewPlan.asReadonly();

    // computed signals
    readonly sortedRepositories = computed(() => {
        const repos = this.repositories();
        if (!repos || repos.length === 0) return [];
        return repos.slice().sort((a, b) => a.name.localeCompare(b.name, 'de'));
    });
    readonly selectedRepository = computed(() => {
        const repoId = this.selectedRepositoryId();
        if (!repoId) return undefined;
        return this.repositories()?.find(r => r.id === repoId);
    });
    readonly rowsWithExistingItems = computed(() => {
        const itemNames = this.items().map(item => item.name);
        const primaryColumnIndex = this.tableStore.columnDefinitions().findIndex(column => column.primary);
        const cellsInPrimaryColumn = this.tableStore.cellInformations().filter(cell => cell.column === primaryColumnIndex);
        return cellsInPrimaryColumn.filter(cell => itemNames.includes(cell.value)).map(cell => cell.row);
    });

    // lookups; they read signals, so they are reactive when used in templates or computed signals
    importedRelationsForRow(row: number) {
        return this.succeededRelations().filter(r => r.rowNumber === row);
    }

    importErrorsForRow(row: number) {
        return this.importErrors().filter(e => e.row === row);
    }

    // methods to update signals
    setRepositories(repositories: AdonisRepository[]) {
        this._repositories.set(repositories);
    }

    // a new repository invalidates the object groups of the previous one
    selectRepository(repositoryId: string) {
        this._selectedRepositoryId.set(repositoryId);
        this._objectGroups.set(undefined);
        this._selectedObjectGroup.set(undefined);
    }

    setObjectGroups(objectGroups: AdonisObjectGroup) {
        this._objectGroups.set(objectGroups);
    }

    selectObjectGroup(objectGroup: AdonisObjectGroup) {
        this._selectedObjectGroup.set(objectGroup);
    }

    setItems(items: AdonisItem[]) {
        this._items.set(items);
    }

    setAdvancedTestingStarted(value: boolean) {
        this._advancedTestingStarted.set(value);
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
}
