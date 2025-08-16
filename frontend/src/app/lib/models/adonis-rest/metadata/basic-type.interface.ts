import { AdonisDisplayName } from "./displayname.interface";
import { AdonisLink } from "./link.interface";



export interface AdonisRestObject {
    rest_links: AdonisLink[];
}
export interface AdonisBasicObject extends AdonisRestObject {
    id: string;
}
export interface AdonisBasicType extends AdonisBasicObject {
    metaName: string;
}

export interface AdonisBasicNamedType extends AdonisBasicType{
    displayNames: AdonisDisplayName;
}