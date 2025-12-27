import { computed, effect, Injectable, signal } from "@angular/core";
import { CellContent } from "../models/table/cellcontent.model";
import { Column } from "../models/table/column.model";
import { ErrorList } from "../models/table/errorlist.model";
import { CellInformation } from "../models/table/cellinformation.model";
import { Row } from "../models/table/row.model";

@Injectable({providedIn: 'root'})
export class ImportTableService {
    // signals
    private _columnDefinitions = signal<Column[]>([]);
    readonly columnDefinitions = this._columnDefinitions.asReadonly()
    private _cellContents = signal<CellContent[]>([]);
    readonly cellContents = this._cellContents.asReadonly();
    private _columnMapping = signal<number[]>([]);
    readonly columnMapping = this._columnMapping.asReadonly();
    private _rowErrors = signal<ErrorList[]>([]);
    readonly rowErrors = this._rowErrors.asReadonly();
    readonly contentsAreTested = signal(false);
    
    // computed signals
    readonly sortedColumnDefinitions = computed(() => {
        return this.columnDefinitions().slice().sort((a, b) => a.ordinalPosition - b.ordinalPosition);
    });
    readonly columnDefinitionByOriginalPosition = (columnPosition: number) => {
        return computed(() => this.columnDefinitions().find(c => c.ordinalPosition === columnPosition));
    };
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
    readonly cellInformation = (rowIndex: number, columIndex: number) => {
        return computed(() => this.cellInformations().find(c => c.row === rowIndex && c.column === columIndex))
    };
    readonly rowNumbers = computed(() => {
        return [...new Set(this.cellContents().map(c => c.row))];
    });
    readonly tableContainsErrors = computed(() => {
        return this.cellInformations().some(c => c.containsErrors);
    });
    readonly rowContainsErrors = (rowIndex: number) => {
        return computed(() => this.rowErrors().some(e => e.row === rowIndex) || this.cellInformations().some(c => c.row === rowIndex && c.containsErrors));
    }
    readonly errorsInRow = (rowIndex: number) => {
        return computed(() => [
            ...this.rowErrors().filter(e => e.row === rowIndex).map(e => e.msg),
            ...this.cellInformations().filter(c => c.row === rowIndex && c.containsErrors).map(c => `Spalte: ` + c.name + ': ' + c.errors.join(`, `)),
        ]);
    }
    readonly cellContainsRowError = (rowIndex: number, columIndex: number) => {
        return computed(() => this.rowErrors().filter(e => e.row === rowIndex && e.columnIndex === columIndex).map(e => e.msg));
    };
    // compute rows for testing and import
    readonly rows = computed(() => {
        const rows: Row[] = [];
        for (let rowNumber of this.rowNumbers()) {
            const cells = this.cellInformations().filter(c => c.row === rowNumber);
            rows[rowNumber] = {};
            for (let cell of cells) {
                if (!!cell.typedValue || !cell.canBeEmpty) {
                    rows[rowNumber][cell.name] = cell.typedValue;
                }
            }
        }
        return rows;
    });

    // effects

    // test table contents for basic errors:
    // 1. check for duplicate primary keys
    // 2. check for enum violations
    private readonly testRows = effect(() => {
        const columns = this.columnDefinitions();
        if (columns.length === 0) {
            this._rowErrors.set([]);
            this.contentsAreTested.set(false);
            return;
        }
        const primaryColumn = this.primaryColumn();
        if (!primaryColumn) {
            this._rowErrors.set([{msg: 'Kein Primärschlüssel definiert', row: -1, columnIndex: -1}]);
            this.contentsAreTested.set(false);
            return;
        }
        const primaryColumnIndex = this.primaryColumnIndex();
        const rows = this.rows();
        if (rows.length === 0) {
            this._rowErrors.set([]);
            this.contentsAreTested.set(false);
            return;
        }
        const primaryValues = rows.map(r => r[primaryColumn.internalName]);
        const errors: ErrorList[] = [];
        primaryValues.forEach((value, row) => {
            if (primaryValues.filter(v1 => v1 === value).length > 1) {
                errors.push({msg: 'Doppelter Primärschlüssel', row, columnIndex: primaryColumnIndex, rowContent: rows[row]});
            }
        });
        const enumColumns = columns.filter(c => !!c.enumData);
        enumColumns.forEach(c => {
            const enumColumnIndex = columns.indexOf(c);
            rows.forEach((value, row) => {
                if (!c.enumData!.values.includes(value.toString())) {
                    errors.push({msg: 'Wert nicht im erlaubten Bereich', row, columnIndex: enumColumnIndex, rowContent: value})
                }
            });
        });
        this._rowErrors.set(errors);
        console.error(errors);
        this.contentsAreTested.set(!this.tableContainsErrors());
    });


    // methods to update signals
    setColumnDefinitions(columns: Column[]) {
        this._columnDefinitions.set(columns);
        this._columnMapping.set(Array.from(Array(columns.length).keys()));
    }
    
    // reset errors and tested flag
    private clearErrorsAndTestresults() {
        this._rowErrors.set([]);
        this.contentsAreTested.set(false);
    }

    // set cell contents and reset status
    setCellContents(contents: CellContent[]) {
        this.clearErrorsAndTestresults();
        this._cellContents.set(contents);
    }

    // set column order and reset status
    changeColumnOrder(columnMappings: number[]) {
        this.clearErrorsAndTestresults();
        this._columnMapping.set(columnMappings);
    }
}