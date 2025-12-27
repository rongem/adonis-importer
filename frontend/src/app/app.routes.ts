import { Routes } from '@angular/router';
import { Login } from './login/login';
import { ClassList } from './classes/class-list/class-list';
import { ClassContent } from './classes/class-content/class-content';
import { canActivateClasses } from './lib/guards/classes-auth-guard';
import { ExportFiles } from './classes/export-files/export-files';
import { canActivateExport } from './lib/guards/export-guard';
import { canActivateImport } from './lib/guards/import-guard';
import { ChooseRepository } from './import/choose-repository/choose-repository';
import { canChooseRepository } from './lib/guards/choose-repository-guard';
import { ImportTable } from './import/import-table/import-table';
import { ImportResults } from './import/import-results/import-results';
import * as Constants from './lib/string.constants';
import { ImportTestTable } from './import/import-test-table copy/import-test-table';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: Constants.login_url },
    { path: Constants.login_url, component: Login },
    { path: Constants.classes_url, canActivate: [canActivateClasses], children: [
        { path: '', pathMatch: 'full', component: ClassList },
        { path: ':id', component: ClassContent },
    ]},
    { path: Constants.export_files_url, component: ExportFiles, canActivate: [canActivateExport] },
    { path: Constants.choose_import_location_url, component: ChooseRepository, canActivate: [canChooseRepository] },
    { path: Constants.import_url, component: ImportTable, canActivate: [canActivateImport] },
    { path: Constants.import_test_url, component: ImportTestTable, canActivate: [canActivateImport] },
    { path: Constants.import_results_url, component: ImportResults, canActivate: [canActivateImport] },
];
