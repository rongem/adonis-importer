import { Routes } from '@angular/router';
import { CloakLogin } from './cloaks/cloak-login/cloak-login';
import { CloakClassList } from './cloaks/cloak-class-list/cloak-class-list';
import { CloakClassContent } from './cloaks/cloak-class-content/cloak-class-content';
import { canActivateClasses } from './lib/guards/classes-auth-guard';
import { ChooseImport } from './choose-import/choose-import';
import { CloakExportFiles } from './cloaks/cloak-export-files/cloak-export-files';
import { canActivateChoice } from './lib/guards/choice-auth-guard';
import { canActivateExport } from './lib/guards/export-auth-guard';
import { canActivateImport } from './lib/guards/import-auth-guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'login', component: CloakLogin },
    { path: 'classes', canActivate: [canActivateClasses], children: [
        { path: '', pathMatch: 'full', component: CloakClassList },
        { path: ':id', component: CloakClassContent },
    ]},
    { path: 'choose-export-import', component: ChooseImport, canActivate: [canActivateChoice] },
    { path: 'export-files', component: CloakExportFiles, canActivate: [canActivateExport] },
    // { path: 'import-rest', canActivate: [canActivateImport] },
];
