import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';

import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { createXML, getTimeZoneOffset } from './xml.function';

const adonisClass = { id: 'c1', metaName: 'C_APPLICATION', displayNames: { de: 'Anwendungen' } } as AdonisClass;

const property = (id: string, metaName: string, ctrlType: string) =>
  ({ id, metaName, type: 'ATTRDEF', ctrlType, properties: {}, targetId: 'x', displayNames: { de: metaName } }) as unknown as AttributeOrRelation;

const relation = (incoming: boolean) => ({
  ...property('r-owner', 'R_OWNER', 'RELATIONS'),
  type: 'RELATIONS',
  incoming,
  relClass: { incoming: !incoming, targetInformations: [{ id: 't', metaName: 'C_PERFORMER', type: 0 }] },
}) as unknown as AttributeOrRelation;

const attributes = {
  'a-status': { id: 'a-status', constraints: { de: 'offen@fertig' } },
} as unknown as AdonisAttributeContainer;

const parseAttributes = (xml: string) => {
  const parsed = new XMLParser({ ignoreAttributes: false, isArray: name => name === 'attribute' }).parse(xml);
  return parsed.adoxx.conf.sheet.attribute as Record<string, string>[];
};

describe('createXML', () => {
  it('creates well-formed XML with one attribute per property and column', () => {
    const xml = createXML(adonisClass, [property('a-name', 'NAME', 'STRING'), property('a-status', 'A_STATUS', 'ENUM')], attributes);

    expect(XMLValidator.validate(xml)).toBe(true);
    const sheetAttributes = parseAttributes(xml);
    expect(sheetAttributes.map(a => [a['@_name'], a['@_column'], a['@_type']])).toEqual([
      ['NAME', '1', 'simple'],
      ['A_STATUS', '2', 'enum'],
    ]);
  });

  it('writes the bool mapping as attribute', () => {
    const [boolAttribute] = parseAttributes(createXML(adonisClass, [property('a-need', 'A_NEED_FOR_ACTION', 'BOOL')], attributes));

    expect(boolAttribute['@_type']).toBe('bool');
    expect(boolAttribute['@_bool_mapping']).toBe('ja,nein');
  });

  it('uses the same separator for enum lists as the Excel template', () => {
    const [enumList] = parseAttributes(createXML(adonisClass, [property('a-status', 'A_STATUS', 'ENUM_LIST')], attributes));

    expect(enumList['@_type']).toBe('enum_list');
    expect(enumList['@_separator']).toBe('@');
    expect(enumList['@_domain_mapping']).toBe('offen|v0|fertig|v1');
    expect(enumList['@_separator_domain_mapping']).toBe('|');
  });

  it('splits the time zone offset into hours and minutes with the same sign', () => {
    const offset = (timezoneOffset: number) => {
      const result = getTimeZoneOffset({ getTimezoneOffset: () => timezoneOffset } as Date);
      return [result['@_utc_offset_hours'], result['@_utc_offset_minutes']];
    };

    expect(offset(0)).toEqual(['0', '0']);
    expect(offset(-60)).toEqual(['1', '0']);     // CET
    expect(offset(-120)).toEqual(['2', '0']);    // CEST
    expect(offset(-330)).toEqual(['5', '30']);   // India
    expect(offset(300)).toEqual(['-5', '0']);    // New York
    expect(offset(210)).toEqual(['-3', '-30']);  // Newfoundland
  });

  it('derives the relation direction from the property', () => {
    expect(parseAttributes(createXML(adonisClass, [relation(true)], attributes))[0]['@_direction']).toBe('FROM');
    expect(parseAttributes(createXML(adonisClass, [relation(false)], attributes))[0]['@_direction']).toBe('TO');
  });
});
