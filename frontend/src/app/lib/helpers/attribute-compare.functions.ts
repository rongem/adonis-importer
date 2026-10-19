import { AdonisAttributeValue } from '../models/adonis-rest/read/item.interface';
import { CellInformation } from '../models/table/cellinformation.model';
import * as Constants from '../string.constants';

// Compares a (non-empty) table cell with the current attribute value of an existing ADONIS object.
// The type of the parsed cell value decides how the ADONIS value is interpreted, because ADONIS
// may deliver numbers, booleans and dates as strings.
export function cellMatchesAttributeValue(cell: CellInformation, attribute: AdonisAttributeValue | undefined) {
    if (!attribute || attribute.noValue || attribute.value === undefined || attribute.value === null || attribute.value === '') {
        return false;
    }
    const cellValue = cell.typedValue;
    const existingValue = attribute.value;
    if (cellValue instanceof Date) {
        const existingDate = toDate(existingValue);
        return !!existingDate && existingDate.getTime() === cellValue.getTime();
    }
    if (typeof cellValue === 'boolean') {
        return toBoolean(existingValue) === cellValue;
    }
    if (typeof cellValue === 'number') {
        return toNumber(existingValue) === cellValue;
    }
    if (Array.isArray(existingValue) || cell.isEnum) {
        return sameValues(cell.value.split(Constants.enumListSeparator), toValueList(existingValue));
    }
    return String(existingValue) === cell.value;
}

function toNumber(value: AdonisAttributeValue['value']) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const result = isNaN(+trimmed) ? +trimmed.replace(',', '.') : +trimmed;
    return isNaN(result) ? undefined : result;
}

function toBoolean(value: AdonisAttributeValue['value']) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLocaleLowerCase();
    if (['true', '1', 'ja', 'yes', 'wahr'].includes(normalized)) return true;
    if (['false', '0', 'nein', 'no', 'falsch'].includes(normalized)) return false;
    return undefined;
}

// timestamps, ISO strings and German dates; dates without time are interpreted as local midnight like the table cells
function toDate(value: AdonisAttributeValue['value']) {
    let date: Date | undefined;
    if (typeof value === 'number') {
        date = new Date(value);
    } else if (typeof value === 'string') {
        const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const germanDate = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?: (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
        if (isoDate) {
            date = new Date(+isoDate[1], +isoDate[2] - 1, +isoDate[3]);
        } else if (germanDate) {
            date = new Date(+germanDate[3], +germanDate[2] - 1, +germanDate[1], +(germanDate[4] ?? 0), +(germanDate[5] ?? 0), +(germanDate[6] ?? 0));
        } else {
            date = new Date(Date.parse(value));
        }
    }
    return date && !isNaN(date.getTime()) ? date : undefined;
}

function toValueList(value: AdonisAttributeValue['value']) {
    if (Array.isArray(value)) return value;
    return String(value).split(Constants.enumListSeparator);
}

function sameValues(a: string[], b: string[]) {
    const normalize = (values: string[]) => values.map(v => v.trim()).filter(v => v !== '').sort();
    const [left, right] = [normalize(a), normalize(b)];
    return left.length === right.length && left.every((v, i) => v === right[i]);
}
