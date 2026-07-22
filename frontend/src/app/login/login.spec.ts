import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApplicationStateService } from '../lib/store/application-state.service';
import { AdonisMetadataWorkflowService } from '../lib/workflows/adonis-metadata-workflow.service';

import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let appStateMock: { working: ReturnType<typeof vi.fn> };
  let workflowMock: { initializeSession: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    appStateMock = {
      working: vi.fn(() => false),
    };

    workflowMock = {
      initializeSession: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: ApplicationStateService, useValue: appStateMock },
        { provide: AdonisMetadataWorkflowService, useValue: workflowMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps start button disabled until form is valid', () => {
    fixture.detectChanges();
    let startButton = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(startButton.disabled).toBe(true);

    component.loginForm.patchValue({
      url: 'adonis.example.com',
      username: 'user1',
      password: 'secret',
      purpose: 'config',
    });
    fixture.detectChanges();

    startButton = (fixture.nativeElement as HTMLElement).querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(component.loginForm.valid).toBe(true);
    expect(startButton.disabled).toBe(false);
  });

  it('rejects invalid hostnames by pattern validator', () => {
    const urlControl = component.loginForm.get('url');
    urlControl?.setValue('https://bad-host');

    expect(urlControl?.valid).toBe(false);
  });

  it('calls metadata workflow with form values on login', () => {
    component.loginForm.setValue({
      url: 'adonis.example.com',
      username: 'demo-user',
      password: 'pw-123',
      purpose: 'config',
    });

    component.login();

    expect(workflowMock.initializeSession).toHaveBeenCalledWith('adonis.example.com', 'demo-user', 'pw-123', 'config');
  });
});
