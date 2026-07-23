import { NgClass } from '@angular/common';
import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AdonisObjectGroup } from '../../lib/models/adonis-rest/metadata/object-group.interface';
import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import * as Constants from '../../lib/string.constants';

@Component({
  selector: 'app-choose-objectgroup',
  imports: [NgClass],
  templateUrl: './choose-objectgroup.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './choose-objectgroup.scss'
})
export class ChooseObjectgroup {
  protected store = inject(AdonisImportStoreService);
  private readonly router = inject(Router);
  readonly objectGroups = input.required<AdonisObjectGroup[]>();
  readonly top = input<boolean>(false);

  selectObjectGroup(objectGroup: AdonisObjectGroup) {
    this.store.selectObjectGroup(objectGroup);
    this.router.navigate([Constants.import_url]);
  }
}
