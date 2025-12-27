import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ApplicationStateService } from './lib/store/application-state.service';
import { AdonisStoreService } from './lib/store/adonis-store.service';


@Component({
  selector: 'app-root',
  imports: [NgClass, ReactiveFormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ADONIS Importer');
  protected readonly appState = inject(ApplicationStateService);
  protected readonly store = inject(AdonisStoreService)

  attributeForm?: FormGroup;

}
