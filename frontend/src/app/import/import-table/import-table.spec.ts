import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { ImportTableService } from '../../lib/store/import-table.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';

import { ImportTable } from './import-table';

describe('ImportTable', () => {
  let component: ImportTable;
  let fixture: ComponentFixture<ImportTable>;
  let columnMappings: number[];
  let tableStoreMock: {
    columnDefinitions: ReturnType<typeof vi.fn>;
    columnDefinitionByOriginalPosition: ReturnType<typeof vi.fn>;
    cellInformation: ReturnType<typeof vi.fn>;
    rowContainsErrors: ReturnType<typeof vi.fn>;
    errorsInRow: ReturnType<typeof vi.fn>;
    cellContainsRowError: ReturnType<typeof vi.fn>;
    columnMapping: ReturnType<typeof vi.fn>;
    changeColumnOrder: ReturnType<typeof vi.fn>;
    rowNumbers: ReturnType<typeof vi.fn>;
    contentsAreTested: ReturnType<typeof vi.fn>;
  };
  let importWorkflowMock: { testPrimaryInBackend: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    const columns = [
      {
        internalName: 'id',
        displayName: 'ID',
        primary: true,
        unique: true,
        hasDefaultValue: false,
        isNullable: false,
        allowedTypes: ['STRING'],
      },
      {
        internalName: 'name',
        displayName: 'Name',
        primary: false,
        unique: false,
        hasDefaultValue: true,
        isNullable: true,
        allowedTypes: ['STRING', 'LONGSTRING'],
      },
      {
        internalName: 'status',
        displayName: 'Status',
        primary: false,
        unique: false,
        hasDefaultValue: false,
        isNullable: true,
        allowedTypes: ['ENUM'],
      },
    ];

    columnMappings = [0, 1, 2];
    tableStoreMock = {
      columnDefinitions: vi.fn(() => columns),
      columnDefinitionByOriginalPosition: vi.fn((columnPosition: number) => () => columns[columnPosition]),
      cellInformation: vi.fn(() => () => undefined),
      rowContainsErrors: vi.fn(() => () => false),
      errorsInRow: vi.fn(() => () => []),
      cellContainsRowError: vi.fn(() => () => []),
      columnMapping: vi.fn(() => columnMappings),
      changeColumnOrder: vi.fn((mappings: number[]) => {
        columnMappings = mappings;
      }),
      rowNumbers: vi.fn(() => []),
      contentsAreTested: vi.fn(() => false),
    };

    importWorkflowMock = {
      testPrimaryInBackend: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImportTable],
      providers: [
        { provide: ApplicationStateService, useValue: { errorMessage: { set: vi.fn() } } },
        { provide: AdonisStoreService, useValue: { selectedClass: vi.fn(() => ({ displayNames: { de: 'Klasse' }, metaName: 'C_TEST' })) } },
        { provide: AdonisImportStoreService, useValue: { selectedRepository: vi.fn(() => ({ name: 'Repo' })), selectedObjectGroup: vi.fn(() => ({ name: 'Group' })), advancedTestingStarted: vi.fn(() => false) } },
        { provide: ImportTableService, useValue: tableStoreMock },
        { provide: AdonisImportWorkflowService, useValue: importWorkflowMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTable);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates descriptive column title with constraints and allowed types', () => {
    const title = component.getColumnTitle(0);

    expect(title).toContain('id');
    expect(title).toContain('Primäerschlüssel');
    expect(title).toContain('Muss eindeutig sein');
    expect(title).toContain('Erlaubte Datentypen: STRING');
  });

  it('moves a column left when possible', () => {
    component.moveColumnLeft(1);

    expect(tableStoreMock.changeColumnOrder).toHaveBeenCalledWith([1, 0, 2]);
  });

  it('does not move the first column further left', () => {
    component.moveColumnLeft(0);

    expect(tableStoreMock.changeColumnOrder).not.toHaveBeenCalled();
  });

  it('moves a column right when possible', () => {
    component.moveColumnRight(1);

    expect(tableStoreMock.changeColumnOrder).toHaveBeenCalledWith([0, 2, 1]);
  });

  it('reorders columns on drop and clears drag state', () => {
    (component as any).sourceIndex = 0;
    (component as any).presumedTargetIndex = 2;

    component.onDrop(2);

    expect(tableStoreMock.changeColumnOrder).toHaveBeenCalledWith([1, 2, 0]);
    expect((component as any).sourceIndex).toBeUndefined();
    expect((component as any).presumedTargetIndex).toBeUndefined();
  });

  it('starts backend testing through the import workflow', () => {
    component.onStartAdvancedTesting();

    expect(importWorkflowMock.testPrimaryInBackend).toHaveBeenCalledTimes(1);
  });
});
