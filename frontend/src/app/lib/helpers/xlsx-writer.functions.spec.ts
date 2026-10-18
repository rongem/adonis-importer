import { XMLValidator } from 'fast-xml-parser';
import { describe, expect, it } from 'vitest';

import { columnLetter, createXlsx, sanitizeSheetName, toExcelSerialDate, XlsxSheet } from './xlsx-writer.functions';
import { readZip, readZipText } from './zip-reader.testing';

const sheet: XlsxSheet = {
  name: 'Prozess',
  columns: [
    { header: 'Name' },
    { header: 'Status', listValues: ['offen', 'in Arbeit, aktiv', 'fertig'] },
    { header: 'Gültig ab' },
    { header: 'Aktiv' },
    { header: 'Anzahl' },
  ],
  rows: [['A & <B>', 'offen', new Date(2024, 0, 15), true, 3.5]],
};

describe('xlsx writer', () => {
  it('converts column indexes to letters', () => {
    expect(columnLetter(0)).toBe('A');
    expect(columnLetter(25)).toBe('Z');
    expect(columnLetter(26)).toBe('AA');
    expect(columnLetter(701)).toBe('ZZ');
    expect(columnLetter(702)).toBe('AAA');
  });

  it('converts dates to Excel serial numbers', () => {
    expect(toExcelSerialDate(new Date(1900, 0, 1))).toBe(2);
    expect(toExcelSerialDate(new Date(2024, 0, 15))).toBe(45306);
    expect(toExcelSerialDate(new Date(2024, 0, 15, 12))).toBe(45306.5);
  });

  it('sanitizes sheet names', () => {
    expect(sanitizeSheetName('a/b:c*d?e[f]g\\h')).toBe('a_b_c_d_e_f_g_h');
    expect(sanitizeSheetName('x'.repeat(40))).toHaveLength(31);
    expect(sanitizeSheetName('')).toBe('Tabelle1');
    expect(sanitizeSheetName("'quoted'")).toBe('quoted');
  });

  it('writes all package parts as well-formed XML', () => {
    const entries = readZip(createXlsx(sheet));
    expect([...entries.keys()].sort()).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'xl/_rels/workbook.xml.rels',
      'xl/styles.xml',
      'xl/workbook.xml',
      'xl/worksheets/sheet1.xml',
      'xl/worksheets/sheet2.xml',
    ]);
    for (const entry of entries.values()) {
      expect(XMLValidator.validate(new TextDecoder().decode(entry.data)), entry.path).toBe(true);
    }
  });

  it('writes typed cells with escaped text', () => {
    const xml = readZipText(createXlsx(sheet), 'xl/worksheets/sheet1.xml');
    expect(xml).toContain('<c r="A1" t="inlineStr" s="1"><is><t xml:space="preserve">Name</t></is></c>');
    expect(xml).toContain('<t xml:space="preserve">A &amp; &lt;B&gt;</t>');
    expect(xml).toContain('<c r="C2" s="2"><v>45306</v></c>');
    expect(xml).toContain('<c r="D2" t="b"><v>1</v></c>');
    expect(xml).toContain('<c r="E2"><v>3.5</v></c>');
  });

  it('adds frozen header, autofilter and filter database name', () => {
    const zip = createXlsx(sheet);
    const sheetXml = readZipText(zip, 'xl/worksheets/sheet1.xml');
    expect(sheetXml).toContain('state="frozen"');
    expect(sheetXml).toContain('<autoFilter ref="A1:E2"/>');
    expect(readZipText(zip, 'xl/workbook.xml')).toContain(
      `<definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">'Prozess'!$A$1:$E$2</definedName>`,
    );
  });

  it('puts dropdown values on a hidden sheet and references them', () => {
    const zip = createXlsx(sheet);
    expect(readZipText(zip, 'xl/workbook.xml')).toContain('<sheet name="Wertelisten" sheetId="2" state="hidden" r:id="rId2"/>');
    expect(readZipText(zip, 'xl/worksheets/sheet1.xml')).toContain(
      `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="B2:B1048576"><formula1>'Wertelisten'!$A$1:$A$3</formula1></dataValidation>`,
    );
    const listXml = readZipText(zip, 'xl/worksheets/sheet2.xml');
    expect(listXml).toContain('<t xml:space="preserve">in Arbeit, aktiv</t>');
    expect(listXml).toContain('<c r="A3" t="inlineStr">');
  });

  it('omits the list sheet when no column has list values', () => {
    const zip = createXlsx({ name: 'Einfach', columns: [{ header: 'Name' }, { header: 'Leer', listValues: [''] }], rows: [['x']] });
    const entries = readZip(zip);
    expect(entries.has('xl/worksheets/sheet2.xml')).toBe(false);
    expect(readZipText(zip, '[Content_Types].xml')).not.toContain('sheet2.xml');
    expect(readZipText(zip, 'xl/worksheets/sheet1.xml')).not.toContain('dataValidation');
  });

  it('skips empty and invalid values', () => {
    const xml = readZipText(createXlsx({
      name: 'Leer',
      columns: [{ header: 'a' }, { header: 'b' }, { header: 'c' }, { header: 'd' }],
      rows: [[undefined, '', Number.NaN, new Date('invalid')]],
    }), 'xl/worksheets/sheet1.xml');
    expect(xml).toContain('<row r="2"></row>');
  });

  it('removes characters that are invalid in XML', () => {
    const xml = readZipText(createXlsx({ name: 'X', columns: [{ header: 'a\u0001b' }], rows: [] }), 'xl/worksheets/sheet1.xml');
    expect(xml).toContain('<t xml:space="preserve">ab</t>');
  });
});
