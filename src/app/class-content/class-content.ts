import { Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Children } from "../children/children";
import { AdonisClass } from '../lib/interfaces/adonis-class.interface';
import { AdonisNoteBook } from '../lib/interfaces/adonis-notebook.interface';
import { AdonisNotebookGroup, AttributeOrRelation } from '../lib/interfaces/adonis-notebook-elements.interface';

@Component({
  selector: 'app-class-content',
  imports: [Children, ReactiveFormsModule],
  templateUrl: './class-content.html',
  styleUrl: './class-content.scss'
})
export class ClassContent {
  readonly selectedClass = input.required<AdonisClass>();
  readonly selectedNotebook = input.required<AdonisNoteBook>();
  readonly propertiesSelected = output<AttributeOrRelation[]>();

  selectedClassesProperties = computed(() => this.selectedNotebook().chapters.map(chapter => {
      const properties: AttributeOrRelation[] = chapter.children.filter(c => c.type === 'GROUP').map(g => (g as AdonisNotebookGroup).children).flat();
      properties.push(...chapter.children.filter(c => c.type !== 'GROUP').map(p => (p as AttributeOrRelation)));
      return properties;
    }).flat()
  );

  attributeForm = computed(() => {
    const formGroupObject: {[key: string]: FormControl} = {};
    this.selectedClassesProperties().forEach(p => {
      formGroupObject[p.id] = new FormControl<boolean>({ value: p.metaName === 'NAME', disabled: p.metaName === 'NAME' });
    });
    return new FormGroup(formGroupObject);
  });

  submitForm() {
    const nameProperty = this.selectedClassesProperties().find(a => a.metaName === 'NAME')!;
    this.attributeForm().get(nameProperty.id)!.enable();
    const selectedProperties = [nameProperty];
    this.selectedClassesProperties().forEach(property => {
      if (property.id !== nameProperty.id && this.attributeForm().value[property.id] && property) {
        selectedProperties.push(property);
      }
    });
    this.propertiesSelected.emit(selectedProperties);
  };
  resetForm() {
    this.attributeForm().reset();
  };
}
