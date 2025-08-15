import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import * as Selectors from '../store/store.selectors';

@Injectable({providedIn: 'root'})
class ImportGuard  {

    constructor(private store: Store, private router: Router) {}

    canActivate() {
        return this.store.select(Selectors.selectedObjectGroup).pipe(
            take(1),
            map(group => !!group ? true : this.router.createUrlTree(['/'])));
    }
}

export const canActivateImport: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(ImportGuard).canActivate();
