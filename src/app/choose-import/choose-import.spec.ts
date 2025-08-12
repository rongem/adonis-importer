import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseImport } from './choose-import';

describe('ChooseImport', () => {
  let component: ChooseImport;
  let fixture: ComponentFixture<ChooseImport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseImport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseImport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
