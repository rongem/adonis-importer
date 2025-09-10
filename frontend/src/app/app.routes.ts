import { Routes } from '@angular/router';
import { CloakLogin } from './login/cloak-login/cloak-login';
import { CloakClassList } from './classes/cloak-class-list/cloak-class-list';
import { CloakClassContent } from './classes/cloak-class-content/cloak-class-content';
import { canActivateClasses } from './lib/guards/classes-auth-guard';
import { CloakExportFiles } from './export/cloak-export-files/cloak-export-files';
import { canActivateExport } from './lib/guards/export-guard';
import { canActivateImport } from './lib/guards/import-guard';
import { ChooseRepository } from './import/choose-repository/choose-repository';
import { canChooseRepository } from './lib/guards/choose-repository-guard';
import { CloakImportTable } from './import/cloak-import-table/cloak-import-table';
import { ImportResults } from './import/import-results/import-results';
import * as Constants from './lib/string.constants';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: Constants.login_url },
    { path: Constants.login_url, component: CloakLogin },
    { path: Constants.classes_url, canActivate: [canActivateClasses], children: [
        { path: '', pathMatch: 'full', component: CloakClassList },
        { path: ':id', component: CloakClassContent },
    ]},
    { path: Constants.export_files_url, component: CloakExportFiles, canActivate: [canActivateExport] },
    { path: Constants.choose_import_location_url, component: ChooseRepository, canActivate: [canChooseRepository] },
    { path: Constants.import_url, component: CloakImportTable, canActivate: [canActivateImport] },
    { path: Constants.import_results_url, component: ImportResults, canActivate: [canActivateImport] },
];
