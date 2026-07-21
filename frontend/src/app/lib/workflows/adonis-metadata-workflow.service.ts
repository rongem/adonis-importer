import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, of, tap } from 'rxjs';

import { DataAccess } from '../data-access/data-access';
import { WorkflowState } from '../enums/workflow-state.enum';
import { AdonisAttributeContainer } from '../models/adonis-rest/metadata/container/container-attribute.interface';
import { AdonisClassContainer } from '../models/adonis-rest/metadata/container/container-class.interface';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AdonisStoreService } from '../store/adonis-store.service';
import { ApplicationStateService } from '../store/application-state.service';
import * as Constants from '../string.constants';

@Injectable({ providedIn: 'root' })
export class AdonisMetadataWorkflowService {
    private readonly appState = inject(ApplicationStateService);
    private readonly adonisStore = inject(AdonisStoreService);
    private readonly router = inject(Router);
    private readonly dataAccess = inject(DataAccess);

    async initializeSession(url: string, username: string, password: string, purpose: 'config' | 'import') {
        const baseUrl = this.adonisStore.buildRestBaseUrl(url);
        this.adonisStore.setSessionContext(baseUrl, username, password, purpose);
        this.adonisStore.setAuthenticated(true);
        this.appState.classesState.set(WorkflowState.Loading);
        this.appState.errorMessage.set(undefined);

        await firstValueFrom(this.dataAccess.retrieveClassesWithNotebooks(baseUrl).pipe(
            tap((repositoryClasses) => {
                this.adonisStore.setRepositoryClasses(repositoryClasses);
                this.appState.classesState.set(WorkflowState.Loaded);
                this.router.navigate([Constants.classes_url]);
                this.loadNotebooks();
                this.loadAttributes();
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.adonisStore.setAuthenticated(false);
                this.appState.classesState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Laden der Klassen: ${error.message}`);
                return of({} as AdonisClassContainer);
            }),
        ));
    }

    async refreshMetamodel() {
        const baseUrl = this.adonisStore.restBaseUrl();
        const purpose = this.adonisStore.purpose();
        if (!baseUrl || !purpose) {
            this.appState.errorMessage.set('Kein Metamodell-Refresh möglich: Verbindung nicht initialisiert.');
            return;
        }

        this.appState.classesState.set(WorkflowState.Loading);
        this.appState.notebookState.set(WorkflowState.Loading);
        this.appState.attributesState.set(WorkflowState.Loading);

        await firstValueFrom(this.dataAccess.retrieveClassesWithNotebooks(baseUrl).pipe(
            tap((repositoryClasses) => {
                this.adonisStore.setRepositoryClasses(repositoryClasses);
                this.appState.classesState.set(WorkflowState.Loaded);
                this.loadNotebooks();
                this.loadAttributes();
            }),
            catchError((error: HttpErrorResponse) => {
                console.error(error);
                this.appState.classesState.set(WorkflowState.ErrorOccured);
                this.appState.notebookState.set(WorkflowState.ErrorOccured);
                this.appState.attributesState.set(WorkflowState.ErrorOccured);
                this.appState.errorMessage.set(`Fehler beim Aktualisieren des Metamodells: ${error.message}`);
                return of({} as AdonisClassContainer);
            }),
        ));
    }

    async loadNotebooks() {
        const purpose = this.adonisStore.purpose();
        if (!purpose) {
            this.appState.errorMessage.set('Notizbücher können nicht geladen werden: Zweck der Sitzung fehlt.');
            return;
        }

        this.appState.notebookState.set(WorkflowState.Loading);
        await firstValueFrom(this.dataAccess.retrieveNotebooksForClasses(this.adonisStore.classes(), purpose).pipe(
            tap((notebooks) => {
                const notebookContainer: AdonisNotebookContainer = {};
                for (const notebook of notebooks) {
                    const key = Object.keys(notebook)[0];
                    notebookContainer[key] = notebook[key];
                }
                this.adonisStore.setNotebooks(notebookContainer);
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
        await firstValueFrom(this.dataAccess.retrieveAttributesForClasses(this.adonisStore.classes()).pipe(
            tap((attributeContainer) => {
                this.adonisStore.setAttributes(attributeContainer);
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
}