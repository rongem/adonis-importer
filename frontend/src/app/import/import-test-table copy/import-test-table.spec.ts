import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportTestTable } from './import-test-table';

describe('ImportTable', () => {
  let component: ImportTestTable;
  let fixture: ComponentFixture<ImportTestTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportTestTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportTestTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
