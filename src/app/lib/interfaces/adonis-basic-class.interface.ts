import { AdonisBasicType } from "./adonis-basic-type.interface";

export interface AdonisBasicClass extends AdonisBasicType {
    repositoryClass: boolean;
    visible: boolean;
    abstract: boolean;
    filtered: boolean;
}