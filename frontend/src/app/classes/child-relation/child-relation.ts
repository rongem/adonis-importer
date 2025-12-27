import { Component, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdonisNotebookRelations } from '../../lib/models/adonis-rest/metadata/notebook-elements.interface';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';

@Component({
  selector: 'app-child-relation',
  imports: [ReactiveFormsModule],
  templateUrl: './child-relation.html',
  styleUrl: './child-relation.scss'
})
export class ChildRelation {
  protected readonly store = inject(AdonisStoreService)

  readonly child = input.required<AdonisNotebookRelations>();
  readonly formGroup = input.required<FormGroup>();
}
