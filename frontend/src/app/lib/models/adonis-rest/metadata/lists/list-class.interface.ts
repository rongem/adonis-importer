import { AdonisBasicClass } from "../basic-class.interface";
import { AdonisRestObject } from "../basic-type.interface";

export interface AdonisClassList extends AdonisRestObject {
    classes: AdonisBasicClass[];
}
