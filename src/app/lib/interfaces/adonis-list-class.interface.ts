import { AdonisBasicClass } from "./adonis-basic-class.interface";
import { AdonisRestObject } from "./adonis-basic-type.interface";

export interface AdonisClassList extends AdonisRestObject {
    classes: AdonisBasicClass[];
}
