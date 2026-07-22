import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { ImportTableService } from '../../lib/store/import-table.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';
import { ImportPlan } from '../../lib/models/table/import-plan.model';

import { ImportTestTable } from './import-test-table';

describe('ImportTestTable', () => {
  let component: ImportTestTable;
  let fixture: ComponentFixture<ImportTestTable>;
  let tableStoreMock: {
    columnDefinitions: ReturnType<typeof vi.fn>;
    sortedColumnDefinitions: ReturnType<typeof vi.fn>;
    rowNumbers: ReturnType<typeof vi.fn>;
    rowErrors: ReturnType<typeof vi.fn>;
    cellInformations: ReturnType<typeof vi.fn>;
  };
  let importStoreMock: {
    items: ReturnType<typeof vi.fn>;
    previewPlan: ReturnType<typeof vi.fn>;
    canImport: ReturnType<typeof vi.fn>;
    selectedRepository: ReturnType<typeof vi.fn>;
    selectedObjectGroup: ReturnType<typeof vi.fn>;
  };
  let importWorkflowMock: { importCurrentTable: ReturnType<typeof vi.fn> };
  let adonisStoreMock: { selectedClass: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const columns = [
      {
        internalName: 'id',
        displayName: 'ID',
        ordinalPosition: 0,
        primary: true,
        unique: true,
        hasDefaultValue: false,
        isNullable: false,
        allowedTypes: ['STRING'],
        property: {},
      },
      {
        internalName: 'name',
        displayName: 'Name',
        ordinalPosition: 1,
        primary: false,
        unique: false,
        hasDefaultValue: true,
        isNullable: true,
        allowedTypes: ['STRING'],
        property: {},
      },
    ];

    const mockPlan: ImportPlan = {
      rows: [
        {
          rowNumber: 1,
          action: 'create',
          createObject: {
            metaName: 'C_TEST',
            name: 'New Item',
            groupId: 'group-1',
            attributes: [{ metaName: 'name', value: 'New Item' }],
          },
        },
        {
          rowNumber: 2,
          action: 'edit',
          editObject: {
            id: 'item-2',
            metaName: 'C_TEST',
            name: 'Existing Item',
            attributes: [{ metaName: 'name', value: 'Updated Item' }],
          },
          editObjectId: 'item-2',
        },
        {
          rowNumber: 3,
          action: 'skip',
          editObject: {
            id: 'item-3',
            metaName: 'C_TEST',
            name: 'Unchanged Item',
            attributes: [],
          },
          editObjectId: 'item-3',
        },
      ],
      relationsPhase: { status: 'unsupported', reason: 'Relations not supported' },
    };

    tableStoreMock = {
      columnDefinitions: vi.fn(() => columns),
      sortedColumnDefinitions: vi.fn(() => columns),
      rowNumbers: vi.fn(() => [0, 1, 2]),
      rowErrors: vi.fn(() => []),
      cellInformations: vi.fn(() => []),
    };

    importStoreMock = {
      items: vi.fn(() => [
        {
          id: 'item-2',
          metaName: 'C_TEST',
          name: 'Existing Item',
          type: 'Test',
          attributes: [{ metaName: 'name', value: 'Old Value' }],
          chainId: 'chain-2',
          groupId: 'group-1',
          link: { href: '' },
          icon: { href: '', rel: '' },
          relations: [],
        },
        {
          id: 'item-3',
          metaName: 'C_TEST',
          name: 'Unchanged Item',
          type: 'Test',
          attributes: [{ metaName: 'name', value: 'Unchanged Item' }],
          chainId: 'chain-3',
          groupId: 'group-1',
          link: { href: '' },
          icon: { href: '', rel: '' },
          relations: [],
        },
      ]),
      previewPlan: vi.fn(() => mockPlan),
      canImport: vi.fn(() => true),
      selectedRepository: vi.fn(() => ({ name: 'Repo A', id: 'repo-1' })),
      selectedObjectGroup: vi.fn(() => ({ name: 'Root', id: 'root' })),
    };

    importWorkflowMock = {
      importCurrentTable: vi.fn(),
    };

    adonisStoreMock = {
      selectedClass: vi.fn(() => ({ displayNames: { de: 'Prozess' }, metaName: 'C_PROCESS' })),
    };

    await TestBed.configureTestingModule({
      imports: [ImportTestTable],
      providers: [
        { provide: ApplicationStateService, useValue: { errorMessage: { set: vi.fn() } } },
        { provide: AdonisStoreService, useValue: adonisStoreMock },
        { provide: AdonisImportStoreService, useValue: importStoreMock },
        { provide: ImportTableService, useValue: tableStoreMock },
        { provide: AdonisImportWorkflowService, useValue: importWorkflowMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTestTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('builds preview rows from import plan', () => {
    const rows = component.previewRows();

    expect(rows).toHaveLength(3);
    expect(rows[0].action).toBe('create');
    expect(rows[0].name).toBe('New Item');
    expect(rows[1].action).toBe('edit');
    expect(rows[2].action).toBe('skip');
  });

  it('shows changed attributes for edit actions', () => {
    const rows = component.previewRows();
    const editRow = rows.find(r => r.action === 'edit');

    expect(editRow).toBeDefined();
    expect(editRow?.changedAttributes).toHaveLength(1);
    expect(editRow?.changedAttributes[0].oldValue).toBe('Old Value');
    expect(editRow?.changedAttributes[0].newValue).toBe('Updated Item');
  });

  it('shows new attributes for create actions', () => {
    const rows = component.previewRows();
    const createRow = rows.find(r => r.action === 'create');

    expect(createRow).toBeDefined();
    expect(createRow?.newAttributes).toHaveLength(1);
    expect(createRow?.newAttributes[0].value).toBe('New Item');
  });

  it('calculates summary correctly', () => {
    const summary = component.summary();

    expect(summary.create).toBe(1);
    expect(summary.edit).toBe(1);
    expect(summary.skip).toBe(1);
    expect(summary.error).toBe(0);
  });

  it('calls workflow import on onImport', () => {
    component.onImport();

    expect(importWorkflowMock.importCurrentTable).toHaveBeenCalledTimes(1);
  });

  it('renders the summary badges', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('+ 1 neu');
    expect(element.textContent).toContain('✎ 1 geändert');
    expect(element.textContent).toContain('= 1 unverändert');
  });

  it('renders the import button when canImport is true', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('button[type="button"]')).toBeTruthy();
  });

  it('does not render the import button when canImport is false', () => {
    importStoreMock.canImport = vi.fn(() => false);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button[type="button"]');

    expect(buttons.length).toBe(0);
  });

  it('clicking the import button triggers workflow import', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector('button');

    expect(button).toBeTruthy();
    (button as HTMLButtonElement).click();

    expect(importWorkflowMock.importCurrentTable).toHaveBeenCalledTimes(1);
  });
});

