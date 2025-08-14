import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppSettings } from '../../lib/app-settings';
import * as StoreActions from '../../lib/store/store.actions';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  constructor(private store: Store) {}

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
    AppSettings.Url = this.completeHostName(this.loginForm.value.url!);
    AppSettings.basicAuth = btoa([this.loginForm.value.username, ':', this.loginForm.value.password].join(''));
    this.store.dispatch(StoreActions.LoadClasses());
  }

  private completeHostName = (value: string) => 'https://' + value + '/rest/';
}
