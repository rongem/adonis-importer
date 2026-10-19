import { computed, Injectable, signal } from '@angular/core';

import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisNotebookGroup, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';

import * as Constants from '../string.constants';

// what the application is used for in the current session
export type SessionPurpose = 'config' | 'import';

@Injectable({ providedIn: 'root' })
export class AdonisStoreService {
    // Purpose of the application usage
    private readonly _purpose = signal<SessionPurpose | undefined>(undefined);
    readonly purpose = this._purpose.asReadonly();

    // state signals
    private readonly url = signal<string | undefined>(undefined);
    readonly restBaseUrl = this.url.asReadonly();
    private readonly _basicAuth = signal<string | undefined>(undefined);
    readonly basicAuth = this._basicAuth.asReadonly();

    private readonly _authenticated = signal(false);
    readonly authenticated = this._authenticated.asReadonly();
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
    readonly sortedClasses = computed(() => this.classes().slice().sort((a, b) => a.displayNames.de.localeCompare(b.displayNames.de, 'de')));
    readonly selectedNotebook = computed(() => {
        const cls = this.selectedClass();
        if (!cls || !this.notebooks()[cls.id]) return undefined;
        return this.notebooks()[cls.id];
    });
    // empty as long as the notebook of the selected class is not loaded
    readonly selectedClassesProperties = computed(() => (this.selectedNotebook()?.chapters ?? []).map(chapter => {
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

    setSessionContext(baseUrl: string, username: string, password: string, purpose: SessionPurpose) {
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
    }

    selectProperties(selectedProperties: AttributeOrRelation[]) {
        this._selectedProperties.set(selectedProperties);
    }

}