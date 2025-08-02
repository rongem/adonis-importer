import { AdonisBasicType } from "./adonis-basic-type.interface";
import { AdonisDisplayName } from "./adonis-displayname.interface";

interface Colums {
    id: string;
    displayNames: AdonisDisplayName;
    type: AdonisBasicType;
    defaultValues: AdonisDisplayName;
    width: number;
};

export interface AdonisAttributeType {
    complexData?: {
        columns: Colums[];
    };
    minRows: number;
    maxRows: number;
    addRows: boolean;
    deleteRows: boolean;
    readOnly: boolean;
    contextSpecific: boolean;
};
