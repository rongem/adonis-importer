import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseObjectgroup } from './choose-objectgroup';

describe('ChooseObjectgroup', () => {
  let component: ChooseObjectgroup;
  let fixture: ComponentFixture<ChooseObjectgroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseObjectgroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseObjectgroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
