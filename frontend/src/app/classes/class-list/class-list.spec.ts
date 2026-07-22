import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

import { ClassList } from './class-list';

describe('ClassList', () => {
  let component: ClassList;
  let fixture: ComponentFixture<ClassList>;
  let storeMock: {
    sortedClasses: ReturnType<typeof vi.fn>;
    selectClass: ReturnType<typeof vi.fn>;
  };
  let appStateMock: { notebooksReady: ReturnType<typeof vi.fn> };

  const classes = [
    {
      id: 'class-1',
      metaName: 'C_PROCESS',
      displayNames: { de: 'Prozess' },
      infoText: { de: 'Info 1' },
    },
    {
      id: 'class-2',
      metaName: 'C_ROLE',
      displayNames: { de: 'Rolle' },
      infoText: { de: 'Info 2' },
    },
  ];

  beforeEach(async () => {
    storeMock = {
      sortedClasses: vi.fn(() => classes),
      selectClass: vi.fn(),
    };

    appStateMock = {
      notebooksReady: vi.fn(() => true),
    };

    await TestBed.configureTestingModule({
      imports: [ClassList],
      providers: [
        { provide: AdonisStoreService, useValue: storeMock },
        { provide: ApplicationStateService, useValue: appStateMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClassList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one button per class and calls store.selectClass on click', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const buttons = element.querySelectorAll('button');

    expect(buttons.length).toBe(2);
    (buttons[0] as HTMLButtonElement).click();
    expect(storeMock.selectClass).toHaveBeenCalledWith(classes[0]);
  });

  it('disables class buttons while notebooks are not ready', () => {
    appStateMock.notebooksReady.mockReturnValue(false);
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
