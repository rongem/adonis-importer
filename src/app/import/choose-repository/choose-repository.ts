import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { repositories } from '../../lib/store/store.selectors';
import { SelectRepository } from '../../lib/store/store.actions';

@Component({
  selector: 'app-choose-repository',
  imports: [AsyncPipe],
  templateUrl: './choose-repository.html',
  styleUrl: './choose-repository.scss'
})
export class ChooseRepository {
    constructor(private store: Store, private router: Router) {}

    get repositories() {
      return this.store.select(repositories);
    }

    chooseRepository(value: string) {
      this.store.dispatch(SelectRepository({repositoryId: value.substring(1, value.length - 1)}));
      this.router.navigate(['choose-objectgroup']);
    }
}
