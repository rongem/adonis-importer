import { describe, expect, it } from 'vitest';

import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { createXLFile, xlFileName } from './xlsx.functions';
import { readZipText } from './zip-reader.testing';

const adonisClass = { id: 'c1', metaName: 'C_PROCESS', displayNames: { de: 'Prozess' } } as AdonisClass;

const property = (id: string, metaName: string, ctrlType: string, displayName: string) =>
  ({ id, metaName, type: 'ATTRDEF', ctrlType, properties: {}, targetId: 'x', displayNames: { de: displayName } }) as unknown as AttributeOrRelation;

const attribute = (id: string, constraints: string) => ({ id, constraints: { de: constraints } });

const properties = [
  property('a-name', 'NAME', 'STRING', 'Name'),
  property('a-status', 'A_STATUS', 'ENUM', 'Status'),
  property('a-tags', 'A_TAGS', 'ENUM_LIST', 'Schlagworte'),
  property('a-active', 'A_ACTIVE', 'BOOL', 'Aktiv'),
  property('a-date', 'A_DATE', 'DATE', 'Datum'),
  {
    ...property('r-owner', 'R_OWNER', 'RELATIONS', 'Verantwortlich'),
    type: 'RELATIONS',
    incoming: false,
    relClass: { incoming: true, targetInformations: [{ id: 't', metaName: 'C_PERFORMER', type: 0 }] },
  } as unknown as AttributeOrRelation,
];

const attributes = {
  'a-status': attribute('a-status', 'offen@fertig'),
  'a-tags': attribute('a-tags', 'x@y@z'),
} as unknown as AdonisAttributeContainer;

describe('createXLFile', () => {
  const sheetXml = () => readZipText(createXLFile(adonisClass, properties, attributes), 'xl/worksheets/sheet1.xml');

  it('creates one header column per property', () => {
    const xml = sheetXml();
    ['Name', 'Status', 'Schlagworte', 'Aktiv', 'Datum', 'Verantwortlich -&gt; C_PERFORMER'].forEach(header => {
      expect(xml).toContain(`<t xml:space="preserve">${header}</t>`);
    });
  });

  it('fills the example row with matching demo values', () => {
    const xml = sheetXml();
    expect(xml).toContain('<c r="A2" t="inlineStr"><is><t xml:space="preserve">Test</t></is></c>');
    expect(xml).toContain('<c r="B2" t="inlineStr"><is><t xml:space="preserve">offen</t></is></c>');
    expect(xml).toContain('<c r="C2" t="inlineStr"><is><t xml:space="preserve">x@y@z</t></is></c>');
    expect(xml).toContain('<c r="D2" t="inlineStr"><is><t xml:space="preserve">ja</t></is></c>');
    expect(xml).toMatch(/<c r="E2" s="2"><v>\d+(\.\d+)?<\/v><\/c>/);
    expect(xml).toContain('<t xml:space="preserve">Objekt-Test</t>');
  });

  it('offers dropdowns for single value enums and booleans', () => {
    const zip = createXLFile(adonisClass, properties, attributes);
    const xml = readZipText(zip, 'xl/worksheets/sheet1.xml');
    expect(xml).toContain('<dataValidations count="2">');
    expect(xml).toContain(`sqref="B2:B1048576"><formula1>'Wertelisten'!$A$1:$A$2</formula1>`);
    expect(xml).toContain(`sqref="D2:D1048576"><formula1>'Wertelisten'!$B$1:$B$2</formula1>`);
    expect(xml).not.toContain('sqref="C2:C1048576"');
    const listXml = readZipText(zip, 'xl/worksheets/sheet2.xml');
    expect(listXml).toContain('<c r="A2" t="inlineStr"><is><t xml:space="preserve">fertig</t></is></c>');
    expect(listXml).toContain('<c r="B2" t="inlineStr"><is><t xml:space="preserve">nein</t></is></c>');
  });

  it('shows the relation direction from the property', () => {
    const incomingRelation = { ...properties[5], incoming: true } as unknown as AttributeOrRelation;
    const xml = readZipText(createXLFile(adonisClass, [incomingRelation], attributes), 'xl/worksheets/sheet1.xml');
    expect(xml).toContain('<t xml:space="preserve">Verantwortlich &lt;- C_PERFORMER</t>');
  });

  it('names the sheet and file after the class', () => {
    expect(readZipText(createXLFile(adonisClass, properties, attributes), 'xl/workbook.xml')).toContain('<sheet name="Prozess" sheetId="1" r:id="rId1"/>');
    expect(xlFileName(adonisClass)).toBe('Import Prozess.xlsx');
  });
});
