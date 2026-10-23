import { CellContent } from "./cellcontent.model";
import { Column } from "./column.model";
import { isValidEnumValue } from "../../helpers/columns.functions";
import { usesGermanFormat } from "../../helpers/locale.functions";

type ValueType = 'boolean' | 'date' | 'number' | 'string';

// A table cell with its parsed values and validation errors. All values are computed once
// in the constructor, because cell informations are read very often by computed signals.
export class CellInformation {
    readonly value: string;
    readonly booleanValue: boolean | undefined;
    readonly numberValue: number | undefined;
    readonly dateValue: Date | undefined;
    readonly stringValue: string | undefined;
    readonly typedValue: Date | boolean | number | string | undefined;
    readonly errors: readonly string[];

    get errorText() { return this.errors.join('; '); }
    get containsErrors() { return this.errors.length > 0; }
    get isBoolean() { return this.booleanValue !== undefined; }
    get isDate() { return this.dateValue !== undefined; }
    get isNumber() { return this.numberValue !== undefined; }
    get isString() { return this.stringValue !== undefined; }
    get isEmpty() { return this.value === '' || this.value === undefined || this.value === null; }
    get canBeEmpty() { return this.columnDefinition.isNullable || this.columnDefinition.hasDefaultValue; }
    get isPrimary() { return this.columnDefinition.primary; }
    get isEnum() { return !!this.columnDefinition.enumData; }
    get name() { return this.columnDefinition.internalName; }
    get row() { return this.cellContent.row; }
    get column() { return this.cellContent.column; }
    get ordinalPosition() { return this.columnDefinition.ordinalPosition; }

    constructor(private readonly cellContent: CellContent, private readonly columnDefinition: Column, germanFormat = usesGermanFormat()) {
        if (!cellContent) throw new Error(`Es fehlt der Zelleninhalt`);
        if (!columnDefinition) throw new Error(`Es fehlt eine Spalte für ` + JSON.stringify(cellContent));
        this.value = cellContent.originalValue;

        const empty = this.isEmpty;
        this.booleanValue = !empty && this.canContain('boolean') ? parseBoolean(this.value) : undefined;
        this.numberValue = !empty && this.canContain('number') ? parseNumber(this.value, germanFormat) : undefined;
        this.dateValue = !empty && this.canContain('date') ? parseDateValue(this.value, germanFormat) : undefined;
        this.stringValue = this.canContain('string') ? this.value ?? undefined : undefined;
        this.typedValue = this.dateValue ?? this.booleanValue ?? this.numberValue ?? this.stringValue;
        this.errors = this.validate();
    }

    private canContain(type: ValueType) {
        return this.columnDefinition.allowedTypes.includes(type);
    }

    private validate() {
        const errors: string[] = [];
        if (this.isEmpty) {
            if (!this.canBeEmpty) {
                errors.push(`Keine leeren Zellen erlaubt.`);
            }
            return errors;
        }
        if (this.canContain('number') && !this.isNumber) {
            errors.push(`Nur Zahlen erlaubt`);
        }
        if (this.canContain('date') && !this.isDate) {
            errors.push(`Nur Datumswerte erlaubt`);
        }
        if (this.canContain('boolean') && !this.isBoolean) {
            errors.push(`Nur Wahr/Falsch-Werte erlaubt.`);
        }
        if (this.canContain('string') && !this.stringValue) {
            errors.push(`Nur Text erlaubt.`);
        }
        if (this.isEnum && !isValidEnumValue(this.columnDefinition.enumData!, this.value)) {
            errors.push('Wert ist nicht in der Enumeration enthalten.');
        }
        return errors;
    }
}

function parseBoolean(value: string) {
    switch (value.toLocaleLowerCase()) {
        case 'true':
        case 'yes':
        case 'ja':
        case 'wahr':
            return true;
        case 'false':
        case 'no':
        case 'nein':
        case 'falsch':
            return false;
        default:
            return isNaN(+value) ? undefined : !!+value;
    }
}

function parseNumber(value: string, germanFormat: boolean) {
    // German number format: "." separates thousands, "," is the decimal separator
    const normalized = removeCurrencySigns(germanFormat ? value.replace(/\./g, '').replace(',', '.') : value);
    return isNaN(+normalized) ? undefined : +normalized;
}

function removeCurrencySigns(value: string) {
    const currencySigns = ['€', '$', '¥', '元', '₱'];
    value = value.trim();
    for (const currency of currencySigns) {
        if (value.startsWith(currency)) {
            value = value.substring(1).trim();
        }
        if (value.endsWith(currency)) {
            value = value.substring(0, value.length - 1).trim();
        }
    }
    return value;
}

function parseDateValue(value: string, germanFormat: boolean) {
    // ISO dates without time mean local midnight (Date.parse would use UTC)
    let result: number | undefined = /^\d{4}-\d{2}-\d{2}$/.test(value) ? parseDate(value) : Date.parse(value);
    // German date format
    if (germanFormat && value.includes('.')) {
        result = parseDate(value, 'dd.mm.yyyy');
        const time = value.match(/ (\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (!!result && time) {
            result = new Date(result).setHours(+time[1], +time[2], +(time[3] ?? 0));
        }
    }
    if (!result || isNaN(result)) return undefined;
    return new Date(result);
}

function parseDate(input: string, format: string = 'yyyy-mm-dd') {
    const parts = input.match(/(\d+)/g);
    if (!parts || parts.length < 3) {
        return undefined;
    }
    const formatParts = format.match(/(yyyy|dd|mm)/g);
    if (!formatParts || formatParts.length !== 3) {
        return undefined;
    }
    // extract date-part indexes from the format
    const fmt: {[key: string]: number} = {};
    formatParts.forEach((part, index) => fmt[part] = index);
    return new Date(+parts[fmt['yyyy']], +parts[fmt['mm']] - 1, +parts[fmt['dd']]).valueOf();
}
