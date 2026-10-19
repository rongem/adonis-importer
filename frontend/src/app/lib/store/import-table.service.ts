import { computed, Injectable, signal } from "@angular/core";
import { CellContent } from "../models/table/cellcontent.model";
import { Column } from "../models/table/column.model";
import { ErrorList } from "../models/table/errorlist.model";
import { CellInformation } from "../models/table/cellinformation.model";
import { Row } from "../models/table/row.model";

const cellKey = (row: number, column: number) => row + ':' + column;

@Injectable({providedIn: 'root'})
export class ImportTableService {
    // signals
    private readonly _columnDefinitions = signal<Column[]>([]);
    readonly columnDefinitions = this._columnDefinitions.asReadonly();
    private readonly _cellContents = signal<CellContent[]>([]);
    readonly cellContents = this._cellContents.asReadonly();
    private readonly _columnMapping = signal<number[]>([]);
    readonly columnMapping = this._columnMapping.asReadonly();

    // computed signals
    readonly sortedColumnDefinitions = computed(() => {
        return this.columnDefinitions().slice().sort((a, b) => a.ordinalPosition - b.ordinalPosition);
    });
    private readonly columnsByOrdinalPosition = computed(() => new Map(this.columnDefinitions().map(c => [c.ordinalPosition, c])));
    readonly primaryColumn = computed(() => {
        return this.columnDefinitions().find(c => c.primary);
    });
    readonly primaryColumnIndex = computed(() => {
        const primary = this.primaryColumn();
        if (!primary) return -1;
        return this.columnDefinitions().indexOf(primary);
    });
    readonly cellInformations = computed(() => {
        return this.cellContents().map(c => new CellInformation(c, this.sortedColumnDefinitions()[this.columnMapping()[c.column]]));
    });
    private readonly cellInformationsByPosition = computed(() => new Map(this.cellInformations().map(c => [cellKey(c.row, c.column), c])));
    private readonly cellInformationsByRow = computed(() => {
        const result = new Map<number, CellInformation[]>();
        for (const cell of this.cellInformations()) {
            result.set(cell.row, [...(result.get(cell.row) ?? []), cell]);
        }
        return result;
    });
    readonly rowNumbers = computed(() => [...this.cellInformationsByRow().keys()]);
    readonly tableContainsErrors = computed(() => {
        return this.cellInformations().some(c => c.containsErrors);
    });
    // compute rows for testing and import
    readonly rows = computed(() => {
        const rows: Row[] = [];
        for (const [rowNumber, cells] of this.cellInformationsByRow()) {
            rows[rowNumber] = {};
            for (const cell of cells) {
                if (!!cell.typedValue || !cell.canBeEmpty) {
                    rows[rowNumber][cell.name] = cell.typedValue;
                }
            }
        }
        return rows;
    });

    // errors that affect a row as a whole (cell type errors are part of the cell informations):
    // 1. missing primary key column
    // 2. duplicate primary keys
    readonly rowErrors = computed<ErrorList[]>(() => {
        if (this.columnDefinitions().length === 0) return [];
        const primaryColumn = this.primaryColumn();
        if (!primaryColumn) {
            return [{msg: 'Kein Primärschlüssel definiert', row: -1, columnIndex: -1}];
        }
        const rows = this.rows();
        const primaryValues = rows.map(r => r[primaryColumn.internalName]);
        const counts = new Map<unknown, number>();
        primaryValues.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1));
        const errors: ErrorList[] = [];
        primaryValues.forEach((value, row) => {
            // empty names are reported as cell errors already
            if (value !== undefined && value !== '' && counts.get(value)! > 1) {
                errors.push({msg: 'Doppelter Primärschlüssel', row, columnIndex: this.primaryColumnIndex(), rowContent: rows[row]});
            }
        });
        return errors;
    });
    private readonly errorMessagesByRow = computed(() => {
        const result = new Map<number, string[]>();
        const add = (row: number, message: string) => result.set(row, [...(result.get(row) ?? []), message]);
        this.rowErrors().forEach(e => add(e.row, e.msg));
        this.cellInformations().filter(c => c.containsErrors).forEach(c => add(c.row, `Spalte: ` + c.name + ': ' + c.errors.join(`, `)));
        return result;
    });
    private readonly rowErrorsByCell = computed(() => {
        const result = new Map<string, string[]>();
        this.rowErrors().forEach(e => {
            const key = cellKey(e.row, e.columnIndex ?? -1);
            result.set(key, [...(result.get(key) ?? []), e.msg]);
        });
        return result;
    });
    // all local checks passed, contents can be tested against ADONIS
    readonly contentsAreTested = computed(() =>
        this.columnDefinitions().length > 0 &&
        this.rowNumbers().length > 0 &&
        this.rowErrors().length === 0 &&
        !this.tableContainsErrors()
    );

    // lookups; they read signals, so they are reactive when used in templates or computed signals
    columnByOrdinalPosition(columnPosition: number) {
        return this.columnsByOrdinalPosition().get(columnPosition);
    }

    cellInformation(rowIndex: number, columnIndex: number) {
        return this.cellInformationsByPosition().get(cellKey(rowIndex, columnIndex));
    }

    rowContainsErrors(rowIndex: number) {
        return this.errorMessagesByRow().has(rowIndex);
    }

    errorsInRow(rowIndex: number) {
        return this.errorMessagesByRow().get(rowIndex) ?? [];
    }

    rowErrorsInCell(rowIndex: number, columnIndex: number) {
        return this.rowErrorsByCell().get(cellKey(rowIndex, columnIndex)) ?? [];
    }

    // methods to update signals
    setColumnDefinitions(columns: Column[]) {
        this._columnDefinitions.set(columns);
        this._columnMapping.set(Array.from(Array(columns.length).keys()));
    }

    setCellContents(contents: CellContent[]) {
        this._cellContents.set(contents);
    }

    changeColumnOrder(columnMappings: number[]) {
        this._columnMapping.set(columnMappings);
    }
}
