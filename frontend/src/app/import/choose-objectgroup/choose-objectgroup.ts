import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { AdonisObjectGroup } from '../../lib/models/adonis-rest/metadata/object-group.interface';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';

@Component({
  selector: 'app-choose-objectgroup',
  imports: [NgClass],
  templateUrl: './choose-objectgroup.html',
  styleUrl: './choose-objectgroup.scss'
})
export class ChooseObjectgroup {
  protected store = inject(AdonisImportStoreService);
  readonly objectGroups = input.required<AdonisObjectGroup[]>();
  readonly top = input<boolean>(false);

  selectObjectGroup(objectGroup: AdonisObjectGroup) {
    this.store.selectObjectGroup(objectGroup);
  }
}
