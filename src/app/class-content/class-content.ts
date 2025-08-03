import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Children } from "../children/children";
import { AdonisClass } from '../lib/interfaces/adonis-class.interface';
import { AdonisNoteBook } from '../lib/interfaces/adonis-notebook.interface';

@Component({
  selector: 'app-class-content',
  imports: [Children, ReactiveFormsModule],
  templateUrl: './class-content.html',
  styleUrl: './class-content.scss'
})
export class ClassContent {
  @Input({required: true}) selectedClass!: AdonisClass;
  @Input({required: true}) selectedNotebook!: AdonisNoteBook;
  attributeForm?: FormGroup;
  submitForm() {};
  resetForm() {};
}
