import { AdonisBasicClass } from "./basic-class.interface";
import { AdonisDisplayName } from "./displayname.interface";

export interface AdonisClass extends AdonisBasicClass {
    infoText: AdonisDisplayName;
    superClass: string;
    container: boolean;
    timeFilterRelevant: boolean;
    treeFilterRelevant: boolean;
}