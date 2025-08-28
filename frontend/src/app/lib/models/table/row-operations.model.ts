import { CreateObject } from "../adonis-rest/write/create-object.interface";
import { CreateRelation } from "../adonis-rest/write/create-relation.interface";

export interface RowOperations {
    createObject: CreateObject;
    createRelations: CreateRelation[];
}
