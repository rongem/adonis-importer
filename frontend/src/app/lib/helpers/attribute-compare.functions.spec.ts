import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisAttributeValue } from '../models/adonis-rest/read/item.interface';
import { CellContent } from '../models/table/cellcontent.model';
import { CellInformation } from '../models/table/cellinformation.model';
import { Column } from '../models/table/column.model';
import { cellMatchesAttributeValue } from './attribute-compare.functions';

const column = (allowedTypes: string[], enumData?: Column['enumData']): Column => ({
  displayName: 'A',
  internalName: 'A_ATTR',
  ordinalPosition: 1,
  hasDefaultValue: false,
  isNullable: true,
  primary: false,
  unique: false,
  allowedTypes,
  property: {},
  enumData,
});

const columns = {
  string: column(['string']),
  number: column(['number']),
  bool: column(['boolean', 'string']),
  date: column(['date', 'string']),
  enum: column(['string'], { values: ['offen', 'fertig'], aliases: ['v0', 'v1'] }),
  enumList: column(['string'], { values: ['x', 'y', 'z'], aliases: ['v0', 'v1', 'v2'], multiple: true }),
};

const matches = (type: keyof typeof columns, cellValue: string, value: AdonisAttributeValue['value'] | undefined, noValue = false) =>
  cellMatchesAttributeValue(
    new CellInformation(new CellContent(cellValue, 0, 1), columns[type]),
    value === undefined ? undefined : { name: 'A', metaName: 'A_ATTR', attrType: '', value, noValue },
  );

describe('cellMatchesAttributeValue (German browser)', () => {
  beforeEach(() => {
    vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('de-DE');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('treats missing or empty attribute values as different', () => {
    expect(matches('string', 'Text', undefined)).toBe(false);
    expect(matches('string', 'Text', '')).toBe(false);
    expect(matches('string', 'Text', 'Text', true)).toBe(false);
  });

  it('compares texts exactly', () => {
    expect(matches('string', 'Text', 'Text')).toBe(true);
    expect(matches('string', 'Text', 'text')).toBe(false);
  });

  it('compares numbers independent of their representation', () => {
    expect(matches('number', '2', 2)).toBe(true);
    expect(matches('number', '2', '2')).toBe(true);
    expect(matches('number', '3,5', '3.5')).toBe(true);
    expect(matches('number', '3,5', '3,5')).toBe(true);
    expect(matches('number', '2', '3')).toBe(false);
  });

  it('compares booleans independent of their representation', () => {
    expect(matches('bool', 'ja', true)).toBe(true);
    expect(matches('bool', 'ja', 'true')).toBe(true);
    expect(matches('bool', 'nein', '0')).toBe(true);
    expect(matches('bool', 'nein', 'Ja')).toBe(false);
  });

  it('compares dates from timestamps, ISO and German strings', () => {
    const timestamp = new Date(2024, 0, 15).getTime();
    expect(matches('date', '15.01.2024', timestamp)).toBe(true);
    expect(matches('date', '15.01.2024', '2024-01-15')).toBe(true);
    expect(matches('date', '15.01.2024', '15.01.2024')).toBe(true);
    expect(matches('date', '2024-01-15', '15.01.2024')).toBe(true);
    expect(matches('date', '15.01.2024 12:30', '15.01.2024 12:30')).toBe(true);
    expect(matches('date', '15.01.2024', '16.01.2024')).toBe(false);
    expect(matches('date', '15.01.2024', 'kein Datum')).toBe(false);
  });

  it('compares enum values and enum lists independent of order', () => {
    expect(matches('enum', 'offen', 'offen')).toBe(true);
    expect(matches('enum', 'offen', 'fertig')).toBe(false);
    expect(matches('enumList', 'x@y', ['y', 'x'])).toBe(true);
    expect(matches('enumList', 'x@y', 'y@x')).toBe(true);
    expect(matches('enumList', 'x@y', ['x'])).toBe(false);
  });
});
