import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as Constants from '../../lib/string.constants';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';

import { Children } from './children';

describe('Children', () => {
  let component: Children;
  let fixture: ComponentFixture<Children>;
  let formGroup: FormGroup;

  const attrChild = {
    id: 'attr-1',
    metaName: 'NAME',
    type: Constants.ATTRDEF,
    ctrlType: 'STRING',
    targetId: 'x',
    properties: {},
    displayNames: { de: 'Name' },
  };

  const relationChild = {
    id: 'rel-1',
    metaName: 'REL',
    type: Constants.RELATIONS,
    ctrlType: Constants.RELATIONS,
    targetId: 'x',
    properties: {},
    displayNames: { de: 'Relation' },
    incoming: false,
    relClass: {
      hasNotebook: true,
      targetInformations: [{ id: 'target-1', metaName: 'C_TARGET', type: 0 }],
      minOccurrences: 0,
      maxOccurrences: 1,
      reflexive: false,
      incoming: false,
    },
  };

  const groupChild = {
    id: 'grp-1',
    metaName: 'GROUP_TEST',
    type: Constants.GROUP,
    displayNames: { de: 'Gruppe' },
    children: [attrChild],
  };

  beforeEach(async () => {
    formGroup = new FormGroup({
      'attr-1': new FormControl<boolean>(false),
      'rel-1': new FormControl<boolean>(false),
      ['rel-1' + Constants.rel]: new FormGroup({
        'target-1': new FormControl<boolean>({ value: false, disabled: true }),
      }),
    });

    await TestBed.configureTestingModule({
      imports: [Children],
      providers: [{ provide: AdonisStoreService, useValue: { classById: vi.fn(() => ({ displayNames: { de: 'Target' } })) } }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Children);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('children', [attrChild, relationChild, groupChild] as any);
    fixture.componentRef.setInput('formGroup', formGroup);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('returns group children for group nodes and empty array otherwise', () => {
    expect(component.nodeChildren(groupChild as any).length).toBe(1);
    expect(component.nodeChildren(attrChild as any).length).toBe(0);
  });

  it('reports control existence and selection state', () => {
    expect(component.controlExists('attr-1')).toBe(true);
    expect(component.controlIsSelected('attr-1')).toBe(false);

    formGroup.get('attr-1')?.setValue(true);
    expect(component.controlIsSelected('attr-1')).toBe(true);
  });

  it('enables and disables relation target form group based on relation checkbox', () => {
    const relationControl = formGroup.get('rel-1') as FormControl;
    const relationTargets = component.getChildFormGroup('rel-1');

    expect(relationTargets.disabled).toBe(true);

    relationControl.setValue(true);
    component.relationsChange('rel-1');
    expect(relationTargets.enabled).toBe(true);

    relationControl.setValue(false);
    component.relationsChange('rel-1');
    expect(relationTargets.disabled).toBe(true);
  });
});
