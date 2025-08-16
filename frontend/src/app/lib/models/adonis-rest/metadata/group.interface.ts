import { AdonisBasicObject } from "./basic-type.interface";

export interface AdonisGroupContainer {
    locale: string;
    group: AdonisGroup;
}

export interface AdonisGroup extends AdonisBasicObject {
    name: string;
    subgroups: AdonisGroup[];
}