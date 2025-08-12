import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import * as Selectors from '../store/store.selectors';
import { ExportAction } from '../enums/export-action.enum';

@Injectable({providedIn: 'root'})
class ChoicesAuthGuard  {

    constructor(private store: Store, private router: Router) {}

    canActivate() {
        return this.store.select(Selectors.selectedProperties).pipe(
            take(1),
            map(properties => !!properties && properties.length > 0 ? true : this.router.createUrlTree(['/'])));
    }
}

export const canActivateChoice: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(ChoicesAuthGuard).canActivate();
