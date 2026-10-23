import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataAccess } from '../data-access/data-access';
import { WorkflowState } from '../enums/workflow-state.enum';
import { ApplicationStateService } from '../store/application-state.service';
import { AdonisStoreService } from '../store/adonis-store.service';
import { ImportTableService } from '../store/import-table.service';
import { AdonisImportWorkflowService } from './adonis-import-workflow.service';
import { AdonisMetadataWorkflowService } from './adonis-metadata-workflow.service';

describe('AdonisMetadataWorkflowService', () => {
  let service: AdonisMetadataWorkflowService;
  let appState: ApplicationStateService;

  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let storeMock: {
    buildRestBaseUrl: ReturnType<typeof vi.fn>;
    setSessionContext: ReturnType<typeof vi.fn>;
    setAuthenticated: ReturnType<typeof vi.fn>;
    setRepositoryClasses: ReturnType<typeof vi.fn>;
    setNotebooks: ReturnType<typeof vi.fn>;
    setAttributes: ReturnType<typeof vi.fn>;
    classes: ReturnType<typeof vi.fn>;
    restBaseUrl: ReturnType<typeof vi.fn>;
    purpose: ReturnType<typeof vi.fn>;
    selectProperties: ReturnType<typeof vi.fn>;
    attributes: ReturnType<typeof vi.fn>;
  };
  let dataAccessMock: {
    resetTelemetry: ReturnType<typeof vi.fn>;
    getTelemetrySnapshot: ReturnType<typeof vi.fn>;
    retrieveClasses: ReturnType<typeof vi.fn>;
    retrieveNotebooksForClasses: ReturnType<typeof vi.fn>;
    retrieveAttributesForClasses: ReturnType<typeof vi.fn>;
  };
  let importWorkflowMock: {
    loadRepositories: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    storeMock = {
      buildRestBaseUrl: vi.fn((value: string) => `https://${value}/rest/`),
      setSessionContext: vi.fn(),
      setAuthenticated: vi.fn(),
      setRepositoryClasses: vi.fn(),
      setNotebooks: vi.fn(),
      setAttributes: vi.fn(),
      classes: vi.fn(() => []),
      restBaseUrl: vi.fn(() => 'https://example/rest/'),
      purpose: vi.fn(() => 'config' as const),
      selectProperties: vi.fn(),
      attributes: vi.fn(() => ({})),
    };

    dataAccessMock = {
      resetTelemetry: vi.fn(),
      getTelemetrySnapshot: vi.fn(() => ({
        queuedReadRequests: 0,
        queuedWriteRequests: 0,
        inflightReadHits: 0,
        readRetryAttempts: 0,
        readRetryByStatus: {},
        readRequestFailures: 0,
        writeRequestFailures: 0,
      })),
      retrieveClasses: vi.fn(() => of({})),
      retrieveNotebooksForClasses: vi.fn(() => of({})),
      retrieveAttributesForClasses: vi.fn(() => of({})),
    };

    importWorkflowMock = {
      loadRepositories: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AdonisMetadataWorkflowService,
        ApplicationStateService,
        { provide: Router, useValue: routerMock },
        { provide: AdonisStoreService, useValue: storeMock },
        { provide: DataAccess, useValue: dataAccessMock },
        { provide: AdonisImportWorkflowService, useValue: importWorkflowMock },
      ],
    });

    service = TestBed.inject(AdonisMetadataWorkflowService);
    appState = TestBed.inject(ApplicationStateService);
  });

  it('initializes session and loads metadata on success', async () => {
    const classesContainer = { CLASS_1: { id: 'CLASS_1' } };
    dataAccessMock.retrieveClasses.mockReturnValue(of(classesContainer));

    const loadNotebooksSpy = vi.spyOn(service, 'loadNotebooks').mockResolvedValue();
    const loadAttributesSpy = vi.spyOn(service, 'loadAttributes').mockResolvedValue();

    await service.initializeSession('tenant.example', 'user', 'secret', 'config');

    expect(storeMock.buildRestBaseUrl).toHaveBeenCalledWith('tenant.example');
    expect(storeMock.setSessionContext).toHaveBeenCalledWith('https://tenant.example/rest/', 'user', 'secret', 'config');
    expect(storeMock.setAuthenticated).toHaveBeenCalledWith(true);
    expect(dataAccessMock.resetTelemetry).toHaveBeenCalled();
    expect(storeMock.setRepositoryClasses).toHaveBeenCalledWith(classesContainer);
    expect(appState.classesState()).toBe(WorkflowState.Loaded);
    expect(routerMock.navigate).toHaveBeenCalled();
    expect(loadNotebooksSpy).toHaveBeenCalled();
    expect(loadAttributesSpy).toHaveBeenCalled();
    expect(importWorkflowMock.loadRepositories).not.toHaveBeenCalled();
  });

  it('loads repositories when initializing an import session', async () => {
    dataAccessMock.retrieveClasses.mockReturnValue(of({ CLASS_1: { id: 'CLASS_1' } }));

    const loadNotebooksSpy = vi.spyOn(service, 'loadNotebooks').mockResolvedValue();
    const loadAttributesSpy = vi.spyOn(service, 'loadAttributes').mockResolvedValue();

    await service.initializeSession('tenant.example', 'user', 'secret', 'import');

    expect(loadNotebooksSpy).toHaveBeenCalled();
    expect(loadAttributesSpy).toHaveBeenCalled();
    expect(importWorkflowMock.loadRepositories).toHaveBeenCalledTimes(1);
  });

  it('sets error state when class retrieval fails during initialization', async () => {
    dataAccessMock.retrieveClasses.mockReturnValue(
      throwError(() =>
        new HttpErrorResponse({
          status: 500,
          statusText: 'Server Error',
          url: 'https://tenant.example/rest/4.0/metamodel/classes',
        }),
      ),
    );

    await service.initializeSession('tenant.example', 'user', 'secret', 'config');

    expect(storeMock.setAuthenticated).toHaveBeenCalledWith(false);
    expect(storeMock.setAuthenticated).not.toHaveBeenCalledWith(true);
    expect(appState.classesState()).toBe(WorkflowState.ErrorOccured);
    expect(appState.errorMessage()).toContain('Fehler beim Laden der Klassen');
    expect(importWorkflowMock.loadRepositories).not.toHaveBeenCalled();
  });

  it('rejects refresh when session context is missing', async () => {
    storeMock.restBaseUrl.mockReturnValue(undefined);
    storeMock.purpose.mockReturnValue(undefined);

    await service.refreshMetamodel();

    expect(appState.errorMessage()).toContain('Verbindung nicht initialisiert');
    expect(dataAccessMock.retrieveClasses).not.toHaveBeenCalled();
  });

  it('does not load notebooks when session purpose is missing', async () => {
    storeMock.purpose.mockReturnValue(undefined);

    await service.loadNotebooks();

    expect(appState.errorMessage()).toContain('Zweck der Sitzung fehlt');
    expect(dataAccessMock.retrieveNotebooksForClasses).not.toHaveBeenCalled();
  });

  it('loads notebooks and keeps only importable properties for the session purpose', async () => {
    storeMock.purpose.mockReturnValue('import');
    storeMock.classes.mockReturnValue([{ id: 'CLASS_1' }]);
    dataAccessMock.retrieveNotebooksForClasses.mockReturnValue(of({
      CLASS_1: { chapters: [{ id: 'ch', children: [
        { id: 'name', type: 'ATTRDEF', ctrlType: 'STRING', properties: {} },
        { id: 'relation', type: 'RELATIONS', ctrlType: 'RELATIONS', properties: {} },
      ] }] },
    }));

    await service.loadNotebooks();

    const notebooks = storeMock.setNotebooks.mock.calls[0][0];
    expect(notebooks.CLASS_1.chapters[0].children.map((c: { id: string }) => c.id)).toEqual(['name']);
    expect(appState.notebookState()).toBe(WorkflowState.Loaded);
  });

  it('prepares the import table columns for the selected properties', () => {
    const properties = [
      { id: 'a-name', metaName: 'NAME', type: 'ATTRDEF', ctrlType: 'STRING', properties: {}, displayNames: { de: 'Name' } },
      { id: 'a-count', metaName: 'A_COUNT', type: 'ATTRDEF', ctrlType: 'INTEGER', properties: {}, displayNames: { de: 'Anzahl' } },
    ] as any[];

    service.selectProperties(properties);

    expect(storeMock.selectProperties).toHaveBeenCalledWith(properties);
    expect(TestBed.inject(ImportTableService).columnDefinitions().map(c => c.internalName)).toEqual(['NAME', 'A_COUNT']);
  });
});
