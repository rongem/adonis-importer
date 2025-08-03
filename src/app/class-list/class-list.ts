import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';
import { AdonisClass } from '../lib/interfaces/adonis-class.interface';

@Component({
  selector: 'app-class-list',
  imports: [NgClass],
  templateUrl: './class-list.html',
  styleUrl: './class-list.scss'
})
export class ClassList {
  @Input({required: true}) classes!: AdonisClass[];
  @Input({required: true}) notebooksReady!: boolean;
  @Output() classSelected = new EventEmitter<AdonisClass>();

  selectedClassId = '';

  selectButton_click(c: AdonisClass) {
    this.selectedClassId = c.id;
    this.classSelected.emit(c);
  }
}
