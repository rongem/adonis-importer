import { AdonisAttribute } from "../../interfaces/adonis-attribute.interface";
import { AdonisClass } from "../../interfaces/adonis-class.interface";
import { AdonisNotebookAttribute, AdonisNotebookRelations } from "../../interfaces/adonis-notebook-elements.interface";

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
