import { AdonisBasicObject } from "./adonis-basic-type.interface";

export interface AdonisObjectGroup extends AdonisBasicObject {
    name: string;
    subgroups: AdonisObjectGroup[];
}