import { AdonisBasicNamedType, AdonisBasicType } from "./adonis-basic-type.interface";
import { AdonisDisplayName } from "./adonis-displayname.interface";

export interface AdonisAttribute extends AdonisBasicNamedType {
    type: AdonisBasicType;
    classAttribute: boolean;
    contextSpecific: boolean;
    multiLingual: boolean;
    systemAttribute: boolean;
    infoText: AdonisDisplayName;
    constraints: AdonisDisplayName;
}