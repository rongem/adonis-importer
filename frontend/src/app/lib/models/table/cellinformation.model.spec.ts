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

  it('reports invalid dates', () => {
    const cell = dateCell('kein Datum');

    expect(cell.dateValue).toBeUndefined();
    expect(cell.errors).toContain('Nur Datumswerte erlaubt');
  });
});
