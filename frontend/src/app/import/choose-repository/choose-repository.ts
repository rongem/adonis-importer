import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ChooseObjectgroup } from '../choose-objectgroup/choose-objectgroup';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import { AdonisImportWorkflowService } from '../../lib/workflows/adonis-import-workflow.service';

@Component({
  selector: 'app-choose-repository',
  imports: [ChooseObjectgroup],
  templateUrl: './choose-repository.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './choose-repository.scss'
})
export class ChooseRepository {
    protected appState = inject(ApplicationStateService);
    protected adonisImportStore = inject(AdonisImportStoreService);
    private readonly importWorkflow = inject(AdonisImportWorkflowService);
    
    chooseRepository(repositoryId: string) {
      this.importWorkflow.selectRepository(repositoryId);
    }
}
