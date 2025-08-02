import { AdonisAttribute } from "./adonis-attribute.interface";

export interface AttributeContainer {
    [key: string]: AdonisAttribute[];
}