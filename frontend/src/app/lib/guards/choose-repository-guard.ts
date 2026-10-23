import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AdonisStoreService } from '../store/adonis-store.service';
import { rootPath } from './router.function';
import { features } from '../features';

export const canChooseRepository: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const storeService = inject(AdonisStoreService);

    if (features.objectImport && storeService.purpose() === 'import') {
        return true;
    }
    return rootPath();
};
