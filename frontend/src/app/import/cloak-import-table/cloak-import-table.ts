import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ImportTable } from "../import-table/import-table";
import * as Selectors from '../../lib/store/store.selectors';
import * as StoreActions from '../../lib/store/store.actions';

@Component({
  selector: 'app-cloak-import-table',
  imports: [AsyncPipe, ImportTable],
  templateUrl: './cloak-import-table.html',
  styleUrl: './cloak-import-table.scss'
})
export class CloakImportTable {
    constructor(private store: Store) {}
    get selectedClass() {
      return this.store.select(Selectors.selectedClass);
    }

    get selectedRepository() {
      return this.store.select(Selectors.selectedRepository);
    }

    get selectedObjectGroup() {
      return this.store.select(Selectors.selectedObjectGroup);
    }


}
