import { Component, signal } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Login } from "./login/login";
import { ClassContent } from "./class-content/class-content";
import { AttributeOrRelation } from './lib/interfaces/adonis-notebook-elements.interface';
import * as Selectors from './lib/store/store.selectors';
import { AdonisClass } from './lib/interfaces/adonis-class.interface';
import { ExportFiles } from "./export-files/export-files";
import { ClassList } from "./class-list/class-list";


@Component({
  selector: 'app-root',
  imports: [AsyncPipe, NgClass, ReactiveFormsModule, Login, ExportFiles, ClassContent, ClassList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ADONIS Import-Generator');
  constructor(private store: Store) {}

  selectedClass?: AdonisClass = undefined;
  selectedClassesProperties?: AttributeOrRelation[];
  selectedProperties?: AttributeOrRelation[];
  formSubmitted = false;

  attributeForm?: FormGroup;

  classSelected(ci: AdonisClass) {
    this.selectedClass = ci;
  }

  propertiesSelected(properties: AttributeOrRelation[]) {
    this.selectedProperties = properties;
    this.formSubmitted = true;
  }

  get classesReady() {
    return this.store.select(Selectors.classesReady);
  }

  get notebooksReady() {
    return this.store.select(Selectors.notebooksReady);
  }

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

  get attributeTypesState() {
    return this.store.select(Selectors.attributeTypesState);
  }

  get classes() {
    return this.store.select(Selectors.classes);
  }

  get selectedNotebook() {
    return this.store.select(Selectors.notebook(this.selectedClass!.id));
  }

  get attributes() {
    return this.store.select(Selectors.attributes);
  }

  get errorPresent() {
    return this.store.select(Selectors.errorPresent)
  }

  get errorMessage() {
    return this.store.select(Selectors.errorMessage)
  }

}
