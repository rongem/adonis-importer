import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ImportTableService } from './import-table.service';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisNotebookGroup, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { createColumnsFromProperties } from '../helpers/columns.functions';

import * as Constants from '../string.constants';

@Injectable({ providedIn: 'root' })
export class AdonisStoreService {
    // services
    private readonly tableStore = inject(ImportTableService);
    private readonly router = inject(Router);

    // Purpose of the application usage
    private readonly _purpose = signal<'config' | 'import' | undefined>(undefined);
    readonly purpose = this._purpose.asReadonly();

    // state signals
    private readonly url = signal<string | undefined>(undefined);
    readonly restBaseUrl = this.url.asReadonly();
    private readonly _basicAuth = signal<string | undefined>(undefined);
    readonly basicAuth = this._basicAuth.asReadonly();

    private readonly _authenticated = signal(false);
    readonly authenticated = this._authenticated.asReadonly();
    private readonly _primaryLoadingComplete = signal(false);
    readonly primaryLoadingComplete = this._primaryLoadingComplete.asReadonly();
    private readonly _repositoryClasses = signal<AdonisClassContainer>({});
    readonly repositoryClasses = this._repositoryClasses.asReadonly();
    private readonly _notebooks = signal<AdonisNotebookContainer>({});
    readonly notebooks = this._notebooks.asReadonly();
    private readonly _attributes = signal<AdonisAttributeContainer>({});
    readonly attributes = this._attributes.asReadonly();
    private readonly _selectedClass = signal<AdonisClass | undefined>(undefined);
    readonly selectedClass = this._selectedClass.asReadonly();
    private readonly _selectedProperties = signal<AttributeOrRelation[]>([]);
    readonly selectedProperties = this._selectedProperties.asReadonly();
    
    // computed signals
    readonly classes = computed(() => Object.values(this.repositoryClasses()));
    readonly sortedClasses = computed(() => this.classes().sort((a, b) => a.displayNames.de > b.displayNames.de ? 1 : -1));
    readonly selectedNotebook = computed(() => {
        const cls = this.selectedClass();
        if (!cls || !this.notebooks()[cls.id]) return undefined;
        return this.notebooks()[cls.id];
    });
    readonly selectedClassesProperties = computed(() => this.selectedNotebook()!.chapters.map(chapter => {
        const properties: AttributeOrRelation[] = chapter.children.filter(c => c.type === Constants.GROUP).map(g => (g as AdonisNotebookGroup).children).flat();
        properties.push(...chapter.children.filter(c => c.type !== Constants.GROUP).map(p => (p as AttributeOrRelation)));
        return properties;
    }).flat());

    // selection methods
    classById(id: string) {
        return this.repositoryClasses()[id];
    }
    
    buildRestBaseUrl(value: string) {
        return 'https://' + value + '/rest/';
    }

    setSessionContext(baseUrl: string, username: string, password: string, purpose: 'config' | 'import') {
        this.url.set(baseUrl);
        this._basicAuth.set(btoa([username, ':', password].join('')));
        this._purpose.set(purpose);
    }

    setAuthenticated(value: boolean) {
        this._authenticated.set(value);
    }

    setRepositoryClasses(repositoryClasses: AdonisClassContainer) {
        this._repositoryClasses.set(repositoryClasses);
    }

    setNotebooks(notebooks: AdonisNotebookContainer) {
        this._notebooks.set(notebooks);
    }

    setAttributes(attributes: AdonisAttributeContainer) {
        this._attributes.set(attributes);
    }

    selectClass(selectedClass: AdonisClass) {
        this._selectedClass.set(selectedClass);
        this.router.navigate([Constants.classes_url, selectedClass.metaName]);
    }

    selectProperties(selectedProperties: AttributeOrRelation[]) {
        this._selectedProperties.set(selectedProperties);
        this.tableStore.setColumnDefinitions(createColumnsFromProperties(selectedProperties, this.attributes()));
    }

    selectAction() {
        switch (this.purpose()) {
            case 'config':
                this.router.navigate([Constants.export_files_url]);
                break;
            case 'import':
                this.router.navigate([Constants.choose_import_location_url]);
                break;
            default:
                this.router.navigateByUrl('/');
        }
    }
}