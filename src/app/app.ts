import { Component, signal } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Login } from "./login/login";
import { ClassInformation } from './lib/interfaces/class-container.interface';
import { Children } from "./children/children";
import { AdonisNotebookGroup, AttributeOrRelation } from './lib/interfaces/adonis-notebook-elements.interface';
import { createXML } from './lib/helpers/xml.function';
import { createXLFile } from './lib/helpers/xlsx.functions';
import * as Selectors from './lib/store/store.selectors';


@Component({
  selector: 'app-root',
  imports: [AsyncPipe, ReactiveFormsModule, NgClass, Login, Children],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('import-generator');
  constructor(private store: Store) {}

  selectedClass?: ClassInformation = undefined;
  selectedClassesProperties?: AttributeOrRelation[];
  formSubmitted = false;
  xmlText = '';

  attributeForm?: FormGroup;

  selectButton_click(ci: ClassInformation) {
    this.selectedClass = ci;
    this.selectedClassesProperties = ci.notebook.chapters.map(chapter => {
      let properties: AttributeOrRelation[] = chapter.children.filter(c => c.type === 'GROUP').map(g => (g as AdonisNotebookGroup).children).flat();
      properties.push(...chapter.children.filter(c => c.type !== 'GROUP').map(p => (p as AttributeOrRelation)));
      properties = properties.filter(p => p.properties.READONLY !== 'true');
      return properties;
    }).flat();
    const formGroupObject: {[key: string]: FormControl} = {};
    this.selectedClassesProperties.forEach(p => {
      formGroupObject[p.id] = new FormControl<boolean>({ value: p.metaName === 'NAME', disabled: p.metaName === 'NAME' });
    });
    this.attributeForm = new FormGroup(formGroupObject);
  }

  submitForm() {
    const nameProperty = this.selectedClassesProperties!.find(a => a.metaName === 'NAME')!;
    this.attributeForm!.get(nameProperty.id)!.enable();
    this.formSubmitted = true;
    const selectedProperties = [nameProperty];
    this.selectedClassesProperties!.forEach(property => {
      if (property.id !== nameProperty.id && this.attributeForm!.value[property.id] && property) {
        selectedProperties.push(property);
      }
    });
    this.xmlText = createXML(this.selectedClass!.class, selectedProperties);
    createXLFile(this.selectedClass!.class, selectedProperties);
  }

  resetForm() {
    this.attributeForm!.reset();
  }

  get classesReady() {
    return this.store.select(Selectors.classesReady);
  }

  get working() {
    return this.store.select(Selectors.working);
  }

  get classes() {
    return this.store.select(Selectors.classes);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

}
