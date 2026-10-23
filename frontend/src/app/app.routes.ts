import { Routes } from '@angular/router';
import { Login } from './login/login';
import { ClassList } from './classes/class-list/class-list';
import { ClassContent } from './classes/class-content/class-content';
import { canActivateClasses } from './lib/guards/classes-auth-guard';
import { ExportFiles } from './classes/export-files/export-files';
import { canActivateExport } from './lib/guards/export-guard';
import { canActivateImport } from './lib/guards/import-guard';
import { canChooseRepository } from './lib/guards/choose-repository-guard';
import * as Constants from './lib/string.constants';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: Constants.login_url },
    { path: Constants.login_url, component: Login },
    { path: Constants.classes_url, canActivate: [canActivateClasses], children: [
        { path: '', pathMatch: 'full', component: ClassList },
        { path: ':id', component: ClassContent },
    ]},
    { path: Constants.export_files_url, component: ExportFiles, canActivate: [canActivateExport] },
    // the direct import is switched off by a feature flag, so its pages are loaded only when needed
    {
        path: Constants.choose_import_location_url,
        canActivate: [canChooseRepository],
        loadComponent: () => import('./import/choose-repository/choose-repository').then(m => m.ChooseRepository),
    },
    {
        path: Constants.import_url,
        canActivate: [canActivateImport],
        loadComponent: () => import('./import/import-table/import-table').then(m => m.ImportTable),
    },
    {
        path: Constants.import_test_url,
        canActivate: [canActivateImport],
        loadComponent: () => import('./import/import-test-table/import-test-table').then(m => m.ImportTestTable),
    },
    {
        path: Constants.import_results_url,
        canActivate: [canActivateImport],
        loadComponent: () => import('./import/import-results/import-results').then(m => m.ImportResults),
    },
];
