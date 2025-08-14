import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as Selectors from '../../lib/store/store.selectors';
import * as StoreActions from '../../lib/store/store.actions';

@Component({
  selector: 'app-choose-repository',
  imports: [AsyncPipe],
  templateUrl: './choose-repository.html',
  styleUrl: './choose-repository.scss'
})
export class ChooseRepository {
    constructor(private store: Store, private router: Router) {}

    get repositories() {
      return this.store.select(Selectors.repositories);
    }

    get selectedRepository() {
      return this.store.select(Selectors.selectedRepository);
    }

    get objectGroups() {
      return this.store.select(Selectors.objectGroups);
    }

    chooseRepository(value: string) {
      this.store.dispatch(StoreActions.SelectRepository({repositoryId: value.substring(1, value.length - 1)}));
    }
}
