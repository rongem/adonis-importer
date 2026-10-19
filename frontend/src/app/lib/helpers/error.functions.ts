import { HttpErrorResponse } from '@angular/common/http';

// readable message for errors from HTTP calls and other sources
export function errorText(error: unknown) {
    if (error instanceof HttpErrorResponse || error instanceof Error) {
        return error.message;
    }
    return String(error);
}
