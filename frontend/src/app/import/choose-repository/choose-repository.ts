import { Component, inject } from '@angular/core';
import { ChooseObjectgroup } from '../choose-objectgroup/choose-objectgroup';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

@Component({
  selector: 'app-choose-repository',
  imports: [ChooseObjectgroup],
  templateUrl: './choose-repository.html',
  styleUrl: './choose-repository.scss'
})
export class ChooseRepository {
    protected appState = inject(ApplicationStateService);
    protected adonisImportStore = inject(AdonisImportStoreService);
    
    chooseRepository(repositoryId: string) {
      this.adonisImportStore.selectRepository(repositoryId);
    }
}
