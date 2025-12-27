import { Component, inject, input, output } from '@angular/core';
import { AdonisClass } from '../../lib/models/adonis-rest/metadata/class.interface';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

@Component({
  selector: 'app-class-list',
  imports: [],
  templateUrl: './class-list.html',
  styleUrl: './class-list.scss'
})
export class ClassList {
  protected readonly store = inject(AdonisStoreService);
  protected readonly appState = inject(ApplicationStateService);

  readonly classSelected = output<AdonisClass>();

  selectButton_click(c: AdonisClass) {
    this.classSelected.emit(c);
  }
}
