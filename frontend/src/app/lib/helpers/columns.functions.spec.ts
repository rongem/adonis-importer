import { describe, expect, it } from 'vitest';

import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { createColumnsFromProperties, isValidEnumValue } from './columns.functions';

const property = (id: string, metaName: string, ctrlType: string, type = 'ATTRDEF') =>
  ({ id, metaName, type, ctrlType, properties: {}, targetId: 'x', displayNames: { de: metaName } }) as unknown as AttributeOrRelation;

const attributes = {
  'a-status': { id: 'a-status', constraints: { de: 'offen@fertig' } },
  'a-tags': { id: 'a-tags', constraints: { de: 'x@y@z' } },
} as unknown as AdonisAttributeContainer;

describe('createColumnsFromProperties', () => {
  const columns = createColumnsFromProperties([
    property('a-name', 'NAME', 'STRING'),
    property('a-count', 'A_COUNT', 'INTEGER'),
    property('r-owner', 'R_OWNER', 'RELATIONS', 'RELATIONS'),
    property('a-status', 'A_STATUS', 'ENUM'),
    property('a-tags', 'A_TAGS', 'ENUM_LIST'),
  ], attributes);

  it('creates columns for attributes only', () => {
    expect(columns.map(c => c.internalName)).toEqual(['NAME', 'A_COUNT', 'A_STATUS', 'A_TAGS']);
  });

  it('makes only the name mandatory', () => {
    expect(columns.map(c => [c.internalName, c.primary, c.isNullable])).toEqual([
      ['NAME', true, false],
      ['A_COUNT', false, true],
      ['A_STATUS', false, true],
      ['A_TAGS', false, true],
    ]);
  });

  it('marks enum lists as multi value enumerations', () => {
    expect(columns[2].enumData).toEqual({ values: ['offen', 'fertig'], aliases: ['v0', 'v1'], multiple: false });
    expect(columns[3].enumData).toEqual({ values: ['x', 'y', 'z'], aliases: ['v0', 'v1', 'v2'], multiple: true });
  });
});

describe('isValidEnumValue', () => {
  const single = { values: ['offen', 'fertig'], aliases: [], multiple: false };
  const multiple = { values: ['x', 'y', 'z'], aliases: [], multiple: true };

  it('accepts exactly one allowed value for single value enumerations', () => {
    expect(isValidEnumValue(single, 'offen')).toBe(true);
    expect(isValidEnumValue(single, 'unbekannt')).toBe(false);
    expect(isValidEnumValue(single, 'offen@fertig')).toBe(false);
  });

  it('accepts several allowed values separated by @ for enum lists', () => {
    expect(isValidEnumValue(multiple, 'x')).toBe(true);
    expect(isValidEnumValue(multiple, 'x@z')).toBe(true);
    expect(isValidEnumValue(multiple, 'x@unbekannt')).toBe(false);
  });
});
