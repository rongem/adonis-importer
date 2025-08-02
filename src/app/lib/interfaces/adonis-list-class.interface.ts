import { AdonisBasicClass } from "./adonis-basic-class.interface";
import { AdonisLink } from "./adonis-link.interface";

export interface AdonisClassList {
    rest_links: AdonisLink[];
    classes: AdonisBasicClass[];
}
