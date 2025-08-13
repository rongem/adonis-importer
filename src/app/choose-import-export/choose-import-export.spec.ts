import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseImportExport } from './choose-import-export';

describe('ChooseImport', () => {
  let component: ChooseImportExport;
  let fixture: ComponentFixture<ChooseImportExport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseImportExport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseImportExport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
