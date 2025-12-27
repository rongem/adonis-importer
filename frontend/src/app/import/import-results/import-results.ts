import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';

@Component({
  selector: 'app-import-results',
  imports: [NgClass],
  templateUrl: './import-results.html',
  styleUrl: './import-results.scss'
})
export class ImportResults {
  private readonly store = inject(AdonisImportStoreService);
  get importedRows() {
    return this.store.succeededImports();
  }

  getImportedRelationsForRow(row: number) {
    return this.store.importedRelationsForRow(row)();
  }

  getRowErrors(row: number) {
    return this.store.importErrorsForRow(row)();
  }
  

}
