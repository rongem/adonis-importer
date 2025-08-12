import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloakClassContent } from './cloak-class-content';

describe('CloakClassContent', () => {
  let component: CloakClassContent;
  let fixture: ComponentFixture<CloakClassContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloakClassContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloakClassContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
