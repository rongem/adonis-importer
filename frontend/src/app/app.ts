import { Component, signal } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import * as Selectors from './lib/store/store.selectors';


@Component({
  selector: 'app-root',
  imports: [AsyncPipe, NgClass, ReactiveFormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ADONIS Importer');
  constructor(private store: Store) {}

  attributeForm?: FormGroup;

  get working() {
    return this.store.select(Selectors.working);
  }

  get classesState() {
    return this.store.select(Selectors.classesState);
  }

  get notebookState() {
    return this.store.select(Selectors.notebookState);
  }

  get attributesState() {
    return this.store.select(Selectors.attributesState);
  }  

  get repositoryState() {
    return this.store.select(Selectors.repositoryState);
  }  

  get objectGroupsState() {
    return this.store.select(Selectors.objectGroupsState);
  }  

  get errorPresent() {
    return this.store.select(Selectors.errorPresent)
  }

  get errorMessage() {
    return this.store.select(Selectors.errorMessage)
  }

}
