import { Component, computed, ElementRef, inject, viewChildren, ChangeDetectionStrategy } from '@angular/core';

import { CellInformation } from '../../lib/models/table/cellinformation.model';
import { NgClass } from '@angular/common';
import { ErrorBadge } from '../error-badge/error-badge';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ImportTableService } from '../../lib/store/import-table.serivce';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';

@Component({
  selector: 'app-import-test-table',
  imports: [NgClass, ErrorBadge],
  templateUrl: './import-test-table.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './import-test-table.scss'
})
export class ImportTestTable {
  protected readonly state = inject(ApplicationStateService);
  protected readonly adonisStore = inject(AdonisStoreService);
  protected readonly tableStore = inject(ImportTableService);
  protected readonly adonisImportStore = inject(AdonisImportStoreService);
  protected readonly importWorkflow = inject(AdonisImportWorkflowService);

  columnDefinitions = this.tableStore.columnDefinitions();
  // table cells for selection
  protected readonly cells = viewChildren<ElementRef<HTMLTableCellElement>>('td');
  // dragging source
  protected sourceIndex: number | undefined;
  // index of column that dragged column is hovering on
  protected presumedTargetIndex: number | undefined;
  schema: string = '';

  getColumn = (columnIndex: number) => this.tableStore.columnDefinitionByOriginalPosition(columnIndex)();

  getCellInformation = (rowIndex: number, columIndex: number) => this.tableStore.cellInformation(rowIndex, columIndex)();

  getColumnTitle = (columnPosition: number) => {
    const column = this.getColumn(columnPosition);
    if (!column) return '';
    const content: string[] = [column.internalName];
    if (column.primary) {
      content.push(`Primäerschlüssel`);
    }
    if (column.unique) {
      content.push(`Muss eindeutig sein`);
    }
    if (column.hasDefaultValue) {
      content.push(`Standardwert vorhanden`);
    }
    if (column.isNullable) {
      content.push(`Fehlende Werte erlaubt`);
    }
    content.push(`Erlaubte Datentypen: ` + column.allowedTypes.join(`|`));
    return content.join(`, `);
  };

  getRowContainsErrors = (rowIndex: number) => this.tableStore.rowContainsErrors(rowIndex)();

  getRowErrorDescriptions = (rowIndex: number) => this.tableStore.errorsInRow(rowIndex)().join('; ');

  getCellRowErrors = (rowIndex: number, columnIndex: number) => this.tableStore.cellContainsRowError(rowIndex, columnIndex)();
  getCellContainsRowErrors = (rowIndex: number, columnIndex: number) => this.getCellRowErrors(rowIndex, columnIndex).length > 0;
  getCellErrorMessages = (rowIndex: number, columIndex: number) => computed(() => {
    const cellErrors = this.getCellRowErrors(rowIndex, columIndex);
    const cellinformation = this.getCellInformation(rowIndex, columIndex);
    return [...cellErrors, cellinformation?.errorText].join(';');
  });


  onImport() {
    this.importWorkflow.importCurrentTable();
  }
  /*onCellClick(event: FocusEvent) {
    let colIndex = -1;
    let rowIndex = -1;
    if (event.type === 'focus' && event.target instanceof HTMLTableCellElement) {
      colIndex = event.target.cellIndex - 1;
      rowIndex = (event.target.parentElement as HTMLTableRowElement).rowIndex -1;
    }
  }

  private getRowIndex = (cell: HTMLTableCellElement) => (cell.parentElement as HTMLTableRowElement).rowIndex;
*/

}
