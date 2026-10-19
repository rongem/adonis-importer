import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DataAccess } from '../data-access/data-access';
import { WorkflowState } from '../enums/workflow-state.enum';
import { AdonisClass } from '../models/adonis-rest/metadata/class.interface';
import { AdonisObjectGroup } from '../models/adonis-rest/metadata/object-group.interface';
import { AdonisItem } from '../models/adonis-rest/read/item.interface';
import { CreateObjectResponse } from '../models/adonis-rest/write/object-response.interface';
import { CellContent } from '../models/table/cellcontent.model';
import { CellInformation } from '../models/table/cellinformation.model';
import { Column } from '../models/table/column.model';
import { ImportPlan } from '../models/table/import-plan.model';
import { AdonisImportStoreService } from '../store/adonis-import-store.service';
import { AdonisStoreService } from '../store/adonis-store.service';
import { ApplicationStateService } from '../store/application-state.service';
import { ImportTableService } from '../store/import-table.service';
import * as Constants from '../string.constants';
import { AdonisImportWorkflowService } from './adonis-import-workflow.service';

const column = (internalName: string, ordinalPosition: number, allowedTypes: string[], primary = false): Column => ({
  displayName: internalName,
  internalName,
  ordinalPosition,
  hasDefaultValue: false,
  isNullable: !primary,
  primary,
  unique: primary,
  allowedTypes,
  property: {},
});

const columns = [column('NAME', 0, ['string'], true), column('A_DESCRIPTION', 1, ['string']), column('A_COUNT', 2, ['number'])];

const tableRows = [
  ['Neue App', 'Beschreibung neu', '1'],
  ['Geänderte App', 'Beschreibung neu', '2'],
  ['Unveränderte App', 'Beschreibung alt', '3'],
];

const cellInformations = (rows: string[][]) =>
  rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => new CellInformation(new CellContent(value, rowIndex, columnIndex), columns[columnIndex])));

const existingItem = (id: string, name: string, attributes: Record<string, string | number>) => ({
  id,
  name,
  metaName: 'C_APPLICATION',
  attributes: Object.entries(attributes).map(([metaName, value]) => ({ metaName, value })),
}) as unknown as AdonisItem;

const existingItems = [
  existingItem('id-changed', 'Geänderte App', { A_DESCRIPTION: 'Beschreibung alt', A_COUNT: 2 }),
  existingItem('id-unchanged', 'Unveränderte App', { A_DESCRIPTION: 'Beschreibung alt', A_COUNT: 3 }),
];

const selectedClass = { id: 'class-1', metaName: 'C_APPLICATION', displayNames: { de: 'Anwendung' } } as AdonisClass;
const objectGroup = { id: 'group-1', name: 'Anwendungen' } as AdonisObjectGroup;

const response = (id: string, name: string, groupId?: string): CreateObjectResponse => ({
  locale: 'de',
  item: { id, name, metaName: 'C_APPLICATION', type: 'Anwendung', groupId, attributes: [{ metaName: 'A_COUNT', value: '1' }] },
});

describe('AdonisImportWorkflowService', () => {
  let service: AdonisImportWorkflowService;
  let appState: ApplicationStateService;
  let adonisStore: AdonisStoreService;
  let importStore: AdonisImportStoreService;
  let tableStore: ImportTableService;
  let routerMock: { navigate: ReturnType<typeof vi.fn> };
  let dataAccessMock: {
    retrieveObjectGroupStructure: ReturnType<typeof vi.fn>;
    retrieveSearchObjects: ReturnType<typeof vi.fn>;
    createObject: ReturnType<typeof vi.fn>;
    editObject: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    routerMock = { navigate: vi.fn() };
    dataAccessMock = {
      // selecting a repository loads the object groups in the background; not needed here
      retrieveObjectGroupStructure: vi.fn(() => NEVER),
      retrieveSearchObjects: vi.fn(() => of(existingItems)),
      createObject: vi.fn((_baseUrl: string, _repoId: string, newObject: { name: string }) => of(response('id-new', newObject.name, 'group-1'))),
      editObject: vi.fn((_baseUrl: string, _repoId: string, editObject: { name: string }, id: string) => of(response(id, editObject.name, 'group-1'))),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: DataAccess, useValue: dataAccessMock },
      ],
    });

    service = TestBed.inject(AdonisImportWorkflowService);
    appState = TestBed.inject(ApplicationStateService);
    adonisStore = TestBed.inject(AdonisStoreService);
    importStore = TestBed.inject(AdonisImportStoreService);
    tableStore = TestBed.inject(ImportTableService);
  });

  const prepareImportContext = () => {
    adonisStore.setSessionContext('https://example/rest/', 'user', 'secret', 'import');
    adonisStore.selectClass(selectedClass);
    importStore.selectRepository('repo-1');
    importStore.selectObjectGroup(objectGroup);
    tableStore.setColumnDefinitions(columns);
    tableStore.setCellContents(tableRows.flatMap((row, rowIndex) => row.map((value, columnIndex) => new CellContent(value, rowIndex, columnIndex))));
  };

  describe('createImportPlan', () => {
    const plan = () => service.createImportPlan(cellInformations(tableRows), [0, 1, 2], selectedClass, 'group-1', existingItems);

    it('creates objects that do not exist yet in the target group', () => {
      expect(plan().rows[0]).toEqual({
        rowNumber: 0,
        action: 'create',
        createObject: {
          metaName: 'C_APPLICATION',
          name: 'Neue App',
          groupId: 'group-1',
          attributes: [
            { metaName: 'A_DESCRIPTION', value: 'Beschreibung neu' },
            { metaName: 'A_COUNT', value: '1' },
          ],
        },
      });
    });

    it('edits existing objects with changed attributes only', () => {
      expect(plan().rows[1]).toEqual({
        rowNumber: 1,
        action: 'edit',
        editObjectId: 'id-changed',
        editObject: {
          id: 'id-changed',
          name: 'Geänderte App',
          metaName: 'C_APPLICATION',
          attributes: [{ metaName: 'A_DESCRIPTION', value: 'Beschreibung neu' }],
        },
      });
    });

    it('skips existing objects without changes', () => {
      expect(plan().rows[2]).toEqual(expect.objectContaining({ rowNumber: 2, action: 'skip', skipReason: 'unchanged', editObjectId: 'id-unchanged' }));
    });

    it('writes attributes that the existing object does not have yet', () => {
      const items = [existingItem('id-changed', 'Geänderte App', { A_COUNT: 2 })];
      const row = service.createImportPlan(cellInformations([tableRows[1]]), [0], selectedClass, 'group-1', items).rows[0];

      expect(row.action).toBe('edit');
      expect(row.editObject!.attributes).toEqual([{ metaName: 'A_DESCRIPTION', value: 'Beschreibung neu' }]);
    });

    it('does not import empty cells, so existing values stay unchanged', () => {
      const rows = [['Neue App', '', '5'], ['Geänderte App', '', '2']];
      const importPlan = service.createImportPlan(cellInformations(rows), [0, 1], selectedClass, 'group-1', existingItems);

      expect(importPlan.rows[0].createObject!.attributes).toEqual([{ metaName: 'A_COUNT', value: '5' }]);
      expect(importPlan.rows[1]).toEqual(expect.objectContaining({ action: 'skip', skipReason: 'unchanged' }));
    });

    it('detects unchanged numbers delivered as strings by ADONIS', () => {
      const items = [existingItem('id-changed', 'Geänderte App', { A_DESCRIPTION: 'Beschreibung neu', A_COUNT: '2' })];
      const row = service.createImportPlan(cellInformations([tableRows[1]]), [0], selectedClass, 'group-1', items).rows[0];

      expect(row.action).toBe('skip');
    });

    it('marks relations as unsupported', () => {
      expect(plan().relationsPhase.status).toBe('unsupported');
    });
  });

  describe('executeImportPlan', () => {
    it('reports a missing import context without calling ADONIS', async () => {
      const importPlan: ImportPlan = { rows: [], relationsPhase: { status: 'unsupported', reason: '' } };

      const result = await service.executeImportPlan(importPlan);

      expect(result.objectPhase.status).toBe('failed');
      expect(result.objectPhase.errors[0].msg).toContain('Kein gültiger Import-Kontext');
      expect(importStore.importErrors()).toEqual(result.objectPhase.errors);
      expect(appState.targetState()).toBe(WorkflowState.ErrorOccured);
      expect(dataAccessMock.createObject).not.toHaveBeenCalled();
    });

    it('creates and edits objects, skips unchanged ones and stores the results', async () => {
      prepareImportContext();
      const importPlan = service.createImportPlan(tableStore.cellInformations(), tableStore.rowNumbers(), selectedClass, 'group-1', existingItems);

      const result = await service.executeImportPlan(importPlan);

      expect(routerMock.navigate).toHaveBeenCalledWith([Constants.import_results_url]);
      expect(dataAccessMock.createObject).toHaveBeenCalledTimes(1);
      expect(dataAccessMock.createObject).toHaveBeenCalledWith('https://example/rest/', 'repo-1', importPlan.rows[0].createObject);
      expect(dataAccessMock.editObject).toHaveBeenCalledTimes(1);
      expect(dataAccessMock.editObject).toHaveBeenCalledWith('https://example/rest/', 'repo-1', importPlan.rows[1].editObject, 'id-changed');
      expect(result.objectPhase.status).toBe('completed');
      expect(importStore.importing()).toBe(false);
      expect(importStore.succeededImports().map(entry => [entry.rowNumber, entry.name, entry.created, entry.edited])).toEqual([
        [0, 'Neue App', true, false],
        [1, 'Geänderte App', false, true],
      ]);
      expect(importStore.importErrors()).toEqual([]);
    });

    it('collects errors per row and translates missing write permissions', async () => {
      prepareImportContext();
      dataAccessMock.createObject.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, statusText: 'Forbidden' })));
      dataAccessMock.editObject.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error', url: 'https://example/rest/' })));
      const importPlan = service.createImportPlan(tableStore.cellInformations(), tableStore.rowNumbers(), selectedClass, 'group-1', existingItems);

      const result = await service.executeImportPlan(importPlan);

      expect(result.objectPhase.status).toBe('failed');
      expect(importStore.importErrors().map(error => error.row)).toEqual([0, 1]);
      expect(importStore.importErrors()[0].msg).toBe('Keine Schreibrechte');
      expect(importStore.importErrors()[1].msg).toContain('500');
      expect(importStore.succeededImports()).toEqual([]);
    });
  });

  describe('testPrimaryInBackend', () => {
    it('searches existing objects by name and builds the preview plan', async () => {
      prepareImportContext();

      await service.testPrimaryInBackend();

      const [baseUrl, repositoryId, queryString] = dataAccessMock.retrieveSearchObjects.mock.calls[0];
      expect([baseUrl, repositoryId]).toEqual(['https://example/rest/', 'repo-1']);
      expect(JSON.parse(decodeURIComponent(queryString))).toEqual({
        filters: [
          { className: 'C_APPLICATION' },
          { attrName: 'NAME', op: 'OP_EQ', values: ['Neue App', 'Geänderte App', 'Unveränderte App'] },
        ],
      });
      expect(importStore.items()).toEqual(existingItems);
      expect(importStore.previewPlan()!.rows.map(row => row.action)).toEqual(['create', 'edit', 'skip']);
      expect(importStore.canImport()).toBe(true);
      expect(appState.itemsState()).toBe(WorkflowState.Loaded);
    });

    it('reports search errors', async () => {
      prepareImportContext();
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      dataAccessMock.retrieveSearchObjects.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })));

      await service.testPrimaryInBackend();

      expect(appState.errorMessage()).toContain('Fehler beim Überprüfen der Primärschlüssel');
      expect(importStore.items()).toEqual([]);
    });
  });
});
