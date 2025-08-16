import { AdonisBasicNamedType } from "./adonis-basic-type.interface";
import { AdonisDisplayName } from "./adonis-displayname.interface";

interface Colums {
    id: string;
    displayNames: AdonisDisplayName;
    type: AdonisBasicNamedType;
    defaultValues: AdonisDisplayName;
    width: number;
};

export interface AdonisAttributeType extends AdonisBasicNamedType {
    complexData?: {
        columns: Colums[];
    };
    minRows: number;
    maxRows: number;
    addRows: boolean;
    deleteRows: boolean;
    readOnly: boolean;
    contextSpecific: boolean;
    noValueSupport: boolean;
};
