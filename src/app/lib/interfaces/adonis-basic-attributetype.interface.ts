import { AdonisBasicType } from "./adonis-basic-type.interface";

export interface AdonisBasicAttributeType extends AdonisBasicType {
    noValueSupport: boolean;
}