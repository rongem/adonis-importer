import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ApplicationStateService } from '../lib/store/application-state.service';
import { AdonisMetadataWorkflowService } from '../lib/workflows/adonis-metadata-workflow.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './login.scss'
})
export class Login {
  protected appState = inject(ApplicationStateService);
  private readonly metadataWorkflow = inject(AdonisMetadataWorkflowService);

  loginForm = new FormGroup({
    url: new FormControl('',
      {
        validators: [
          Validators.required,
          Validators.pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/),
        ],
      }
    ),
    username: new FormControl('', {validators: [Validators.required]}),
    password: new FormControl('', {validators: [Validators.required]}),
    purpose: new FormControl<'config' | 'import'>('config', {validators: [Validators.required]})
  });

  login() {
    this.metadataWorkflow.initializeSession(this.loginForm.value.url!, this.loginForm.value.username!, this.loginForm.value.password!, this.loginForm.value.purpose!);
  }
}
