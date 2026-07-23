import { Component, inject, output, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AdonisClass } from '../../lib/models/adonis-rest/metadata/class.interface';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';
import * as Constants from '../../lib/string.constants';

@Component({
  selector: 'app-class-list',
  imports: [],
  templateUrl: './class-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './class-list.scss'
})
export class ClassList {
  protected readonly store = inject(AdonisStoreService);
  protected readonly appState = inject(ApplicationStateService);
  private readonly router = inject(Router);

  readonly classSelected = output<AdonisClass>();

  selectButton_click(c: AdonisClass) {
    this.store.selectClass(c);
    this.classSelected.emit(c);
    this.router.navigate([Constants.classes_url, c.metaName]);
  }
}
