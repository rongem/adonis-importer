import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { rootPath } from './router.function';
import { AdonisImportStoreService } from '../store/adonis-import-store.service';

export const canActivateImport: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const importService = inject(AdonisImportStoreService);
    return !!importService.selectedObjectGroup() ? true : rootPath();
};
