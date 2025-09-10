import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportResults } from './import-results';

describe('ImportResults', () => {
  let component: ImportResults;
  let fixture: ComponentFixture<ImportResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
