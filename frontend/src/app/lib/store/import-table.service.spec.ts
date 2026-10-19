import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { CellContent } from '../models/table/cellcontent.model';
import { Column } from '../models/table/column.model';
import { ImportTableService } from './import-table.service';

const column = (internalName: string, ordinalPosition: number, allowedTypes: string[], extra: Partial<Column> = {}): Column => ({
  displayName: internalName,
  internalName,
  ordinalPosition,
  hasDefaultValue: false,
  isNullable: false,
  primary: false,
  unique: false,
  allowedTypes,
  property: {},
  ...extra,
});

const nameColumn = column('NAME', 0, ['string'], { primary: true, unique: true });
const countColumn = column('A_COUNT', 1, ['number']);
const statusColumn = column('A_STATUS', 2, ['string'], { enumData: { values: ['offen', 'fertig'], aliases: ['v0', 'v1'] } });

// rows of raw strings as they come from the clipboard
const cells = (rows: string[][]) => rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => new CellContent(value, rowIndex, columnIndex)));

describe('ImportTableService', () => {
  let service: ImportTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImportTableService);
  });

  it('maps table columns to column definitions in their original order', () => {
    service.setColumnDefinitions([nameColumn, countColumn, statusColumn]);

    expect(service.columnMapping()).toEqual([0, 1, 2]);
    expect(service.primaryColumn()).toBe(nameColumn);
    expect(service.primaryColumnIndex()).toBe(0);
  });

  it('builds typed rows from cell contents', () => {
    service.setColumnDefinitions([nameColumn, countColumn, statusColumn]);
    service.setCellContents(cells([['App A', '3', 'offen'], ['App B', '7', 'fertig']]));

    expect(service.rowNumbers()).toEqual([0, 1]);
    expect(service.rows()).toEqual([
      { NAME: 'App A', A_COUNT: 3, A_STATUS: 'offen' },
      { NAME: 'App B', A_COUNT: 7, A_STATUS: 'fertig' },
    ]);
  });

  it('applies a changed column order to the pasted values', () => {
    service.setColumnDefinitions([nameColumn, countColumn]);
    service.changeColumnOrder([1, 0]);
    service.setCellContents(cells([['3', 'App A']]));

    expect(service.rows()).toEqual([{ NAME: 'App A', A_COUNT: 3 }]);
  });

  it('accepts a valid table', () => {
    service.setColumnDefinitions([nameColumn, countColumn, statusColumn]);
    service.setCellContents(cells([['App A', '3', 'offen'], ['App B', '7', 'fertig']]));
    TestBed.tick();

    expect(service.rowErrors()).toEqual([]);
    expect(service.tableContainsErrors()).toBe(false);
    expect(service.contentsAreTested()).toBe(true);
  });

  it('reports duplicate primary keys for every affected row', () => {
    service.setColumnDefinitions([nameColumn, countColumn]);
    service.setCellContents(cells([['App A', '1'], ['App B', '2'], ['App A', '3']]));
    TestBed.tick();

    expect(service.rowErrors().map(e => [e.row, e.msg, e.columnIndex])).toEqual([
      [0, 'Doppelter Primärschlüssel', 0],
      [2, 'Doppelter Primärschlüssel', 0],
    ]);
    expect(service.rowContainsErrors(1)()).toBe(false);
    expect(service.cellContainsRowError(2, 0)()).toEqual(['Doppelter Primärschlüssel']);
    expect(service.contentsAreTested()).toBe(false);
  });

  it('reports values outside of an enumeration', () => {
    service.setColumnDefinitions([nameColumn, statusColumn]);
    service.setCellContents(cells([['App A', 'unbekannt']]));
    TestBed.tick();

    expect(service.rowErrors()).toContainEqual(expect.objectContaining({ row: 0, msg: 'Wert nicht im erlaubten Bereich', columnIndex: 1 }));
    expect(service.rowContainsErrors(0)()).toBe(true);
    expect(service.contentsAreTested()).toBe(false);
  });

  it('reports cell type errors per row', () => {
    service.setColumnDefinitions([nameColumn, countColumn]);
    service.setCellContents(cells([['App A', 'drei']]));
    TestBed.tick();

    expect(service.tableContainsErrors()).toBe(true);
    expect(service.errorsInRow(0)()).toEqual(['Spalte: A_COUNT: Nur Zahlen erlaubt']);
    expect(service.contentsAreTested()).toBe(false);
  });

  it('allows empty cells in optional columns but not in the name column', () => {
    const optionalCount = column('A_COUNT', 1, ['number'], { isNullable: true });
    const optionalStatus = column('A_STATUS', 2, ['string'], { isNullable: true, enumData: statusColumn.enumData });
    service.setColumnDefinitions([nameColumn, optionalCount, optionalStatus]);
    service.setCellContents(cells([['App A', '', ''], ['', '1', 'offen']]));
    TestBed.tick();

    expect(service.rows()[0]).toEqual({ NAME: 'App A' });
    expect(service.errorsInRow(0)()).toEqual([]);
    expect(service.errorsInRow(1)()).toEqual(['Spalte: NAME: Keine leeren Zellen erlaubt.']);
  });

  it('accepts several values in enum list columns', () => {
    const tagsColumn = column('A_TAGS', 1, ['string'], { enumData: { values: ['x', 'y', 'z'], aliases: [], multiple: true } });
    service.setColumnDefinitions([nameColumn, tagsColumn]);
    service.setCellContents(cells([['App A', 'x@z'], ['App B', 'x@unbekannt']]));
    TestBed.tick();

    expect(service.rowContainsErrors(0)()).toBe(false);
    expect(service.rowContainsErrors(1)()).toBe(true);
  });

  it('reports a missing primary key column', () => {
    service.setColumnDefinitions([countColumn]);
    TestBed.tick();

    expect(service.rowErrors()).toEqual([{ msg: 'Kein Primärschlüssel definiert', row: -1, columnIndex: -1 }]);
  });

  it('resets errors and test result when new contents are pasted', () => {
    service.setColumnDefinitions([nameColumn, countColumn]);
    service.setCellContents(cells([['App A', '1'], ['App A', '2']]));
    TestBed.tick();
    expect(service.rowErrors().length).toBe(2);

    service.setCellContents(cells([['App A', '1']]));
    expect(service.rowErrors()).toEqual([]);
    TestBed.tick();

    expect(service.rowErrors()).toEqual([]);
    expect(service.contentsAreTested()).toBe(true);
  });
});
