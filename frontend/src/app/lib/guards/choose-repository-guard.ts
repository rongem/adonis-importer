import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AdonisStoreService } from '../store/adonis-store.service';
import { AdonisImportStoreService } from '../store/adonis-import-store.service';
import { rootPath } from './router.function';

export const canChooseRepository: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const storeService = inject(AdonisStoreService);
    const importService = inject(AdonisImportStoreService);

    if(storeService.purpose() === 'import') {
        if (importService.repositories() === undefined) {
            importService.loadRepositories();
        }
        return true;
    }
    return rootPath();
};
