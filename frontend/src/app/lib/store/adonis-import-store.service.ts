import { computed, inject, Injectable, signal } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { firstValueFrom, catchError, of, tap, map } from "rxjs";
import { ApplicationStateService } from "./application-state.service";
import { ImportTableService } from "./import-table.serivce";
import { AdonisStoreService } from "./adonis-store.service";
import { DataAccess } from "../data-access/data-access";
import { AdonisObjectGroup } from "../models/adonis-rest/metadata/object-group.interface";
import { AdonisRepository } from "../models/adonis-rest/metadata/repository.interface";
import { ErrorList } from "../models/table/errorlist.model";
import { SucceededImports, SucceededRelations } from "../models/table/succeeded-operations.model";
import { WorkflowState } from "../enums/workflow-state.enum";
import { sortGroup } from "../helpers/group-sorter.functions";
import * as Constants from '../string.constants';
import { AdonisQuery } from "../models/adonis-rest/search/query.interface";
import { RelationTargets, RelationTargetsContainer } from "../models/table/relationtargets.model";
import { Column } from "../models/table/column.model";
import { AdonisItem } from "../models/adonis-rest/read/item.interface";
import { RelationOperation, RowOperation } from "../models/table/row-operations.model";
import { idToUrl } from "../helpers/url.functions";
import { CreateObjectResponse } from "../models/adonis-rest/write/object-response.interface";

@Injectable({ providedIn: 'root'})
export class AdonisImportStoreService {
    private readonly appState = inject(ApplicationStateService);
    private readonly tableStore = inject(ImportTableService);
    private readonly adonisStore = inject(AdonisStoreService);
    private readonly router = inject(Router);
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
    private readonly _relationTargets = signal<RelationTargetsContainer>({})
    readonly relationTargets = this._relationTargets.asReadonly();
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
        const columnDefinitions = this.tableStore.columnDefinitions();
        const itemNames = this.items().map(i => i.name);
        const primaryColumn = columnDefinitions.findIndex(c => c.primary);
        const cellsInPrimaryColumn = this.tableStore.cellInformations().filter(c => c.column === primaryColumn);
        const retVal = cellsInPrimaryColumn.filter(c => itemNames.includes(c.value)).map(c => c.row);
        return retVal;
    });
    readonly importedRelationsForRow = (row: number) => {
        return computed(() => this.succeededRelations().filter(r => r.rowNumber === row));
    };
    readonly importErrorsForRow = (row: number) => computed(() => {
        return this.importErrors().filter(e => e.row === row);
    });

    // load repositories from ADONIS. If only one repository is accessible, select it directly.
    async loadRepositories() {
        this.appState.repositoryState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveRepositories().pipe(
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
        this.dataAccess.repoId = repositoryId;
        this.loadObjectGroups();
    }

    // load object groups for selected repository
    private async loadObjectGroups() {
        this.appState.objectGroupsState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveObjectGroupStructure().pipe(
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
        this.router.navigate([Constants.import_url]);
    }

    // test if primary key values exist in backend
    async testPrimaryInBackend() {
        this.router.navigate([Constants.import_test_url]);
        this.advancedTestingStarted.set(true);
        this.appState.itemsState.set(WorkflowState.Loading);
        const rows = this.tableStore.rows();
        const columns = this.tableStore.columnDefinitions();
        const primaryColumn = this.tableStore.primaryColumn()!;
        const selectedClass = this.adonisStore.selectedClass()!;
        // first, collect all existing primary key values from the backend
        const query: AdonisQuery = {
            filters: [{
                className: selectedClass.metaName,
            }, {
                attrName: Constants.NAME,
                op: 'OP_EQ',
                values: rows.map(r => r[primaryColumn.internalName]!.toString())
            }]
        };
        const queryString = encodeURIComponent(JSON.stringify(query));
        const items = await firstValueFrom(this.dataAccess.retrieveSearchObjects(queryString))
            .catch((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.itemsState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Überprüfen der Primärschlüssel: ${error.message}`);
                return [];
            });
        this.primaryItemsLoaded(items);

        // next, check all related values in the table against the existing items
        this.appState.targetState.set(WorkflowState.Loading);
        const relationColumns = columns.filter(c => c.relation);
        if (relationColumns.length > 0) {
            const relationPromises: Promise<RelationTargets>[] = [];
            const queries = relationColumns.map((c, i) => {
                const querystring = encodeURIComponent(JSON.stringify({
                    filters: [{
                        className: c.property.relation!.relClass.targetInformations[0].metaName,
                    }, {
                        attrName: Constants.NAME,
                        op: 'OP_EQ',
                        values: rows.map(r => r[c.internalName]?.toString()).filter(v => !!v),
                    }]
                }));
                const index = columns.indexOf(c);
                relationPromises.push(firstValueFrom(this.dataAccess.searchObjects(querystring))
                    .then(searchResult => ({column: relationColumns[i], index, items:searchResult.items} as RelationTargets))
                    .catch((error: HttpErrorResponse) => {
                        console.error(error);
                        return {column: relationColumns[i], index, errorMessage: error.message} as RelationTargets;
                    }),
                );
            });
            const relationTargets = await Promise.all(relationPromises);
            const queryContainer: RelationTargetsContainer = {};
            relationTargets.forEach(r => {
                queryContainer[r.index] = r;
            });
            this.prepareColumnDefinitions(queryContainer);
            this._relationTargets.set(queryContainer);
        }
        this.appState.targetState.set(WorkflowState.Loaded);
        this._canImport.set(true);
    }

    // primary items have been loaded from backend
    private primaryItemsLoaded(items: AdonisItem[]) {
        this._items.set(items);
        this.appState.itemsState.set(WorkflowState.Loaded);
    }

    private prepareColumnDefinitions(relationTargets: RelationTargetsContainer) {
        const columnDefs = this.tableStore.columnDefinitions().map((c, i) => (
            {
                ...c,
                property: {
                    ...c.property,
                    relationTargets: relationTargets[i] ? relationTargets[i].items : undefined,
                }
            }
        ));
        this._columnDefinitions.set(columnDefs);
    }

    async importItems(rowOperations: RowOperation[]) {
        this._importing.set(true);
        this.router.navigate([Constants.import_results_url]);
        let errors: ErrorList[];
        const creationAndEditAttributeOperations = this.createOrEditItems(rowOperations);
        const operations = await Promise.all(creationAndEditAttributeOperations);
        errors = operations.filter(o => !!o.error).map(o => ({ row: o.rowNumber, msg: o.error!.status === 403 ? 'Keine Schreibrechte' : o.error!.message}));
        const succeededOperations = operations.filter(o => !o.error);
        const entries: SucceededImports[] = succeededOperations.map(o => ({
            rowNumber: o.rowNumber,
            id: o.importedObject!.item.id,
            class: o.importedObject!.item.metaName,
            className: o.importedObject!.item.type ?? '',
            name: o.importedObject!.item.name,
            attributes: o.importedObject!.item.attributes.map(a => ({name: a.metaName, value: a.value})),
            edited: !!o.editObject && !!o.importedObject!.item.groupId,
            created: !!o.createObject,
        }));
        return {
            succeededOperations,
            entries,
            errors,
        };
    }

    private createOrEditItems(rowOperations: RowOperation[]) {
        const creationAndEditAttributeOperations: Promise<RowOperation>[] = [];
        rowOperations.forEach(op => {
            if (op.createObject) {
                creationAndEditAttributeOperations.push(
                    firstValueFrom(this.dataAccess.createObject(op.createObject).pipe(
                        map(importedObject => ({ ...op, importedObject })),
                        catchError((error: HttpErrorResponse) => of({ ...op, error }))
                    ))
                );
            } else {
                // only change attributes that need to be changed
                if (op.editObject!.attributes.length > 0) {
                    creationAndEditAttributeOperations.push(
                        firstValueFrom(this.dataAccess.editObject(op.editObject!, op.editObjectId!).pipe(
                            map(importedObject => ({ ...op, importedObject })),
                            catchError((error: HttpErrorResponse) => of({ ...op, error }))
                        ))
                    );
                }
            }
        });
        return creationAndEditAttributeOperations;

    }
}