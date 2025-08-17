import { AdonisClass } from "../adonis-rest/metadata/class.interface";
import { Column } from "./column.model";
import { Row } from "./row.model";

export interface RowContainer {
    rows: Row[];
    columns: Column[];
    selectedClass: AdonisClass;
}
