import { AdonisItem } from "../adonis-rest/search/result.interface";
import { Column } from "./column.model";

export interface RelationTargets {
    column: Column;
    index: number;
    items?: AdonisItem[],
    errorMessage?: string;
}

export interface RelationTargetsContainer {
    [key: number]: RelationTargets;
}
