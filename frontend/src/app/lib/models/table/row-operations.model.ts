import { HttpErrorResponse } from "@angular/common/http";
import { CreateObjectResponse } from "../adonis-rest/write/object-response.interface";
import { CreateObject, EditObject } from "../adonis-rest/write/object.interface";
import { CreateRelation } from "../adonis-rest/write/relation.interface";

export interface RowOperations {
    createObject?: CreateObject;
    editObject?: EditObject;
    editObjectId?: string;
    createRelations: CreateRelation[];
    importedObject?: CreateObjectResponse;
    error?: HttpErrorResponse;
}
