import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Router } from '@angular/router';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';

import { ChooseObjectgroup } from './choose-objectgroup';

describe('ChooseObjectgroup', () => {
  let component: ChooseObjectgroup;
  let fixture: ComponentFixture<ChooseObjectgroup>;
  let storeMock: { selectObjectGroup: ReturnType<typeof vi.fn> };
  let routerMock: { navigate: ReturnType<typeof vi.fn> };

  const objectGroups = [
    {
      id: 'g-root',
      name: 'Root',
      subgroups: [
        { id: 'g-child', name: 'Child', subgroups: [], rest_links: [] },
      ],
      rest_links: [],
    },
    {
      id: 'g-leaf',
      name: 'Leaf',
      subgroups: [],
      rest_links: [],
    },
  ];

  beforeEach(async () => {
    storeMock = {
      selectObjectGroup: vi.fn(),
    };

    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ChooseObjectgroup],
      providers: [
        { provide: AdonisImportStoreService, useValue: storeMock },
        { provide: Router, useValue: routerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseObjectgroup);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('objectGroups', objectGroups as any);
    fixture.componentRef.setInput('top', true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates selected group to the store', () => {
    component.selectObjectGroup(objectGroups[1] as any);
    expect(storeMock.selectObjectGroup).toHaveBeenCalledWith(objectGroups[1]);
  });

  it('renders group buttons and selects correct group on click', () => {
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(element.querySelectorAll('button')) as HTMLButtonElement[];

    const leafButton = buttons.find(b => b.textContent?.includes('Leaf'));
    expect(leafButton).toBeTruthy();

    leafButton!.click();
    expect(storeMock.selectObjectGroup).toHaveBeenCalledWith(objectGroups[1]);
  });
});
