import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportFiles } from './export-files';

describe('ExportFiles', () => {
  let component: ExportFiles;
  let fixture: ComponentFixture<ExportFiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportFiles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportFiles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
