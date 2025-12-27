import { Component, computed, ElementRef, HostListener, inject, viewChildren } from '@angular/core';

import { getTableContentFromClipboard } from '../../lib/helpers/clipboard.functions';
import { CellContent } from '../../lib/models/table/cellcontent.model';
import { NgClass } from '@angular/common';
import { ErrorBadge } from '../error-badge/error-badge';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ImportTableService } from '../../lib/store/import-table.serivce';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';

@Component({
  selector: 'app-import-table',
  imports: [NgClass, ErrorBadge],
  templateUrl: './import-table.html',
  styleUrl: './import-table.scss'
})
export class ImportTable {
  protected readonly state = inject(ApplicationStateService);
  protected readonly adonisStore = inject(AdonisStoreService);
  protected readonly tableStore = inject(ImportTableService);
  protected readonly adonisImportStore = inject(AdonisImportStoreService);

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
    if (column.relation) {
      content.push(`Verweis auf Objekt`);
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

  // columns for drag and drop column order change

  @HostListener('window:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.stopPropagation();
    try {
      if (event.clipboardData) {
        const rows = getTableContentFromClipboard(event.clipboardData);
        const columnMappings = this.tableStore.columnMapping();
        this.fitRowWidth(rows, columnMappings);
        this.fillCellContents(rows);
      }
    } catch (error: any) {
      console.error(error.message, error.toString());
      this.state.errorMessage.set('Fehler beim Einfügen der Daten aus der Zwischenablage: ' + (error.message ?? error.toString()));
    }
  }

  private fitRowWidth(rows: string[][], columnMappings: number[]) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.length > columnMappings.length) {
        // remove columns that are out of possible insertion range
        row.splice(columnMappings.length);
      } else if (row.length < columnMappings.length) {
        // fill up row columns if not enough data has been provided
        rows[i] = row.concat(Array(columnMappings.length - row.length).fill(''));
      }
    };
  }

  private fillCellContents(rows: string[][]) {
    const contents: CellContent[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      for (let j = 0; j < row.length; j++) {
        const cellContent = new CellContent(row[j], i, j);
        contents.push(cellContent);
      }
    }
    if (contents.length > 0) {
      this.tableStore.setCellContents(contents);
    }
  }

  onDragStart(event: DragEvent, index: number) {
    // set index when starting drag&drop
    this.sourceIndex = index;
    // firefox needs this
    if (event.dataTransfer) {
      event.dataTransfer.setData('text', index.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragEnd() {
    // cancel drag&drop
    this.sourceIndex = undefined;
    this.presumedTargetIndex = undefined;
  }

  onDragOver(event: DragEvent, targetIndex: number) {
    if (this.sourceIndex !== undefined && this.sourceIndex !== targetIndex) {
      this.presumedTargetIndex = targetIndex;
      // enable drop
      event.preventDefault();
    } else {
      this.presumedTargetIndex = undefined;
    }
  }

  onDrop(targetIndex: number) {
    if (this.sourceIndex !== undefined) {
      const columnMappings = this.tableStore.columnMapping().slice();
      // remove source index
      const val = columnMappings.splice(this.sourceIndex, 1)[0];
      // put it into new place
      columnMappings.splice(targetIndex, 0, val);
      this.tableStore.changeColumnOrder(columnMappings);
    }
    // clean up temporary variables
    this.presumedTargetIndex = undefined;
    this.sourceIndex = undefined;
  }
  onStartAdvancedTesting() {
    this.adonisImportStore.testPrimaryInBackend();
  }

}
