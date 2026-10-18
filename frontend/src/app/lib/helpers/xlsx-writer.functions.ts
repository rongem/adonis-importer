// Minimal XLSX (SpreadsheetML) writer: one data sheet with bold, frozen header row, autofilter
// and optional dropdown lists. Lists are stored on a hidden sheet, so they are neither limited
// to 255 characters nor broken by commas inside values.
import { createZip } from './zip.functions';

export type XlsxCellValue = string | number | boolean | Date | undefined;

export interface XlsxColumn {
    header: string;
    // allowed values, offered as dropdown in the data rows of this column
    listValues?: string[];
}

export interface XlsxSheet {
    name: string;
    columns: XlsxColumn[];
    rows: XlsxCellValue[][];
}

export const xlsxMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const mainNamespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const relationshipNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const packageRelationshipNamespace = 'http://schemas.openxmlformats.org/package/2006/relationships';
const xmlHeader = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const maxRow = 1048576;
const listSheetName = 'Wertelisten';

// indexes into cellXfs of styles.xml
const headerStyle = 1;
const dateStyle = 2;

export function createXlsx(sheet: XlsxSheet): Uint8Array<ArrayBuffer> {
    const sheetName = sanitizeSheetName(sheet.name);
    const listColumns = sheet.columns
        .map((column, index) => ({ index, values: (column.listValues ?? []).filter(v => v !== '') }))
        .filter(list => list.values.length > 0);
    const hasLists = listColumns.length > 0;

    const entries = [
        { path: '[Content_Types].xml', content: contentTypesXml(hasLists) },
        { path: '_rels/.rels', content: rootRelsXml() },
        { path: 'xl/workbook.xml', content: workbookXml(sheetName, sheet.columns.length, sheet.rows.length, hasLists) },
        { path: 'xl/_rels/workbook.xml.rels', content: workbookRelsXml(hasLists) },
        { path: 'xl/styles.xml', content: stylesXml() },
        { path: 'xl/worksheets/sheet1.xml', content: dataSheetXml(sheet, listColumns) },
    ];
    if (hasLists) {
        entries.push({ path: 'xl/worksheets/sheet2.xml', content: listSheetXml(listColumns.map(list => list.values)) });
    }
    return createZip(entries);
}

export function columnLetter(index: number) {
    let letters = '';
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
        letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
    }
    return letters;
}

// Excel serial date (days since 1899-12-30), based on the local wall clock time
export function toExcelSerialDate(date: Date) {
    const localAsUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    return (localAsUtc - Date.UTC(1899, 11, 30)) / 86400000;
}

// Excel sheet names: max. 31 characters, none of []:*?/\
export function sanitizeSheetName(name: string) {
    const sanitized = name.replace(/[\[\]:*?\/\\]/g, '_').replace(/^'+|'+$/g, '').substring(0, 31).trim();
    return sanitized === '' || sanitized === listSheetName ? 'Tabelle1' : sanitized;
}

function dataSheetXml(sheet: XlsxSheet, listColumns: { index: number; values: string[] }[]) {
    const lastColumn = columnLetter(Math.max(sheet.columns.length - 1, 0));
    const range = `A1:${lastColumn}${sheet.rows.length + 1}`;
    const headerRow = `<row r="1">${sheet.columns.map((column, index) => stringCell(cellReference(index, 1), column.header, headerStyle)).join('')}</row>`;
    const dataRows = sheet.rows.map((row, rowIndex) => {
        const rowNumber = rowIndex + 2;
        const cells = sheet.columns.map((_, columnIndex) => cellXml(cellReference(columnIndex, rowNumber), row[columnIndex])).join('');
        return `<row r="${rowNumber}">${cells}</row>`;
    }).join('');
    const columnWidths = sheet.columns.map((column, index) => {
        const width = columnWidth([column.header, ...sheet.rows.map(row => displayLength(row[index]))]);
        return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
    }).join('');
    const validations = listColumns.map((list, listIndex) => {
        const column = columnLetter(list.index);
        const source = `${quoteSheetName(listSheetName)}!$${columnLetter(listIndex)}$1:$${columnLetter(listIndex)}$${list.values.length}`;
        return `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${column}2:${column}${maxRow}"><formula1>${escapeXml(source)}</formula1></dataValidation>`;
    }).join('');

    return xmlHeader +
        `<worksheet xmlns="${mainNamespace}">` +
        `<dimension ref="${range}"/>` +
        '<sheetViews><sheetView tabSelected="1" workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
        '<sheetFormatPr defaultRowHeight="15"/>' +
        (columnWidths ? `<cols>${columnWidths}</cols>` : '') +
        `<sheetData>${headerRow}${dataRows}</sheetData>` +
        (sheet.columns.length > 0 ? `<autoFilter ref="${range}"/>` : '') +
        (validations ? `<dataValidations count="${listColumns.length}">${validations}</dataValidations>` : '') +
        '</worksheet>';
}

function listSheetXml(lists: string[][]) {
    const rowCount = Math.max(...lists.map(list => list.length));
    const rows: string[] = [];
    for (let rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
        const cells = lists.map((list, columnIndex) => cellXml(cellReference(columnIndex, rowNumber), list[rowNumber - 1])).join('');
        rows.push(`<row r="${rowNumber}">${cells}</row>`);
    }
    return xmlHeader + `<worksheet xmlns="${mainNamespace}"><sheetData>${rows.join('')}</sheetData></worksheet>`;
}

function cellXml(reference: string, value: XlsxCellValue) {
    if (value === undefined || value === '') return '';
    if (value instanceof Date) {
        return isNaN(value.valueOf()) ? '' : `<c r="${reference}" s="${dateStyle}"><v>${toExcelSerialDate(value)}</v></c>`;
    }
    switch (typeof value) {
        case 'boolean':
            return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
        case 'number':
            return Number.isFinite(value) ? `<c r="${reference}"><v>${value}</v></c>` : '';
        default:
            return stringCell(reference, value);
    }
}

function stringCell(reference: string, value: string, style?: number) {
    const styleAttribute = style === undefined ? '' : ` s="${style}"`;
    return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function cellReference(columnIndex: number, rowNumber: number) {
    return columnLetter(columnIndex) + rowNumber;
}

function displayLength(value: XlsxCellValue) {
    if (value instanceof Date) return '00.00.0000';
    return value === undefined ? '' : String(value);
}

function columnWidth(texts: string[]) {
    const longest = Math.max(...texts.map(text => text.length));
    // a little extra room for the autofilter button in the header
    return Math.min(Math.max(longest + 4, 10), 60);
}

function quoteSheetName(name: string) {
    return `'${name.replace(/'/g, "''")}'`;
}

function escapeXml(value: string) {
    return value
        // characters that are not allowed in XML 1.0
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function contentTypesXml(hasLists: boolean) {
    const worksheetType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml';
    return xmlHeader +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
        `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="${worksheetType}"/>` +
        (hasLists ? `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="${worksheetType}"/>` : '') +
        '</Types>';
}

function rootRelsXml() {
    return xmlHeader +
        `<Relationships xmlns="${packageRelationshipNamespace}">` +
        `<Relationship Id="rId1" Type="${relationshipNamespace}/officeDocument" Target="xl/workbook.xml"/>` +
        '</Relationships>';
}

function workbookXml(sheetName: string, columnCount: number, rowCount: number, hasLists: boolean) {
    const filterRange = `${quoteSheetName(sheetName)}!$A$1:$${columnLetter(Math.max(columnCount - 1, 0))}$${rowCount + 1}`;
    return xmlHeader +
        `<workbook xmlns="${mainNamespace}" xmlns:r="${relationshipNamespace}">` +
        '<sheets>' +
        `<sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/>` +
        (hasLists ? `<sheet name="${listSheetName}" sheetId="2" state="hidden" r:id="rId2"/>` : '') +
        '</sheets>' +
        (columnCount > 0 ? `<definedNames><definedName name="_xlnm._FilterDatabase" localSheetId="0" hidden="1">${escapeXml(filterRange)}</definedName></definedNames>` : '') +
        '</workbook>';
}

function workbookRelsXml(hasLists: boolean) {
    return xmlHeader +
        `<Relationships xmlns="${packageRelationshipNamespace}">` +
        `<Relationship Id="rId1" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet1.xml"/>` +
        (hasLists ? `<Relationship Id="rId2" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet2.xml"/>` : '') +
        `<Relationship Id="rId3" Type="${relationshipNamespace}/styles" Target="styles.xml"/>` +
        '</Relationships>';
}

function stylesXml() {
    return xmlHeader +
        `<styleSheet xmlns="${mainNamespace}">` +
        '<fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>' +
        '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>' +
        '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
        '<cellXfs count="3">' +
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
        '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>' +
        '<xf numFmtId="14" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' +
        '</cellXfs>' +
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
        '</styleSheet>';
}
