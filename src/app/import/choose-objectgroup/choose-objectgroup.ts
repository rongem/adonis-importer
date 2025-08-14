import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { Store } from '@ngrx/store';
import { AdonisObjectGroup } from '../../lib/interfaces/adonis-object-group.interface';
import * as StoreActions from '../../lib/store/store.actions';

@Component({
  selector: 'app-choose-objectgroup',
  imports: [NgClass],
  templateUrl: './choose-objectgroup.html',
  styleUrl: './choose-objectgroup.scss'
})
export class ChooseObjectgroup {
  constructor(private store: Store) {}
  readonly objectGroups = input.required<AdonisObjectGroup[]>();
  readonly top = input<boolean>(false);

  selectObjectGroup(objectGroup: AdonisObjectGroup) {
    this.store.dispatch(StoreActions.SelectObjectGroup({objectGroup}));
  }
}
