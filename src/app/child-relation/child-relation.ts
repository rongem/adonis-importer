import { Component, input } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdonisNotebookRelations } from '../lib/interfaces/adonis-notebook-elements.interface';
import { repositoryClass } from '../lib/store/store.selectors';

@Component({
  selector: 'app-child-relation',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './child-relation.html',
  styleUrl: './child-relation.scss'
})
export class ChildRelation {
  constructor(private store: Store) {}

  readonly child = input.required<AdonisNotebookRelations>();
  readonly formGroup = input.required<FormGroup>();

  getClassForId(id: string) {
    return this.store.select(repositoryClass(id));
  }
}
