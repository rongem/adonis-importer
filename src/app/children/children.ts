import { Component, input } from '@angular/core';
import {AttributeOrGroupOrRelation, AdonisNotebookGroup, AdonisNotebookAttribute} from '../lib/interfaces/adonis-notebook-elements.interface'
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-children',
  imports: [ReactiveFormsModule],
  templateUrl: './children.html',
  styleUrl: './children.scss'
})
export class Children {
  readonly children = input.required<AttributeOrGroupOrRelation[]>();
  readonly formGroup = input.required<FormGroup>();

  nodeChildren(nodeChild: AttributeOrGroupOrRelation) {
    const c = nodeChild as AdonisNotebookGroup;
    if (c.children) {
      return c.children;
    }
    return [];
  }

  attribute = (child: AttributeOrGroupOrRelation) => child as AdonisNotebookAttribute;

  controlExists = (id: string) => !!this.formGroup().get(id);
}
