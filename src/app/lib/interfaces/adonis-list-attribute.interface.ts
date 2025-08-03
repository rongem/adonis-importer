import { AdonisBasicType } from "./adonis-basic-type.interface";
import { AdonisLink } from "./adonis-link.interface";

export interface AdonisAttributeList {
    rest_links: AdonisLink[];
    attributes: AdonisBasicType[];
}
