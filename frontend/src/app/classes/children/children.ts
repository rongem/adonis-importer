import { Component, input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {AttributeOrGroupOrRelation, AdonisNotebookGroup, AdonisNotebookAttribute, AdonisNotebookRelations, AttributeOrRelation} from '../../lib/models/adonis-rest/metadata/notebook-elements.interface'
import { ChildRelation } from "../child-relation/child-relation";
import * as Constants from '../../lib/string.constants';

@Component({
  selector: 'app-children',
  imports: [ReactiveFormsModule, ChildRelation],
  templateUrl: './children.html',
  styleUrl: './children.scss'
})
export class Children {
  readonly children = input.required<AttributeOrGroupOrRelation[]>();
  readonly formGroup = input.required<FormGroup>();

  readonly RELATIONS = Constants.RELATIONS;
  readonly ATTRDEF = Constants.ATTRDEF;

  nodeChildren(nodeChild: AttributeOrGroupOrRelation) {
    const c = nodeChild as AdonisNotebookGroup;
    if (c.children) {
      return c.children;
    }
    return [];
  }

  attribute = (child: AttributeOrGroupOrRelation) => child as AdonisNotebookAttribute;

  relation = (child: AttributeOrGroupOrRelation | AttributeOrRelation) => child as AdonisNotebookRelations;

  controlExists = (id: string) => !!this.formGroup().get(id);

  controlIsSelected = (id: string) => this.formGroup().get(id)!.value;

  relationsChange = (id: string) => {
    const formControl = this.formGroup().get(id) as FormControl;
    if (formControl.value === true) {
      this.getChildFormGroup(id).enable();
    } else {
      this.getChildFormGroup(id).disable();
    }
  };

  getChildFormGroup = (id: string) => {
    return this.formGroup().get(id + Constants.rel) as FormGroup;
  }
}
