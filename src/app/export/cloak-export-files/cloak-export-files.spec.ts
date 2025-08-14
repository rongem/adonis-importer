import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloakExportFiles } from './cloak-export-files';

describe('CloakExportFiles', () => {
  let component: CloakExportFiles;
  let fixture: ComponentFixture<CloakExportFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloakExportFiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloakExportFiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
