import { tsTypeInfo } from "./tsTypeInfo";

export interface Column {
    displayName: string;
    internalName: string;
    ordinalPosition: number;
    hasDefaultValue: boolean;
    isNullable: boolean;
    characterData?: {
        maximumCharacterLength: number;
    };
    typeInfo: tsTypeInfo;
    primary: boolean;
    relation: boolean;
    relationTarget?: {
        metaName: string;
        id: string;
    };
    unique: boolean;
}
