import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ClassContent } from '../../classes/class-content/class-content';
import { AttributeOrRelation } from '../../lib/models/adonis-rest/metadata/notebook-elements.interface';
import { PropertiesSelected } from '../../lib/store/store.actions';
import * as Selectors from '../../lib/store/store.selectors';
import * as StoreActions from '../../lib/store/store.actions';
import { ExportAction } from '../../lib/enums/export-action.enum';

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

  actionSelected(action: ExportAction) {
    this.store.dispatch(StoreActions.ActionSelected({action}));
  }
}
