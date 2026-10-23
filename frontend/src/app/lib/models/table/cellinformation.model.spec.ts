import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CellContent } from './cellcontent.model';
import { CellInformation } from './cellinformation.model';
import { Column } from './column.model';

const dateColumn = {
  displayName: 'Datum',
  internalName: 'A_DATE',
  ordinalPosition: 0,
  hasDefaultValue: false,
  isNullable: true,
  primary: false,
  unique: false,
  allowedTypes: ['date'],
  property: {},
} as Column;

const dateCell = (value: string) => new CellInformation(new CellContent(value, 0, 0), dateColumn);

describe('CellInformation with German browser language', () => {
  beforeEach(() => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('de-DE');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses German dates', () => {
    const cell = dateCell('15.01.2024');

    expect(cell.containsErrors).toBe(false);
    expect(cell.dateValue).toEqual(new Date(2024, 0, 15));
  });

  it('parses German dates with time', () => {
    expect(dateCell('15.01.2024 12:30').dateValue).toEqual(new Date(2024, 0, 15, 12, 30));
    expect(dateCell('15.01.2024 08:05:09').dateValue).toEqual(new Date(2024, 0, 15, 8, 5, 9));
    expect(dateCell('15.01.2024 12:30').containsErrors).toBe(false);
  });

  it('parses German numbers with thousands separators and currency signs', () => {
    const numberColumn = { ...dateColumn, allowedTypes: ['number'] } as Column;
    const numberCell = (value: string) => new CellInformation(new CellContent(value, 0, 0), numberColumn);

    expect(numberCell('3,5').numberValue).toBe(3.5);
    expect(numberCell('1.234.567,89').numberValue).toBe(1234567.89);
    expect(numberCell('12,50 €').numberValue).toBe(12.5);
    expect(numberCell('drei').errors).toEqual(['Nur Zahlen erlaubt']);
  });

  it('uses the format passed by the caller instead of the browser language', () => {
    const numberColumn = { ...dateColumn, allowedTypes: ['number'] } as Column;

    expect(new CellInformation(new CellContent('3.5', 0, 0), numberColumn, false).numberValue).toBe(3.5);
  });

  it('prefers date, boolean and number over text for the typed value', () => {
    const boolColumn = { ...dateColumn, allowedTypes: ['boolean', 'string'] } as Column;

    expect(new CellInformation(new CellContent('nein', 0, 0), boolColumn).typedValue).toBe(false);
    expect(new CellInformation(new CellContent('vielleicht', 0, 0), boolColumn).typedValue).toBe('vielleicht');
  });

  it('reports invalid dates', () => {
    const cell = dateCell('kein Datum');

    expect(cell.dateValue).toBeUndefined();
    expect(cell.errors).toContain('Nur Datumswerte erlaubt');
  });
});
