import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import * as Selectors from '../../lib/store/store.selectors';
import { Login } from '../login/login';

@Component({
  selector: 'app-cloak-login',
  imports: [AsyncPipe, Login],
  templateUrl: './cloak-login.html',
  styleUrl: './cloak-login.scss'
})
export class CloakLogin {
  constructor(private store: Store) {}
  get working() {
    return this.store.select(Selectors.working);
  }


}
