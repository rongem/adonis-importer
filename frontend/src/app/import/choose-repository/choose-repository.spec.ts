import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseRepository } from './choose-repository';

describe('ChooseRepository', () => {
  let component: ChooseRepository;
  let fixture: ComponentFixture<ChooseRepository>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseRepository]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseRepository);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
