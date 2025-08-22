import { AdonisAttribute } from "../adonis-rest/metadata/attribute.interface";
import { AdonisNotebookAttribute, AdonisNotebookRelations } from "../adonis-rest/metadata/notebook-elements.interface";
import { AdonisItem } from "../adonis-rest/search/result.interface";

export interface Column {
    displayName: string;
    internalName: string;
    ordinalPosition: number;
    hasDefaultValue: boolean;
    isNullable: boolean;
    primary: boolean;
    unique: boolean;
    relation: boolean;
    allowedTypes: string[];
    property: {
        attribute?: AdonisNotebookAttribute;
        attributeInfo?: AdonisAttribute;
        relation?: AdonisNotebookRelations;
        relationTargets?: AdonisItem[];
    }
    enumData?: {
        values: string[];
        aliases: string[];
    }
}
