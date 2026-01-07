import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
  protected appState = inject(ApplicationStateService);
  private adonisStore = inject(AdonisStoreService);

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

  login() {
    this.setLoginState();
    this.adonisStore.loadClasses();
  }
  private completeHostName = (value: string) => 'https://' + value + '/rest/';

  private setLoginState() {
    this.adonisStore.url.set(this.completeHostName(this.loginForm.value.url!));
    this.adonisStore.basicAuth.set(btoa([this.loginForm.value.username, ':', this.loginForm.value.password].join('')));
  }
}
