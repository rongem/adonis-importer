import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';

import * as Constants from '../../lib/string.constants';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

import { ClassContent } from './class-content';

describe('ClassContent', () => {
  let component: ClassContent;
  let fixture: ComponentFixture<ClassContent>;
  let storeMock: {
    selectedClassesProperties: ReturnType<typeof vi.fn>;
    selectProperties: ReturnType<typeof vi.fn>;
    purpose: ReturnType<typeof vi.fn>;
  };
  let routerMock: { navigate: ReturnType<typeof vi.fn>; navigateByUrl: ReturnType<typeof vi.fn> };

  const nameProperty = {
    id: 'attr-name',
    metaName: Constants.NAME,
    type: Constants.ATTRDEF,
    ctrlType: 'STRING',
    targetId: 'target',
    properties: {},
    displayNames: { de: 'Name' },
  };

  const descProperty = {
    id: 'attr-desc',
    metaName: 'DESCRIPTION',
    type: Constants.ATTRDEF,
    ctrlType: 'LONGSTRING',
    targetId: 'target',
    properties: {},
    displayNames: { de: 'Beschreibung' },
  };

  const relationProperty = {
    id: 'rel-main',
    metaName: 'REL_WORKS_WITH',
    type: Constants.RELATIONS,
    ctrlType: Constants.RELATIONS,
    targetId: 'target',
    properties: {},
    displayNames: { de: 'arbeitet mit' },
    incoming: false,
    relClass: {
      hasNotebook: true,
      targetInformations: [
        { id: 'target-1', metaName: 'C_ROLE', type: 0 },
        { id: 'target-2', metaName: 'C_DEPARTMENT', type: 0 },
      ],
      minOccurrences: 0,
      maxOccurrences: 10,
      reflexive: false,
      incoming: false,
    },
  };

  beforeEach(async () => {
    storeMock = {
      selectedClassesProperties: vi.fn(() => [nameProperty, descProperty, relationProperty]),
      selectProperties: vi.fn(),
      purpose: vi.fn(() => 'config'),
    };

    routerMock = { navigate: vi.fn(), navigateByUrl: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ClassContent],
      providers: [
        { provide: AdonisStoreService, useValue: storeMock },
        { provide: ApplicationStateService, useValue: { attributesReady: vi.fn(() => true) } },
        { provide: Router, useValue: routerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassContent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submits selected attributes and relation targets including mandatory name', () => {
    const form = component.attributeForm();
    form.get('attr-desc')?.setValue(true);
    form.get('rel-main')?.setValue(true);
    const relTargets = form.get('rel-main' + Constants.rel) as FormGroup;
    relTargets.get('target-2')?.setValue(true);

    component.submitForm();

    expect(storeMock.selectProperties).toHaveBeenCalledTimes(1);
    const selected = storeMock.selectProperties.mock.calls[0][0] as any[];
    expect(selected.length).toBe(3);
    expect(selected[0].id).toBe('attr-name');
    expect(selected[1].id).toBe('attr-desc');
    expect(selected[2].id).toBe('rel-main');
    expect(selected[2].relClass.targetInformations.length).toBe(1);
    expect(selected[2].relClass.targetInformations[0].id).toBe('target-2');
    expect((component as any).selectionDone).toBe(true);
  });

  it('resets form values', () => {
    const form = component.attributeForm();
    form.get('attr-desc')?.setValue(true);

    component.resetForm();

    expect(form.get('attr-desc')?.value).not.toBe(true);
  });

  it('navigates to export-files when purpose is config', () => {
    component.selectAction();
    expect(routerMock.navigate).toHaveBeenCalledWith([Constants.export_files_url]);
  });
});
