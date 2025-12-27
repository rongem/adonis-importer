import { AdonisRestObject } from "../metadata/basic-type.interface";
import { AdonisSearchResultItem } from "../search/result.interface";
import { CreateAttribute } from "./object.interface";

export type DirectionType = 'incoming' | 'outgoing';

export interface CreateRelation {
    direction: DirectionType;
    relationClass: string;
    relationTargetId: string;
};

export interface CreateRelationResponse extends AdonisRestObject {
    attributes: CreateAttribute[];
    from: AdonisSearchResultItem;
    to: AdonisSearchResultItem;
    locale: string;
}
