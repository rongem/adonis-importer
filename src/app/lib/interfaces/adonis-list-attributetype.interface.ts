import { AdonisBasicAttributeType } from "./adonis-basic-attributetype.interface";
import { AdonisLink } from "./adonis-link.interface";

export interface AdonisAttributeTypeList {
    rest_links: AdonisLink[];
    attrTypes: AdonisBasicAttributeType[];
}
