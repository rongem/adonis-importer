import { AsyncPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as StoreSelectors from '../../lib/store/store.selectors';

@Component({
  selector: 'app-import-results',
  imports: [AsyncPipe, NgClass],
  templateUrl: './import-results.html',
  styleUrl: './import-results.scss'
})
export class ImportResults {
  constructor(private store: Store) {}
  get importedRows() {
    return this.store.select(StoreSelectors.importedObjects);
  }

  getImportedRelationsForRow(row: number) {
    return this.store.select(StoreSelectors.importedRelationsForRow(row));
  }

  getRowErrors(row: number) {
    return this.store.select(StoreSelectors.importErrorForRow(row));
  }
  

}
