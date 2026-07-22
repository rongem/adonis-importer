import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';

import { ImportResults } from './import-results';

describe('ImportResults', () => {
  let component: ImportResults;
  let fixture: ComponentFixture<ImportResults>;
  let storeMock: {
    succeededImports: ReturnType<typeof vi.fn>;
    importedRelationsForRow: ReturnType<typeof vi.fn>;
    importErrorsForRow: ReturnType<typeof vi.fn>;
  };

  const importedRows = [
    {
      id: '1',
      rowNumber: 1,
      className: 'C_PROCESS',
      name: 'Order Process',
      created: true,
      edited: false,
      attributes: [{ name: 'NAME', value: 'Order Process' }],
    },
    {
      id: '2',
      rowNumber: 2,
      className: 'C_PROCESS',
      name: 'Invoice Process',
      created: false,
      edited: true,
      attributes: [],
    },
  ];

  beforeEach(async () => {
    storeMock = {
      succeededImports: vi.fn(() => importedRows),
      importedRelationsForRow: vi.fn((row: number) => () => row === 2
        ? [{ fromClassName: 'A', fromName: 'One', toClassName: 'B', toName: 'Two', rowNumber: 2 }]
        : []),
      importErrorsForRow: vi.fn((row: number) => () => row === 2
        ? [{ row: 2, columnIndex: 3, msg: 'Ungültiger Wert' }]
        : []),
    };

    await TestBed.configureTestingModule({
      imports: [ImportResults],
      providers: [{ provide: AdonisImportStoreService, useValue: storeMock }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportResults);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('exposes imported rows from store', () => {
    expect(component.importedRows).toEqual(importedRows);
    expect(storeMock.succeededImports).toHaveBeenCalledTimes(1);
  });

  it('delegates relation and error lookups to the store', () => {
    const rowRelations = component.getImportedRelationsForRow(2);
    const rowErrors = component.getRowErrors(2);

    expect(storeMock.importedRelationsForRow).toHaveBeenCalledWith(2);
    expect(storeMock.importErrorsForRow).toHaveBeenCalledWith(2);
    expect(rowRelations.length).toBe(1);
    expect(rowErrors.length).toBe(1);
  });

  it('renders result summary and row details', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const successText = element.querySelector('.success')?.textContent ?? '';
    const listItems = element.querySelectorAll('li');

    expect(successText).toContain('2 Zeilen erfolgreich importiert');
    expect(listItems.length).toBeGreaterThanOrEqual(2);
    expect(element.textContent).toContain('1. C_PROCESS: Order Process');
    expect(element.textContent).toContain('2. C_PROCESS: Invoice Process');
    expect(element.textContent).toContain('Spalte 3: Ungültiger Wert');
  });

  it('does not mark row as error when no row errors exist', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const rowOneItem = Array.from(element.querySelectorAll('li')).find(li => li.textContent?.includes('1. C_PROCESS: Order Process'));
    expect(rowOneItem?.classList.contains('error')).toBe(false);
  });

  it('omits relation and error sections when stores return empty arrays', () => {
    storeMock.importedRelationsForRow.mockReturnValue(() => []);
    storeMock.importErrorsForRow.mockReturnValue(() => []);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Beziehungen');
    expect(text).not.toContain('Fehler');
  });

  it('renders zero-success summary for empty import result', async () => {
    storeMock.succeededImports.mockReturnValue([]);

    fixture = TestBed.createComponent(ImportResults);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('0 Zeilen erfolgreich importiert');
  });
});
