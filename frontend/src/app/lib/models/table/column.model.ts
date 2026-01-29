import { AdonisAttribute } from "../adonis-rest/metadata/attribute.interface";
import { AdonisNotebookAttribute } from "../adonis-rest/metadata/notebook-elements.interface";

export interface Column {
    displayName: string;
    internalName: string;
    ordinalPosition: number;
    hasDefaultValue: boolean;
    isNullable: boolean;
    primary: boolean;
    unique: boolean;
    allowedTypes: string[];
    property: {
        attribute?: AdonisNotebookAttribute;
        attributeInfo?: AdonisAttribute;
    }
    enumData?: {
        values: string[];
        aliases: string[];
    }
}
