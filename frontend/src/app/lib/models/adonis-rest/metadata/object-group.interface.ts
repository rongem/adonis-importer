import { AdonisBasicObject } from "./basic-type.interface";

export interface AdonisObjectGroup extends AdonisBasicObject {
    name: string;
    subgroups: AdonisObjectGroup[];
}