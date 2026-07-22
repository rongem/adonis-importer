import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, map, of } from 'rxjs';

import { DataAccess } from '../data-access/data-access';
import { WorkflowState } from '../enums/workflow-state.enum';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisQuery } from '../models/adonis-rest/search/query.interface';
import { AdonisItem } from '../models/adonis-rest/read/item.interface';
import { CreateObject, EditObject } from '../models/adonis-rest/write/object.interface';
import { ImportExecutionResult } from '../models/table/import-execution-result.model';
import { ImportPlan, PlannedRowOperation } from '../models/table/import-plan.model';
import { ErrorList } from '../models/table/errorlist.model';
import { CellInformation } from '../models/table/cellinformation.model';
import { RowOperation } from '../models/table/row-operations.model';
import { SucceededImports } from '../models/table/succeeded-operations.model';
import { ImportTableService } from '../store/import-table.service';
import { AdonisStoreService } from '../store/adonis-store.service';
import { AdonisImportStoreService } from '../store/adonis-import-store.service';
import { ApplicationStateService } from '../store/application-state.service';
import * as Constants from '../string.constants';

const relationsUnsupportedReason = 'Relationen sind deaktiviert, weil die ADONIS-REST-API weder Kardinalitäten noch brauchbare Fehlermeldungen bereitstellt.';

@Injectable({ providedIn: 'root' })
export class AdonisImportWorkflowService {
    private readonly appState = inject(ApplicationStateService);
    private readonly tableStore = inject(ImportTableService);
    private readonly adonisStore = inject(AdonisStoreService);
    private readonly importStore = inject(AdonisImportStoreService);
    private readonly router = inject(Router);
    private readonly dataAccess = inject(DataAccess);

    async testPrimaryInBackend() {
        this.router.navigate([Constants.import_test_url]);
        this.importStore.setAdvancedTestingStarted(true);
        this.appState.itemsState.set(WorkflowState.Loading);

        const context = this.getImportContext();
        const primaryColumn = this.tableStore.primaryColumn();
        const selectedClass = this.adonisStore.selectedClass();
        if (!context || !primaryColumn || !selectedClass) {
            return;
        }

        const query: AdonisQuery = {
            filters: [{
                className: selectedClass.metaName,
            }, {
                attrName: Constants.NAME,
                op: 'OP_EQ',
                values: this.tableStore.rows().map(row => row[primaryColumn.internalName]!.toString()),
            }],
        };

        const queryString = encodeURIComponent(JSON.stringify(query));
        const items = await firstValueFrom(this.dataAccess.retrieveSearchObjects(context.baseUrl, context.repositoryId, queryString))
            .catch((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.itemsState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Überprüfen der Primärschlüssel: ${error.message}`);
                return [];
            });

        this.importStore.setItems(items);
        this.buildPreviewPlan();
        this.appState.itemsState.set(WorkflowState.Loaded);
        this.appState.targetState.set(WorkflowState.Loaded);
        this.importStore.setCanImport(true);
    }

    buildPreviewPlan() {
        const selectedClass = this.adonisStore.selectedClass();
        const selectedObjectGroup = this.importStore.selectedObjectGroup();
        if (!selectedClass || !selectedObjectGroup) return;
        const plan = this.createImportPlan(
            this.tableStore.cellInformations(),
            this.tableStore.rowNumbers(),
            selectedClass,
            selectedObjectGroup.id,
            this.importStore.items(),
        );
        this.importStore.setPreviewPlan(plan);
    }

    async importCurrentTable() {
        const selectedClass = this.adonisStore.selectedClass();
        const selectedObjectGroup = this.importStore.selectedObjectGroup();
        if (!selectedClass || !selectedObjectGroup) {
            this.appState.errorMessage.set('Import-Kontext unvollständig. Bitte Klasse und Zielordner prüfen.');
            return;
        }

        const importPlan = this.createImportPlan(
            this.tableStore.cellInformations(),
            this.tableStore.rowNumbers(),
            selectedClass,
            selectedObjectGroup.id,
            this.importStore.items(),
        );

        return this.executeImportPlan(importPlan);
    }

    async executeImportPlan(importPlan: ImportPlan): Promise<ImportExecutionResult> {
        const context = this.getImportContext();
        if (!context) {
            const errors = [{ row: 0, msg: 'Kein gültiger Import-Kontext (Verbindung/Repository) vorhanden.' }];
            this.importStore.finishImport([], errors, []);
            return {
                plan: importPlan,
                objectPhase: {
                    status: 'failed',
                    succeededOperations: [],
                    entries: [],
                    errors,
                },
                relationsPhase: importPlan.relationsPhase,
            };
        }

        return this.importItems(importPlan, context.baseUrl, context.repositoryId);
    }

    createImportPlan(cellInformations: CellInformation[], rowNumbers: number[], selectedClass: AdonisClass, groupId: string, existingItems: AdonisItem[]): ImportPlan {
        const rows: PlannedRowOperation[] = [];
        for (const rowNumber of rowNumbers) {
            const cells = cellInformations.filter(cell => cell.row === rowNumber);
            const nameCell = cells.find(cell => cell.isPrimary)!;
            const attributeCells = cells.filter(cell => !cell.isPrimary);
            const existingItem = existingItems.find(item => item.name === nameCell.stringValue);

            if (existingItem) {
                const editObject: EditObject = {
                    id: existingItem.id,
                    name: existingItem.name,
                    metaName: existingItem.metaName,
                    attributes: attributeCells
                        .filter(attributeCell => {
                            const correspondingAttribute = existingItem.attributes.find(attribute => attribute.metaName === attributeCell.name);
                            if (!correspondingAttribute) {
                                return true;
                            }
                            return correspondingAttribute.value !== attributeCell.typedValue;
                        })
                        .map(attributeCell => ({
                            metaName: attributeCell.name,
                            value: attributeCell.value,
                        })),
                };

                rows[rowNumber] = editObject.attributes.length > 0
                    ? {
                        rowNumber,
                        action: 'edit',
                        editObject,
                        editObjectId: existingItem.id,
                    }
                    : {
                        rowNumber,
                        action: 'skip',
                        skipReason: 'unchanged',
                        editObject,
                        editObjectId: existingItem.id,
                    };
                continue;
            }

            const createObject: CreateObject = {
                metaName: selectedClass.metaName,
                name: nameCell.value,
                groupId,
                attributes: attributeCells.map(attributeCell => ({
                    metaName: attributeCell.name,
                    value: attributeCell.value,
                })),
            };

            rows[rowNumber] = {
                rowNumber,
                action: 'create',
                createObject,
            };
        }

        return {
            rows,
            relationsPhase: {
                status: 'unsupported',
                reason: relationsUnsupportedReason,
            },
        };
    }

    private async importItems(importPlan: ImportPlan, baseUrl: string, repositoryId: string): Promise<ImportExecutionResult> {
        this.importStore.beginImport();
        this.router.navigate([Constants.import_results_url]);

        const executableRows = importPlan.rows.filter(row => row.action !== 'skip');
        const operations = await Promise.all(this.executeRowOperations(executableRows, baseUrl, repositoryId));
        const errors = operations
            .filter(operation => !!operation.error)
            .map(operation => ({
                row: operation.rowNumber,
                msg: operation.error!.status === 403 ? 'Keine Schreibrechte' : operation.error!.message,
            } satisfies ErrorList));

        const succeededOperations = operations.filter(operation => !operation.error);
        const entries: SucceededImports[] = succeededOperations.map(operation => ({
            rowNumber: operation.rowNumber,
            id: operation.importedObject!.item.id,
            class: operation.importedObject!.item.metaName,
            className: operation.importedObject!.item.type ?? '',
            name: operation.importedObject!.item.name,
            attributes: operation.importedObject!.item.attributes.map(attribute => ({ name: attribute.metaName, value: attribute.value })),
            edited: !!operation.editObject && !!operation.importedObject!.item.groupId,
            created: !!operation.createObject,
        }));

        this.importStore.finishImport(entries, errors, []);
        return {
            plan: importPlan,
            objectPhase: {
                status: errors.length > 0 ? 'failed' : 'completed',
                succeededOperations,
                entries,
                errors,
            },
            relationsPhase: importPlan.relationsPhase,
        };
    }

    private getImportContext() {
        const baseUrl = this.adonisStore.restBaseUrl();
        const repositoryId = this.importStore.selectedRepositoryId();
        if (!baseUrl || !repositoryId) {
            this.appState.errorMessage.set('Import-Kontext unvollständig. Bitte Verbindung und Repository prüfen.');
            this.appState.targetState.set(WorkflowState.ErrorOccured);
            return undefined;
        }
        return { baseUrl, repositoryId };
    }

    private executeRowOperations(rowOperations: PlannedRowOperation[], baseUrl: string, repositoryId: string) {
        const operations: Promise<RowOperation>[] = [];
        rowOperations.forEach(operation => {
            if (operation.createObject) {
                operations.push(
                    firstValueFrom(this.dataAccess.createObject(baseUrl, repositoryId, operation.createObject).pipe(
                        map(importedObject => ({ ...operation, importedObject })),
                        catchError((error: HttpErrorResponse) => of({ ...operation, error })),
                    )),
                );
                return;
            }

            if (operation.editObject && operation.editObject.attributes.length > 0) {
                operations.push(
                    firstValueFrom(this.dataAccess.editObject(baseUrl, repositoryId, operation.editObject, operation.editObjectId!).pipe(
                        map(importedObject => ({ ...operation, importedObject })),
                        catchError((error: HttpErrorResponse) => of({ ...operation, error })),
                    )),
                );
            }
        });
        return operations;
    }
}