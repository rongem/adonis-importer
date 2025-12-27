import { inject } from "@angular/core"
import { Router } from "@angular/router";

export function rootPath() {
    return inject(Router).createUrlTree(['/']);
}
