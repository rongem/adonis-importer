import { HttpErrorResponse } from "@angular/common/http";
import { CreateObjectResponse } from "../adonis-rest/write/object-response.interface";
import { CreateObject, EditObject } from "../adonis-rest/write/object.interface";
import { CreateRelation, CreateRelationResponse } from "../adonis-rest/write/relation.interface";
import { ErrorList } from "./errorlist.model";

export interface RowOperation {
    rowNumber: number;
    createObject?: CreateObject;
    editObject?: EditObject;
    editObjectId?: string;
    createRelations: CreateRelation[];
    importedObject?: CreateObjectResponse;
    error?: HttpErrorResponse;
}

export interface RelationOperation {
    rowOperation: RowOperation;
    operationResult?: CreateRelationResponse;
    operationError?: HttpErrorResponse;
}
