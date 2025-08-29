import { AdonisRestObject } from "../metadata/basic-type.interface";
import { AdonisItem } from "../search/result.interface";
import { CreateAttribute } from "./object.interface";

export type DirectionType = 'incoming' | 'outgoing';

export interface CreateRelation {
    direction: DirectionType;
    relationClass: string;
    relationTargetId: string;
};

export interface CreateRelationResponse extends AdonisRestObject {
    attributes: CreateAttribute[];
    from: AdonisItem;
    to: AdonisItem;
    locale: string;
}
