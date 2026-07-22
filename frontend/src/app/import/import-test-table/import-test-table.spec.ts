import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { ImportTableService } from '../../lib/store/import-table.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';

import { ImportTestTable } from './import-test-table';

describe('ImportTestTable', () => {
  let component: ImportTestTable;
  let fixture: ComponentFixture<ImportTestTable>;
  let canImportValue: boolean;
  let tableStoreMock: {
    columnDefinitions: ReturnType<typeof vi.fn>;
    columnDefinitionByOriginalPosition: ReturnType<typeof vi.fn>;
    cellInformation: ReturnType<typeof vi.fn>;
    rowContainsErrors: ReturnType<typeof vi.fn>;
    errorsInRow: ReturnType<typeof vi.fn>;
    cellContainsRowError: ReturnType<typeof vi.fn>;
    columnMapping: ReturnType<typeof vi.fn>;
    rowNumbers: ReturnType<typeof vi.fn>;
  };
  let importStoreMock: {
    selectedRepository: ReturnType<typeof vi.fn>;
    selectedObjectGroup: ReturnType<typeof vi.fn>;
    rowsWithExistingItems: ReturnType<typeof vi.fn>;
    canImport: ReturnType<typeof vi.fn>;
  };
  let importWorkflowMock: { importCurrentTable: ReturnType<typeof vi.fn> };

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
        allowedTypes: ['STRING'],
      },
    ];

    canImportValue = true;
    tableStoreMock = {
      columnDefinitions: vi.fn(() => columns),
      columnDefinitionByOriginalPosition: vi.fn((columnPosition: number) => () => columns[columnPosition]),
      cellInformation: vi.fn(() => () => undefined),
      rowContainsErrors: vi.fn(() => () => false),
      errorsInRow: vi.fn(() => () => []),
      cellContainsRowError: vi.fn(() => () => []),
      columnMapping: vi.fn(() => [0, 1]),
      rowNumbers: vi.fn(() => [0]),
    };

    importStoreMock = {
      selectedRepository: vi.fn(() => ({ name: 'Repo A' })),
      selectedObjectGroup: vi.fn(() => ({ name: 'Root Group' })),
      rowsWithExistingItems: vi.fn(() => []),
      canImport: vi.fn(() => canImportValue),
    };

    importWorkflowMock = {
      importCurrentTable: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ImportTestTable],
      providers: [
        { provide: ApplicationStateService, useValue: { errorMessage: { set: vi.fn() } } },
        { provide: AdonisStoreService, useValue: { selectedClass: vi.fn(() => ({ displayNames: { de: 'Klasse' }, metaName: 'C_TEST' })) } },
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

  it('builds the expected column title text', () => {
    const title = component.getColumnTitle(0);

    expect(title).toContain('id');
    expect(title).toContain('Primäerschlüssel');
    expect(title).toContain('Muss eindeutig sein');
  });

  it('calls workflow import on onImport', () => {
    component.onImport();

    expect(importWorkflowMock.importCurrentTable).toHaveBeenCalledTimes(1);
  });

  it('renders the import button when canImport is true', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Starte Import');
  });

  it('does not render the import button when canImport is false', () => {
    canImportValue = false;
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).not.toContain('Starte Import');
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
