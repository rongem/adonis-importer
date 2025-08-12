import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ClassList } from '../../class-list/class-list';
import * as Selectors from '../../lib/store/store.selectors';
import { AdonisClass } from '../../lib/interfaces/adonis-class.interface';
import { ClassSelected } from '../../lib/store/store.actions';

@Component({
  selector: 'app-cloak-class-list',
  imports: [AsyncPipe, ClassList],
  templateUrl: './cloak-class-list.html',
  styleUrl: './cloak-class-list.scss'
})
export class CloakClassList {
  selectedClass?: AdonisClass = undefined;
  constructor(private store: Store) {}

  get notebooksReady() {
    return this.store.select(Selectors.notebooksReady);
  }

  get classes() {
    return this.store.select(Selectors.classes);
  }

  classSelected(selectedClass: AdonisClass) {
    this.store.dispatch(ClassSelected({selectedClass}));
  }
}
