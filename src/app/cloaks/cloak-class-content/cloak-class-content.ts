import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ClassContent } from '../../class-content/class-content';
import * as Selectors from '../../lib/store/store.selectors';
import { AttributeOrRelation } from '../../lib/interfaces/adonis-notebook-elements.interface';
import { PropertiesSelected } from '../../lib/store/store.actions';

@Component({
  selector: 'app-cloak-class-content',
  imports: [AsyncPipe, ClassContent],
  templateUrl: './cloak-class-content.html',
  styleUrl: './cloak-class-content.scss'
})
export class CloakClassContent {
  constructor(private store: Store) {}

  get selectedClass() {
    return this.store.select(Selectors.selectedClass);
  }

  get selectedNotebook() {
    return this.store.select(Selectors.selectedNotebook);
  }

  propertiesSelected(properties: AttributeOrRelation[]) {
    this.store.dispatch(PropertiesSelected({properties}));
  }

}
