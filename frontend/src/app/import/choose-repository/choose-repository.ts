import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Selectors from '../../lib/store/store.selectors';
import * as StoreActions from '../../lib/store/store.actions';
import { ChooseObjectgroup } from '../choose-objectgroup/choose-objectgroup';

@Component({
  selector: 'app-choose-repository',
  imports: [AsyncPipe, ChooseObjectgroup],
  templateUrl: './choose-repository.html',
  styleUrl: './choose-repository.scss'
})
export class ChooseRepository {
    constructor(private store: Store) {}

    get repositories() {
      return this.store.select(Selectors.repositories);
    }

    get selectedRepository() {
      return this.store.select(Selectors.selectedRepository);
    }

    get objectGroups() {
      return this.store.select(Selectors.objectGroups);
    }

    get selectedObjectGroup() {
      return this.store.select(Selectors.selectedObjectGroup);
    }

    chooseRepository(repositoryId: string) {
      this.store.dispatch(StoreActions.SelectRepository({repositoryId}));
    }
}
