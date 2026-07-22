import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisImportStoreService } from '../../lib/store/adonis-import-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

import { ChooseRepository } from './choose-repository';

describe('ChooseRepository', () => {
  let component: ChooseRepository;
  let fixture: ComponentFixture<ChooseRepository>;
  let appStateMock: { repositoryReady: ReturnType<typeof vi.fn> };
  let importStoreMock: {
    selectedRepository: ReturnType<typeof vi.fn>;
    repositories: ReturnType<typeof vi.fn>;
    objectGroups: ReturnType<typeof vi.fn>;
    selectRepository: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    appStateMock = {
      repositoryReady: vi.fn(() => true),
    };

    importStoreMock = {
      selectedRepository: vi.fn(() => undefined),
      repositories: vi.fn(() => [
        { id: 'repo-1', name: 'Alpha' },
        { id: 'repo-2', name: 'Beta' },
      ]),
      objectGroups: vi.fn(() => undefined),
      selectRepository: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChooseRepository],
      providers: [
        { provide: ApplicationStateService, useValue: appStateMock },
        { provide: AdonisImportStoreService, useValue: importStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseRepository);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('delegates repository selection to the import store', () => {
    component.chooseRepository('repo-2');
    expect(importStoreMock.selectRepository).toHaveBeenCalledWith('repo-2');
  });

  it('renders repository options and triggers selection on button click', () => {
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector('#reposelect') as HTMLSelectElement;
    const button = element.querySelector('button') as HTMLButtonElement;

    expect(select).toBeTruthy();
    expect(select.options.length).toBe(2);

    select.value = 'repo-2';
    button.click();

    expect(importStoreMock.selectRepository).toHaveBeenCalledWith('repo-2');
  });

  it('hides repository selector when repository state is not ready', () => {
    appStateMock.repositoryReady.mockReturnValue(false);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#reposelect')).toBeFalsy();
    expect(element.textContent).not.toContain('Repository zum Importieren');
  });

  it('shows selected repository summary instead of select box', () => {
    importStoreMock.selectedRepository.mockReturnValue({ id: 'repo-1', name: 'Alpha' });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#reposelect')).toBeFalsy();
    expect(element.textContent).toContain('Repository');
    expect(element.textContent).toContain('Alpha');
  });

  it('renders object-group section when object groups are available', () => {
    importStoreMock.selectedRepository.mockReturnValue({ id: 'repo-1', name: 'Alpha' });
    importStoreMock.objectGroups.mockReturnValue({
      id: 'g-root',
      name: 'Top Group',
      subgroups: [{ id: 'g-1', name: 'Child', subgroups: [], rest_links: [] }],
      rest_links: [],
    });
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Objektgruppe auswählen');
    expect(element.textContent).toContain('Top Group');
  });
});
