import { Component, input, output } from '@angular/core';
import { AdonisClass } from '../../lib/interfaces/adonis-class.interface';

@Component({
  selector: 'app-class-list',
  imports: [],
  templateUrl: './class-list.html',
  styleUrl: './class-list.scss'
})
export class ClassList {
  readonly classes = input.required<AdonisClass[]>();
  readonly notebooksReady = input.required<boolean>();
  readonly classSelected = output<AdonisClass>();

  selectButton_click(c: AdonisClass) {
    this.classSelected.emit(c);
  }
}
