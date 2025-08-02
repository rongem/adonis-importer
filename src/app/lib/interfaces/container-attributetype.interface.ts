import { AdonisAttributeType } from "./adonis-attributetype.interface";

export interface AttributeTypeContainer {
    [key: string]: AdonisAttributeType;
}