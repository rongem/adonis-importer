import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { DataAccess, DataAccessTelemetry } from '../data-access/data-access';
import { WorkflowState } from '../enums/workflow-state.enum';
import { AdonisNotebookContainer } from '../models/adonis-rest/metadata/container/container-notebook.interface';
import { AttributeOrRelation } from '../models/adonis-rest/metadata/notebook-elements.interface';
import { createColumnsFromProperties } from '../helpers/columns.functions';
import { errorText } from '../helpers/error.functions';
import { filterNotebook, isImportableClass } from '../helpers/metamodel-filter.functions';
import { AdonisStoreService, SessionPurpose } from '../store/adonis-store.service';
import { ApplicationStateService } from '../store/application-state.service';
import { ImportTableService } from '../store/import-table.service';
import { AdonisImportWorkflowService } from './adonis-import-workflow.service';
import * as Constants from '../string.constants';

@Injectable({ providedIn: 'root' })
export class AdonisMetadataWorkflowService {
    private readonly appState = inject(ApplicationStateService);
    private readonly adonisStore = inject(AdonisStoreService);
    private readonly tableStore = inject(ImportTableService);
    private readonly router = inject(Router);
    private readonly dataAccess = inject(DataAccess);
    private readonly importWorkflow = inject(AdonisImportWorkflowService);

    private telemetryBaseline() {
        return {
            startedAt: performance.now(),
            telemetry: this.dataAccess.getTelemetrySnapshot(),
        };
    }

    private telemetryDelta(current: DataAccessTelemetry, baseline: DataAccessTelemetry) {
        return {
            queuedReadRequests: current.queuedReadRequests - baseline.queuedReadRequests,
            queuedWriteRequests: current.queuedWriteRequests - baseline.queuedWriteRequests,
            inflightReadHits: current.inflightReadHits - baseline.inflightReadHits,
            readRetryAttempts: current.readRetryAttempts - baseline.readRetryAttempts,
            readRequestFailures: current.readRequestFailures - baseline.readRequestFailures,
            writeRequestFailures: current.writeRequestFailures - baseline.writeRequestFailures,
        };
    }

    private logPhaseTelemetry(phase: string, baseline: { startedAt: number; telemetry: DataAccessTelemetry; }) {
        const durationInMs = Math.round(performance.now() - baseline.startedAt);
        const current = this.dataAccess.getTelemetrySnapshot();
        const delta = this.telemetryDelta(current, baseline.telemetry);
        console.info(
            `[ADONIS][perf] ${phase}: ${durationInMs}ms | reads=${delta.queuedReadRequests} | inflightHits=${delta.inflightReadHits} | retries=${delta.readRetryAttempts} | readFailures=${delta.readRequestFailures}`,
        );
    }

    async initializeSession(url: string, username: string, password: string, purpose: SessionPurpose) {
        const baseUrl = this.adonisStore.buildRestBaseUrl(url);
        this.adonisStore.setSessionContext(baseUrl, username, password, purpose);
        this.adonisStore.setAuthenticated(false);
        this.dataAccess.resetTelemetry();
        this.appState.setState('classes', WorkflowState.Loading);
        this.appState.clearError();

        const classesTelemetry = this.telemetryBaseline();
        try {
            const repositoryClasses = await firstValueFrom(this.dataAccess.retrieveClasses(baseUrl, isImportableClass));
            // the first successful answer confirms the credentials
            this.adonisStore.setAuthenticated(true);
            this.adonisStore.setRepositoryClasses(repositoryClasses);
            this.appState.setState('classes', WorkflowState.Loaded);
            this.router.navigate([Constants.classes_url]);
            this.loadNotebooks();
            this.loadAttributes();
            if (purpose === 'import') {
                this.importWorkflow.loadRepositories();
            }
        } catch (error) {
            this.appState.reportError(`Fehler beim Laden der Klassen: ${errorText(error)}`, error, 'classes');
        }
        this.logPhaseTelemetry('classes', classesTelemetry);
    }

    async refreshMetamodel() {
        const baseUrl = this.adonisStore.restBaseUrl();
        const purpose = this.adonisStore.purpose();
        if (!baseUrl || !purpose) {
            this.appState.setError('Kein Metamodell-Refresh möglich: Verbindung nicht initialisiert.');
            return;
        }

        this.appState.setState('classes', WorkflowState.Loading);
        this.appState.setState('notebooks', WorkflowState.Loading);
        this.appState.setState('attributes', WorkflowState.Loading);

        const classesTelemetry = this.telemetryBaseline();
        try {
            const repositoryClasses = await firstValueFrom(this.dataAccess.retrieveClasses(baseUrl, isImportableClass));
            this.adonisStore.setRepositoryClasses(repositoryClasses);
            this.appState.setState('classes', WorkflowState.Loaded);
            this.loadNotebooks();
            this.loadAttributes();
        } catch (error) {
            this.appState.reportError(`Fehler beim Aktualisieren des Metamodells: ${errorText(error)}`, error, 'classes', 'notebooks', 'attributes');
        }
        this.logPhaseTelemetry('classes-refresh', classesTelemetry);
    }

    async loadNotebooks() {
        const purpose = this.adonisStore.purpose();
        if (!purpose) {
            this.appState.setError('Notizbücher können nicht geladen werden: Zweck der Sitzung fehlt.');
            return;
        }

        this.appState.setState('notebooks', WorkflowState.Loading);
        const notebooksTelemetry = this.telemetryBaseline();
        try {
            const notebooks = await firstValueFrom(this.dataAccess.retrieveNotebooksForClasses(this.adonisStore.classes()));
            const filteredNotebooks: AdonisNotebookContainer = {};
            Object.entries(notebooks).forEach(([classId, notebook]) => filteredNotebooks[classId] = filterNotebook(notebook, purpose));
            this.adonisStore.setNotebooks(filteredNotebooks);
            this.appState.setState('notebooks', WorkflowState.Loaded);
        } catch (error) {
            this.appState.reportError(`Fehler beim Laden der Notizbücher: ${errorText(error)}`, error, 'notebooks');
        }
        this.logPhaseTelemetry('notebooks', notebooksTelemetry);
    }

    async loadAttributes() {
        this.appState.setState('attributes', WorkflowState.Loading);
        const attributesTelemetry = this.telemetryBaseline();
        try {
            const attributeContainer = await firstValueFrom(this.dataAccess.retrieveAttributesForClasses(this.adonisStore.classes()));
            this.adonisStore.setAttributes(attributeContainer);
            this.appState.setState('attributes', WorkflowState.Loaded);
        } catch (error) {
            this.appState.reportError(`Fehler beim Laden der Attribute: ${errorText(error)}`, error, 'attributes');
        }
        this.logPhaseTelemetry('attributes', attributesTelemetry);
    }

    // remember the selected properties and prepare the import table columns for them
    selectProperties(properties: AttributeOrRelation[]) {
        this.adonisStore.selectProperties(properties);
        this.tableStore.setColumnDefinitions(createColumnsFromProperties(properties, this.adonisStore.attributes()));
    }
}
