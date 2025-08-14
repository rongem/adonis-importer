import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ExportFiles } from '../export-files/export-files';
import * as Selectors from '../../lib/store/store.selectors';

@Component({
  selector: 'app-cloak-export-files',
  imports: [AsyncPipe, ExportFiles],
  templateUrl: './cloak-export-files.html',
  styleUrl: './cloak-export-files.scss'
})
export class CloakExportFiles {
  constructor(private store: Store) {}

  get selectedClass() {
    return this.store.select(Selectors.selectedClass);
  }
  get selectedProperties() {
    return this.store.select(Selectors.selectedProperties);
  }
  get attributes() {
    return this.store.select(Selectors.attributes);
  }


}
