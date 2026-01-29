import { HttpErrorResponse } from "@angular/common/http";
import { CreateObjectResponse } from "../adonis-rest/write/object-response.interface";
import { CreateObject, EditObject } from "../adonis-rest/write/object.interface";

export interface RowOperation {
    rowNumber: number;
    createObject?: CreateObject;
    editObject?: EditObject;
    editObjectId?: string;
    importedObject?: CreateObjectResponse;
    error?: HttpErrorResponse;
}
