import { AsyncPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Children } from "../children/children";
import { AdonisClass } from '../../lib/interfaces/adonis-class.interface';
import { AdonisNoteBook } from '../../lib/interfaces/adonis-notebook.interface';
import { AdonisNotebookGroup, AdonisNotebookRelations, AttributeOrGroupOrRelation, AttributeOrRelation } from '../../lib/interfaces/adonis-notebook-elements.interface';
import { ATTRDEF, GROUP, NAME, rel, RELATIONS } from '../../lib/string.constants';
import { ExportAction } from '../../lib/enums/export-action.enum';
import * as Constants from '../../lib/string.constants';
import { repositoryClass } from '../../lib/store/store.selectors';

@Component({
  selector: 'app-class-content',
  imports: [AsyncPipe, Children, ReactiveFormsModule],
  templateUrl: './class-content.html',
  styleUrl: './class-content.scss'
})
export class ClassContent {
  constructor(private store: Store) {}
  readonly selectedClass = input.required<AdonisClass>();
  readonly selectedNotebook = input.required<AdonisNoteBook>();
  readonly propertiesSelected = output<AttributeOrRelation[]>();
  readonly actionSelected = output<ExportAction>();

  selectedClassesProperties = computed(() => this.selectedNotebook().chapters.map(chapter => {
      const properties: AttributeOrRelation[] = chapter.children.filter(c => c.type === GROUP).map(g => (g as AdonisNotebookGroup).children).flat();
      properties.push(...chapter.children.filter(c => c.type !== GROUP).map(p => (p as AttributeOrRelation)));
      return properties;
    }).flat()
  );

  selectedProperties: AttributeOrRelation[] = [];

  readonly RELATIONS = Constants.RELATIONS;
  
  attributeForm = computed(() => {
    const formGroupObject: {[key: string]: FormControl | FormGroup} = {};
    this.selectedClassesProperties().forEach(p => {
      formGroupObject[p.id] = new FormControl<boolean>({ value: p.metaName === NAME, disabled: p.metaName === NAME });
      if (p.type === RELATIONS) {
        const r = p as unknown as AdonisNotebookRelations;
        const innerFormGroupObject: {[key: string]: FormControl} = {};
        r.relClass.targetInformations.forEach(ti => {
          innerFormGroupObject[ti.id] = new FormControl<boolean>(false);
        });
        formGroupObject[p.id + rel] = new FormGroup(innerFormGroupObject);
      }
    });
    return new FormGroup(formGroupObject);
  });

  relation = (child: AttributeOrGroupOrRelation | AttributeOrRelation) => child as AdonisNotebookRelations;

  getClassForId(id: string) {
    return this.store.select(repositoryClass(id));
  }

  selectionDone = false;

  submitForm() {
    const nameProperty = this.selectedClassesProperties().find(a => a.metaName === NAME)!;
    this.attributeForm().get(nameProperty.id)!.enable();
    this.selectedProperties = [nameProperty];
    this.selectedClassesProperties().forEach(property => {
      if (property.id !== nameProperty.id && this.attributeForm().value[property.id]) {
        switch(property.type) {
          case ATTRDEF:
            this.selectedProperties.push(property);
            break;
          case RELATIONS:
            const formGroup = this.attributeForm().get(property.id + rel)!;
            const keys = Object.keys(formGroup.value).filter(k => formGroup.value[k] === true);
            const oldProperty = property as unknown as AdonisNotebookRelations;
            keys.forEach(k => {
              const newProperty: AdonisNotebookRelations = {
                ...oldProperty,
                relClass: {
                  ...oldProperty.relClass,
                  targetInformations: oldProperty.relClass.targetInformations.filter(ti => ti.id === k),
                }
              };
              this.selectedProperties.push(newProperty as unknown as AttributeOrRelation);
            });
            break;
        }
      }
    });
    this.propertiesSelected.emit(this.selectedProperties);
    this.selectionDone = true;
  };
  resetForm() {
    this.attributeForm().reset();
  };

  selectImport() {
    this.actionSelected.emit(ExportAction.ImportViaRest);
  }

  selectExport() {
    this.actionSelected.emit(ExportAction.ExportFiles);
  }
}
