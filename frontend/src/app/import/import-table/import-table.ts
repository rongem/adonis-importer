import { Component, ElementRef, HostListener, OnDestroy, OnInit, viewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription, firstValueFrom, map, tap, withLatestFrom } from 'rxjs';

import * as StoreSelectors from '../../lib/store/store.selectors';
import * as StoreActions from '../../lib/store/store.actions';
import { getTableContentFromClipboard } from '../../lib/helpers/clipboard.functions';
import { CellContent } from '../../lib/models/table/cellcontent.model';
import { Row } from '../../lib/models/table/row.model';
import { CellInformation } from '../../lib/models/table/cellinformation.model';
import { RowContainer } from '../../lib/models/table/row-container.model';
import { NgClass, AsyncPipe } from '@angular/common';
import { ErrorBadge } from '../error-badge/error-badge';
import { AdonisClass } from '../../lib/models/adonis-rest/metadata/class.interface';
import { CreateObject } from '../../lib/models/adonis-rest/write/create-object.interface';
import { CreateRelation } from '../../lib/models/adonis-rest/write/create-relation.interface';
import { RowOperations } from '../../lib/models/table/row-operations.model';

@Component({
  selector: 'app-import-table',
  imports: [NgClass, ErrorBadge, AsyncPipe],
  templateUrl: './import-table.html',
  styleUrl: './import-table.scss'
})
export class ImportTable implements OnDestroy, OnInit {
  columnDefinitions = this.store.select(StoreSelectors.columnDefinitions);
  // table cells for selection
  readonly cells = viewChildren<ElementRef<HTMLTableCellElement>>('td');
  // dragging source
  sourceIndex: number | undefined;
  // index of column that dragged column is hovering on
  presumedTargetIndex: number | undefined;
  schema: string = '';
  private table: string = '';
  private subscriptions: Subscription[] = [];
  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private actions$: Actions) {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.actions$.pipe(
        ofType(StoreActions.setCellContents, StoreActions.changeColumnOrder),
        withLatestFrom(
          this.store.select(StoreSelectors.cellInformations),
          this.rowNumbers,
          this.store.select(StoreSelectors.tableContainsErrors),
          this.store.select(StoreSelectors.selectedClass),
          this.store.select(StoreSelectors.columnDefinitions)
        ),
      ).subscribe(([, cellInformations, rowNumbers, errorPresent, selectedClass, columns]) => {
        if (rowNumbers.length > 0 && selectedClass) {
          const rows: Row[] = this.createRows(cellInformations, rowNumbers);
          this.store.dispatch(StoreActions.testRows({content: {rows, selectedClass, columns}}));
        }
      })
    );
  }

  private createRows(cellInformations: CellInformation[], rowNumbers: number[]) {
    const rows: Row[] = [];
    for (let rowNumber of rowNumbers) {
      const cells = cellInformations.filter(c => c.row === rowNumber);
      rows[rowNumber] = {};
      for (let cell of cells) {
        if (!!cell.typedValue || !cell.canBeEmpty) {
          rows[rowNumber][cell.name] = cell.typedValue;
        }
      }
    }
    return rows;
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }

  getColumn = (columnIndex: number) => this.store.select(StoreSelectors.columnDefinition(columnIndex));

  getCellInformation = (rowIndex: number, columIndex: number) =>
    this.store.select(StoreSelectors.cellInformation(rowIndex, columIndex));

  getColumnTitle = (columnPosition: number) => this.getColumn(columnPosition).pipe(
    map(column => {
      const content: string[] = [column!.internalName];
      if (column?.primary) {
        content.push(`Primäerschlüssel`);
      }
      if (column?.relation) {
        content.push(`Verweis auf Objekt`);
      }
      if (column?.unique) {
        content.push(`Muss eindeutig sein`);
      }
      if (column?.hasDefaultValue) {
        content.push(`Standardwert vorhanden`);
      }
      if (column?.isNullable) {
        content.push(`Fehlende Werte erlaubt`);
      }
      content.push(`Erlaubte Datentypen: ` + column?.allowedTypes.join(`|`));
      return content.join(`, `);
    })
  );

  getRowContainsErrors = (rowIndex: number) => this.store.select(StoreSelectors.rowContainsErrors(rowIndex));

  getRowErrorDescriptions = (rowIndex: number) => this.store.select(StoreSelectors.rowErrors(rowIndex)).pipe(map(errors => errors.join('; ')));

  getCellRowErrors = (rowIndex: number, columnIndex: number) => this.store.select(StoreSelectors.columnContainsRowError(rowIndex, columnIndex));
  getCellContainsRowErrors = (rowIndex: number, columnIndex: number) => this.getCellRowErrors(rowIndex, columnIndex).pipe(map(e => e.length > 0));
  getCellErrorMessages = (rowIndex: number, columIndex: number) => this.getCellRowErrors(rowIndex, columIndex).pipe(
    withLatestFrom(this.getCellInformation(rowIndex, columIndex)),
    map(([cellErrors, cellinformation]) => [...cellErrors, cellinformation?.errorText].join(';')),
  );

  // columns for drag and drop column order change
  get columnMappings() { return this.store.select(StoreSelectors.columnMappings) };

  get tableContainsErrors() { return this.store.select(StoreSelectors.tableContainsErrors); }

  get rowNumbers() {
    return this.store.select(StoreSelectors.rowNumbers);
  }

  get rowCount() {
    return this.rowNumbers.pipe(map(r => r.length));
  }

  nameExists = (rowNumber: number) => this.store.select(StoreSelectors.rowsWithExistingItems).pipe(map(rows => rows.includes(rowNumber)));

  get canImport() {
    return this.store.select(StoreSelectors.canImport);
  }

  get importedRows() {
    return this.store.select(StoreSelectors.importedRows);
  }
  
  @HostListener('window:paste', ['$event'])
  async onPaste(event: ClipboardEvent) {
    event.stopPropagation();
    try {
      if (event.clipboardData) {
        const rows = getTableContentFromClipboard(event.clipboardData);
        const columnMappings = await firstValueFrom(this.columnMappings);
        this.fitRowWidth(rows, columnMappings);
        this.fillCellContents(rows);
      }
    } catch (error: any) {
      console.error(error.message);
      console.error(error.toString());
      this.store.dispatch(StoreActions.setError({error: error.message ?? error.toString()}));
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
      this.store.dispatch(StoreActions.setCellContents({contents}));
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

  async onDrop(targetIndex: number) {
    if (this.sourceIndex !== undefined) {
      const columnMappings = (await firstValueFrom(this.columnMappings)).slice();
      // remove source index
      const val = columnMappings.splice(this.sourceIndex, 1)[0];
      // put it into new place
      columnMappings.splice(targetIndex, 0, val);
      this.store.dispatch(StoreActions.changeColumnOrder({columnMappings}));
    }
    // clean up temporary variables
    this.presumedTargetIndex = undefined;
    this.sourceIndex = undefined;
  }

  async onImport() {
    const cellInformations = await firstValueFrom(this.store.select(StoreSelectors.cellInformations));
    const rowNumbers = await firstValueFrom(this.store.select(StoreSelectors.rowNumbers));
    const selectedClass = (await firstValueFrom(this.store.select(StoreSelectors.selectedClass)))!;
    const selectedObjectGroup = (await firstValueFrom(this.store.select(StoreSelectors.selectedObjectGroup)))!;
    const rowOperations: RowOperations[] = this.createRowsForBackend(cellInformations, rowNumbers, selectedClass, selectedObjectGroup.id);
    console.log(rowOperations);
    this.store.dispatch(StoreActions.importRowsInBackend({rowOperations}));
  }

  private createRowsForBackend(cellInformations: CellInformation[], rowNumbers: number[], selectedClass: AdonisClass, groupId: string) {
    const rows: RowOperations[] = [];
    for (let rowNumber of rowNumbers) {
      const cells = cellInformations.filter(c => c.row === rowNumber);
      const nameCell = cells.find(c => c.isPrimary)!;
      const attributeCells = cells.filter(c => !c.isPrimary && !c.isRelation);
      const relationCells = cells.filter(c => c.isRelation);
      const createObject: CreateObject = {
        metaName: selectedClass.metaName,
        name: nameCell.value,
        groupId,
        attributes: attributeCells.map(a => ({
          metaName: a.name,
          value: a.value,
        })),
      };
      const createRelations: CreateRelation[] = relationCells.map(c => ({}));
      rows[rowNumber] = {
        createObject,
        createRelations,
      };
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
