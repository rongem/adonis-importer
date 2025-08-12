import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloakLogin } from './cloak-login';

describe('CloakLogin', () => {
  let component: CloakLogin;
  let fixture: ComponentFixture<CloakLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloakLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloakLogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
