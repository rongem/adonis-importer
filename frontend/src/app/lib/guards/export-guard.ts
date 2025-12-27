import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { ExportAction } from '../enums/export-action.enum';
import { AdonisStoreService } from '../store/adonis-store.service';
import { rootPath } from './router.function';

export const canActivateExport: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const storeService = inject(AdonisStoreService);
    return storeService.selectedAction() === ExportAction.ExportFiles ? true : rootPath();
};
