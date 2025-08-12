import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import * as Selectors from '../store/store.selectors';
import { ExportAction } from '../enums/export-action.enum';

@Injectable({providedIn: 'root'})
class ImportAuthGuard  {

    constructor(private store: Store, private router: Router) {}

    canActivate() {
        return this.store.select(Selectors.selectedAction).pipe(
            take(1),
            map(action => action === ExportAction.ExportFiles || action === ExportAction.ImportViaRest ? true : this.router.createUrlTree(['/'])));
    }
}

export const canActivateImport: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(ImportAuthGuard).canActivate();
