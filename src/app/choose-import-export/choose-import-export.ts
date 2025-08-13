import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActionSelected } from '../lib/store/store.actions';
import { ExportAction } from '../lib/enums/export-action.enum';

@Component({
  selector: 'app-choose-import-export',
  imports: [],
  templateUrl: './choose-import-export.html',
  styleUrl: './choose-import-export.scss'
})
export class ChooseImportExport {
    constructor(private store: Store) {}
    selectImport() {
      this.store.dispatch(ActionSelected({action: ExportAction.ImportViaRest}));
    }

    selectExport() {
      this.store.dispatch(ActionSelected({action: ExportAction.ExportFiles}));
    }
}
