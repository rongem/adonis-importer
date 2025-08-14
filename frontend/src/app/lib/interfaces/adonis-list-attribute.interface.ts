import { AdonisBasicType, AdonisRestObject } from "./adonis-basic-type.interface";

export interface AdonisAttributeList extends AdonisRestObject {
    attributes: AdonisBasicType[];
}
