import { AdonisBasicType, AdonisRestObject } from "../basic-type.interface";

export interface AdonisAttributeList extends AdonisRestObject {
    attributes: AdonisBasicType[];
}
