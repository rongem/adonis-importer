import { AdonisBasicClass } from "./adonis-basic-class.interface";
import { AdonisDisplayName } from "./adonis-displayname.interface";

export interface AdonisClass extends AdonisBasicClass {
    infoText: AdonisDisplayName;
    superClass: string;
    container: boolean;
    timeFilterRelevant: boolean;
    treeFilterRelevant: boolean;
}