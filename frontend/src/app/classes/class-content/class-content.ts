import { Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Children } from "../children/children";
import { AdonisNotebookRelations, AttributeOrGroupOrRelation, AttributeOrRelation } from '../../lib/models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import * as Constants from '../../lib/string.constants';

@Component({
  selector: 'app-class-content',
  imports: [Children, ReactiveFormsModule],
  templateUrl: './class-content.html',
  styleUrl: './class-content.scss'
})
export class ClassContent {
  protected readonly adonisStore = inject(AdonisStoreService);
  protected readonly appState = inject(ApplicationStateService);

  selectedProperties: AttributeOrRelation[] = [];

  protected readonly RELATIONS = Constants.RELATIONS;
  
  attributeForm = computed(() => {
    const formGroupObject: {[key: string]: FormControl | FormGroup} = {};
    this.adonisStore.selectedClassesProperties().forEach(p => {
      formGroupObject[p.id] = new FormControl<boolean>({ value: p.metaName === Constants.NAME, disabled: p.metaName === Constants.NAME });
      if (p.type === Constants.RELATIONS) {
        const r = p as AdonisNotebookRelations;
        const innerFormGroupObject: {[key: string]: FormControl} = {};
        r.relClass.targetInformations.forEach(ti => {
          innerFormGroupObject[ti.id] = new FormControl<boolean>(false);
        });
        formGroupObject[p.id + Constants.rel] = new FormGroup(innerFormGroupObject);
      }
    });
    return new FormGroup(formGroupObject);
  });

  relation = (child: AttributeOrGroupOrRelation | AttributeOrRelation) => child as AdonisNotebookRelations;

  protected selectionDone = false;

  submitForm() {
    const nameProperty = this.adonisStore.selectedClassesProperties().find(a => a.metaName === Constants.NAME)!;
    this.attributeForm().get(nameProperty.id)!.enable();
    this.selectedProperties = [nameProperty];
    this.adonisStore.selectedClassesProperties().forEach(property => {
      if (property.id !== nameProperty.id && this.attributeForm().value[property.id]) {
        switch(property.type) {
          case Constants.ATTRDEF:
            this.selectedProperties.push(property);
            break;
          case Constants.RELATIONS:
            const formGroup = this.attributeForm().get(property.id + Constants.rel)!;
            const keys = Object.keys(formGroup.value).filter(k => formGroup.value[k] === true);
            const oldProperty = property as AdonisNotebookRelations;
            keys.forEach(k => {
              const newProperty: AdonisNotebookRelations = {
                ...oldProperty,
                relClass: {
                  ...oldProperty.relClass,
                  targetInformations: oldProperty.relClass.targetInformations.filter(ti => ti.id === k),
                }
              };
              this.selectedProperties.push(newProperty as AttributeOrRelation);
            });
            break;
        }
      }
    });
    this.adonisStore.selectProperties(this.selectedProperties);
    this.selectionDone = true;
  };

  resetForm() {
    this.attributeForm().reset();
  };

  selectAction() {
    this.adonisStore.selectAction();
  }
}
