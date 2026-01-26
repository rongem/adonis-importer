import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AdonisStoreService } from '../store/adonis-store.service';
import { rootPath } from './router.function';

export const canActivateExport: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const storeService = inject(AdonisStoreService);
    return storeService.purpose() === 'config' ? true : rootPath();
};
