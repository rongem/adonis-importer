import { AdonisAttribute } from "../attribute.interface";

export interface AdonisAttributeContainer {
    [key: string]: AdonisAttribute;
}