import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTable } from './import-table';

describe('ImportTable', () => {
  let component: ImportTable;
  let fixture: ComponentFixture<ImportTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
