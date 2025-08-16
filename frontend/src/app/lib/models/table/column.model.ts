import { AdonisAttribute } from "../adonis-rest/metadata/attribute.interface";
import { AdonisClass } from "../adonis-rest/metadata/class.interface";
import { AdonisNotebookAttribute, AdonisNotebookRelations } from "../adonis-rest/metadata/notebook-elements.interface";

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
        relationTargetClass?: AdonisClass;
    }
    enumData?: {
        values: string[];
        aliases: string[];
    }
}
