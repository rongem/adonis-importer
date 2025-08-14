import { AdonisBasicNamedType } from "./adonis-basic-type.interface";

export interface AdonisBasicClass extends AdonisBasicNamedType {
    repositoryClass: boolean;
    visible: boolean;
    abstract: boolean;
    filtered: boolean;
}