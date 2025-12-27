import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdonisStoreService } from '../lib/store/adonis-store.service';
import { ApplicationStateService } from '../lib/store/application-state.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  adonisStore = inject(AdonisStoreService);
  appState = inject(ApplicationStateService);

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
  });
  retrieveLoginData() {
    this.appState.url.set(this.completeHostName(this.loginForm.value.url!));
    this.appState.basicAuth.set(btoa([this.loginForm.value.username, ':', this.loginForm.value.password].join('')));
    this.adonisStore.loadClasses();
  }

  private completeHostName = (value: string) => 'https://' + value + '/rest/';
}
