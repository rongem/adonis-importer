import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ApplicationStateService } from './lib/store/application-state.service';
import { AdonisStoreService } from './lib/store/adonis-store.service';
import { WorkflowState } from './lib/enums/workflow-state.enum';


@Component({
  selector: 'app-root',
  imports: [NgClass, ReactiveFormsModule, RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ADONIS Importer');
  protected readonly appState = inject(ApplicationStateService);
  protected readonly store = inject(AdonisStoreService);
  protected readonly WorkflowState = WorkflowState;

}
