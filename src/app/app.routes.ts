import { Routes } from '@angular/router';
import { CloakLogin } from './login/cloak-login/cloak-login';
import { CloakClassList } from './classes/cloak-class-list/cloak-class-list';
import { CloakClassContent } from './classes/cloak-class-content/cloak-class-content';
import { canActivateClasses } from './lib/guards/classes-auth-guard';
import { CloakExportFiles } from './export/cloak-export-files/cloak-export-files';
import { canActivateExport } from './lib/guards/export-auth-guard';
import { canActivateImport } from './lib/guards/import-auth-guard';
import { ChooseRepository } from './import/choose-repository/choose-repository';
import { choose_import_location_url, classes_url, export_files_url, login_url } from './lib/string.constants';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: login_url },
    { path: login_url, component: CloakLogin },
    { path: classes_url, canActivate: [canActivateClasses], children: [
        { path: '', pathMatch: 'full', component: CloakClassList },
        { path: ':id', component: CloakClassContent },
    ]},
    { path: export_files_url, component: CloakExportFiles, canActivate: [canActivateExport] },
    { path: choose_import_location_url, component: ChooseRepository, canActivate: [canActivateImport] },
    // { path: 'import-rest', canActivate: [canActivateImport] },
];
