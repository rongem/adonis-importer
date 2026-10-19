import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AdonisStoreService } from '../store/adonis-store.service';
import { rootPath } from './router.function';

export const canChooseRepository: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const storeService = inject(AdonisStoreService);

    if(storeService.purpose() === 'import') {
        return true;
    }
    return rootPath();
};
