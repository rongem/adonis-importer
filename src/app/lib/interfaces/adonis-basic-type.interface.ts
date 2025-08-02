import { AdonisDisplayName } from "./adonis-displayname.interface";
import { AdonisLink } from "./adonis-link.interface";

export interface AdonisBasicType {
    rest_links: AdonisLink[];
    id: string;
    metaName: string;
}

export interface AdonisBasicNamedType extends AdonisBasicType{
    displayNames: AdonisDisplayName;
}