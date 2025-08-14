import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { AdonisClass } from '../../lib/interfaces/adonis-class.interface';

@Component({
  selector: 'app-class-list',
  imports: [NgClass],
  templateUrl: './class-list.html',
  styleUrl: './class-list.scss'
})
export class ClassList {
  readonly classes = input.required<AdonisClass[]>();
  readonly notebooksReady = input.required<boolean>();
  readonly classSelected = output<AdonisClass>();

  selectedClassId = '';

  selectButton_click(c: AdonisClass) {
    this.selectedClassId = c.id;
    this.classSelected.emit(c);
  }
}
