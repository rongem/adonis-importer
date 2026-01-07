import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of, tap } from 'rxjs';

import { ApplicationStateService } from './application-state.service';
import { ImportTableService } from './import-table.serivce';
import { WorkflowState } from '../enums/workflow-state.enum';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisNotebookGroup, AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { DataAccess } from '../data-access/data-access';
import { ExportAction } from '../enums/export-action.enum';
import { createColumnsFromProperties } from '../helpers/columns.functions';

import * as Constants from '../string.constants';

@Injectable({ providedIn: 'root' })
export class AdonisStoreService {
    // services
    private readonly appState = inject(ApplicationStateService);
    private readonly tableStore = inject(ImportTableService);
    private readonly router = inject(Router);
    private readonly dataAccess = inject(DataAccess);

    // state signals
    readonly url = signal<string | undefined>(undefined);
    readonly basicAuth = signal<string | undefined>(undefined);

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
    private readonly _selectedAction = signal<ExportAction | undefined>(undefined);
    readonly selectedAction = this._selectedAction.asReadonly();
    
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

    // start by loading all repository classes from ADONIS
    async loadClasses() {
        this._authenticated.set(true)
        this.appState.classesState.set(WorkflowState.Loading);
        this.appState.errorMessage.set(undefined);
        await firstValueFrom(this.dataAccess.retrieveClassesWithNotebooks(this.url()!).pipe(
            tap((repositoryClasses) => {
                this._repositoryClasses.set(repositoryClasses);
                this.appState.classesState.set(WorkflowState.Loaded);
                this.router.navigate([Constants.classes_url]);
                this.loadNotebooks();
                this.loadAttributes();
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this._authenticated.set(false);
                this.appState.classesState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Klassen: ${error.message}`);
                return of({} as AdonisClassContainer);
            }),
        ));
    }

    // after loading classes, load notebooks, attributes and repositories
    async loadNotebooks() {
        this.appState.notebookState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveNotebooksForClasses(this.classes()).pipe(
            tap((notebooks) => {
                const notebookContainer: AdonisNotebookContainer = {};
                for (const n of notebooks) {
                    const key = Object.keys(n)[0];
                    notebookContainer[key] = n[key];
                };
                this._notebooks.set(notebookContainer);
                this.appState.notebookState.set(WorkflowState.Loaded);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.notebookState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Notizbücher: ${error.message}`);
                return of({} as AdonisNotebookContainer);
            }),
        ));
    }
    
    async loadAttributes() {
        this.appState.attributesState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveAttributesForClasses(this.classes()).pipe(
            tap((attributeContainer) => {
                this._attributes.set(attributeContainer);
                this.appState.attributesState.set(WorkflowState.Loaded);
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.attributesState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Attribute: ${error.message}`);
                return of({} as AdonisAttributeContainer);
            }),
        ));
    }

    selectClass(selectedClass: AdonisClass) {
        this._selectedClass.set(selectedClass);
        this.router.navigate([Constants.classes_url, selectedClass.metaName]);
    }

    selectProperties(selectedProperties: AttributeOrRelation[]) {
        this._selectedProperties.set(selectedProperties);
        this.tableStore.setColumnDefinitions(createColumnsFromProperties(selectedProperties, this.attributes()));
    }

    selectAction(action: ExportAction) {
        this._selectedAction.set(action);
        switch (action) {
            case ExportAction.ExportFiles:
                this.router.navigate([Constants.export_files_url]);
                break;
            case ExportAction.ImportViaRest:
                this.router.navigate([Constants.choose_import_location_url]);
                break;
            default:
                this._selectedAction.set(undefined);
                this.router.navigateByUrl('/');
        }
    }
}