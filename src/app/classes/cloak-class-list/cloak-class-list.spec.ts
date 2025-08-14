import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloakClassList } from './cloak-class-list';

describe('CloakClassList', () => {
  let component: CloakClassList;
  let fixture: ComponentFixture<CloakClassList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloakClassList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloakClassList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
