import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { ApplicationStateService } from '../store/application-state.service';
import { rootPath } from './router.function';

export const canActivateClasses: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const appState = inject(ApplicationStateService);
    return appState.classesReady() ? true : rootPath();
};
