import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ImportTableService } from '../../lib/store/import-table.service';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';

interface AttributeDiff {
    displayName: string;
    oldValue: string;
    newValue: string;
}

interface AttributeDisplay {
    displayName: string;
    value: string;
}

interface PreviewRow {
    rowNumber: number;
    action: 'create' | 'edit' | 'skip' | 'error';
    name: string;
    errorText: string;
    changedAttributes: AttributeDiff[];
    newAttributes: AttributeDisplay[];
}

@Component({
  selector: 'app-import-test-table',
  imports: [NgClass],
  templateUrl: './import-test-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './import-test-table.scss'
})
export class ImportTestTable {
  protected readonly adonisStore = inject(AdonisStoreService);
  protected readonly tableStore = inject(ImportTableService);
  protected readonly adonisImportStore = inject(AdonisImportStoreService);
  protected readonly importWorkflow = inject(AdonisImportWorkflowService);

  readonly previewRows = computed<PreviewRow[]>(() => {
    const plan = this.adonisImportStore.previewPlan();
    if (!plan) return [];
    const rowNumbers = this.tableStore.rowNumbers();
    const items = this.adonisImportStore.items();
    const columns = this.tableStore.sortedColumnDefinitions();
    const rowErrors = this.tableStore.rowErrors();
    const cellInfos = this.tableStore.cellInformations();

    const hasErrors = (rowNumber: number) =>
      rowErrors.some(e => e.row === rowNumber) ||
      cellInfos.some(c => c.row === rowNumber && c.containsErrors);

    const errorText = (rowNumber: number) =>
      [
        ...rowErrors.filter(e => e.row === rowNumber).map(e => e.msg),
        ...cellInfos.filter(c => c.row === rowNumber && c.containsErrors).map(c => `${c.name}: ${c.errorText}`),
      ].join('; ');

    return rowNumbers.map(rowNumber => {
      if (hasErrors(rowNumber)) {
        const primaryCell = cellInfos.find(c => c.row === rowNumber && c.isPrimary);
        return {
          rowNumber,
          action: 'error' as const,
          name: primaryCell?.value ?? `Zeile ${rowNumber}`,
          errorText: errorText(rowNumber),
          changedAttributes: [],
          newAttributes: [],
        };
      }

      const planned = plan.rows[rowNumber];
      if (!planned) {
        return { rowNumber, action: 'error' as const, name: `Zeile ${rowNumber}`, errorText: 'Kein Plan-Eintrag gefunden.', changedAttributes: [], newAttributes: [] };
      }

      if (planned.action === 'create') {
        const newAttributes = (planned.createObject?.attributes ?? [])
          .filter(a => !!a.value)
          .map(a => ({
            displayName: columns.find(c => c.internalName === a.metaName)?.displayName ?? a.metaName,
            value: String(a.value),
          }));
        return { rowNumber, action: 'create' as const, name: planned.createObject!.name, errorText: '', changedAttributes: [], newAttributes };
      }

      if (planned.action === 'edit') {
        const existingItem = items.find(i => i.id === planned.editObjectId);
        const changedAttributes = (planned.editObject?.attributes ?? []).map(a => ({
          displayName: columns.find(c => c.internalName === a.metaName)?.displayName ?? a.metaName,
          oldValue: String(existingItem?.attributes.find(ea => ea.metaName === a.metaName)?.value ?? ''),
          newValue: String(a.value),
        }));
        return { rowNumber, action: 'edit' as const, name: planned.editObject!.name, errorText: '', changedAttributes, newAttributes: [] };
      }

      return {
        rowNumber,
        action: 'skip' as const,
        name: planned.editObject?.name ?? `Zeile ${rowNumber}`,
        errorText: '',
        changedAttributes: [],
        newAttributes: [],
      };
    });
  });

  readonly summary = computed(() => {
    const rows = this.previewRows();
    return {
      create: rows.filter(r => r.action === 'create').length,
      edit:   rows.filter(r => r.action === 'edit').length,
      skip:   rows.filter(r => r.action === 'skip').length,
      error:  rows.filter(r => r.action === 'error').length,
    };
  });

  onImport() {
    this.importWorkflow.importCurrentTable();
  }
}
