import { Component, computed, ElementRef, inject, viewChildren } from '@angular/core';

import { CellInformation } from '../../lib/models/table/cellinformation.model';
import { NgClass } from '@angular/common';
import { ErrorBadge } from '../error-badge/error-badge';
import { AdonisClass } from '../../lib/models/adonis-rest/metadata/class.interface';
import { CreateObject, EditObject } from '../../lib/models/adonis-rest/write/object.interface';
import { CreateRelation } from '../../lib/models/adonis-rest/write/relation.interface';
import { RowOperation } from '../../lib/models/table/row-operations.model';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ImportTableService } from '../../lib/store/import-table.serivce';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisItem } from '../../lib/models/adonis-rest/read/item.interface';

@Component({
  selector: 'app-import-test-table',
  imports: [NgClass, ErrorBadge],
  templateUrl: './import-test-table.html',
  styleUrl: './import-test-table.scss'
})
export class ImportTestTable {
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


  onImport() {
    const rowOperations: RowOperation[] = this.createRowsForBackend(
      this.tableStore.cellInformations(),
      this.tableStore.rowNumbers(),
      this.adonisStore.selectedClass()!,
      this.adonisImportStore.selectedObjectGroup()!.id,
      this.adonisImportStore.items(),
    );
    this.adonisImportStore.importItems(rowOperations);
  }

  private createRowsForBackend(cellInformations: CellInformation[], rowNumbers: number[], selectedClass: AdonisClass, groupId: string, existingItems: AdonisItem[]) {
    const rows: RowOperation[] = [];
    for (let rowNumber of rowNumbers) {
      const cells = cellInformations.filter(c => c.row === rowNumber);
      const nameCell = cells.find(c => c.isPrimary)!;
      const attributeCells = cells.filter(c => !c.isPrimary && !c.isRelation);
      const relationCells = cells.filter(c => c.isRelation);
      const existingItem = existingItems.find(i => i.name === nameCell.stringValue);
      const createRelations: CreateRelation[] = relationCells.map(c => ({
        direction: c.relationDirection!,
        relationClass: c.relationClass!,
        relationTargetId: c.getRelationTargetByName(c.stringValue!)!.id,
      }));
      if (existingItem) {
        const editObject: EditObject = {
          id: existingItem.id,
          name: existingItem.name,
          metaName: existingItem.metaName,
          attributes: attributeCells
            .filter(a => { // filter out all attributes that don't need to be changed
              const correspondingAttribute = existingItem.attributes.find(at => at.metaName === a.name);
              if (!correspondingAttribute) return true;
              if (correspondingAttribute.value === a.typedValue) return false;
              return true;
            })
            .map(a => ({
              metaName: a.name,
              value: a.value,
            })),
        };
        rows[rowNumber] = {
          rowNumber,
          editObject,
          editObjectId: existingItem.id,
          createRelations,
        }
      } else {
        const createObject: CreateObject = {
          metaName: selectedClass.metaName,
          name: nameCell.value,
          groupId,
          attributes: attributeCells.map(a => ({
            metaName: a.name,
            value: a.value,
          })),
        };
        rows[rowNumber] = {
          rowNumber,
          createObject,
          createRelations,
        };
      }
    }
    return rows;
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
