import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionSelected } from '../lib/store/store.actions';
import { ExportAction } from '../lib/enums/export-action.enum';

@Component({
  selector: 'app-choose-import',
  imports: [],
  templateUrl: './choose-import.html',
  styleUrl: './choose-import.scss'
})
export class ChooseImport {
    constructor(private store: Store) {}
    selectImport() {
      this.store.dispatch(ActionSelected({action: ExportAction.ImportViaRest}));
    }

    selectExport() {
      this.store.dispatch(ActionSelected({action: ExportAction.ExportFiles}));
    }
}
