import { AdonisBasicClass } from "./adonis-basic-class.interface";
import { AdonisLink } from "./adonis-link.interface";

export interface AdonisMetaModel {
    restllinks: AdonisLink[];
    classes: AdonisBasicClass[];
}