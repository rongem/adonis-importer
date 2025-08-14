import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import * as Selectors from '../store/store.selectors';

@Injectable({providedIn: 'root'})
class ClassesAuthGuard  {

    constructor(private store: Store, private router: Router) {}

    canActivate() {
        return this.store.select(Selectors.classesReady).pipe(
            take(1),
            map(ready => ready ? true : this.router.createUrlTree(['/'])));
    }
}

export const canActivateClasses: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(ClassesAuthGuard).canActivate();
