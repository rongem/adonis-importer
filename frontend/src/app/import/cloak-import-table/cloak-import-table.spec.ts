import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloakImportTable } from './cloak-import-table';

describe('CloakImportTable', () => {
  let component: CloakImportTable;
  let fixture: ComponentFixture<CloakImportTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloakImportTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloakImportTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
