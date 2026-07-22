import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

import { ExportFiles } from './export-files';

describe('ExportFiles', () => {
  let component: ExportFiles;
  let fixture: ComponentFixture<ExportFiles>;
  let storeMock: {
    selectedClass: ReturnType<typeof vi.fn>;
    selectedProperties: ReturnType<typeof vi.fn>;
    attributes: ReturnType<typeof vi.fn>;
  };
  let sanitizerMock: { bypassSecurityTrustResourceUrl: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    storeMock = {
      selectedClass: vi.fn(() => ({ id: 'c1', metaName: 'C_PROCESS', displayNames: { de: 'Prozess' } })),
      selectedProperties: vi.fn(() => [{ id: 'attr-name', metaName: 'NAME', type: 'ATTRDEF', ctrlType: 'STRING', properties: {}, targetId: 'x', displayNames: { de: 'Name' } }]),
      attributes: vi.fn(() => ({
        'attr-name': {
          id: 'attr-name',
          metaName: 'NAME',
          displayNames: { de: 'Name' },
          type: { id: 't1', metaName: 'STRING', rest_links: [] },
          classAttribute: true,
          contextSpecific: false,
          multiLingual: false,
          systemAttribute: false,
          infoText: { de: 'info' },
          constraints: { de: 'A@B' },
          rest_links: [],
        },
      })),
    };

    sanitizerMock = {
      bypassSecurityTrustResourceUrl: vi.fn(() => 'safe-url'),
    };

    Object.defineProperty(window.URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:test-url'),
      configurable: true,
    });

    Object.defineProperty(globalThis.navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ExportFiles],
      providers: [
        { provide: AdonisStoreService, useValue: storeMock },
        { provide: ApplicationStateService, useValue: { errorMessage: { set: vi.fn() } } },
        { provide: DomSanitizer, useValue: sanitizerMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportFiles);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('creates xml/xlsx artifacts during initialization', () => {
    component.ngOnInit();

    expect((window.URL.createObjectURL as any).mock.calls.length).toBeGreaterThanOrEqual(1);
    expect(sanitizerMock.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith('blob:test-url');
    expect(component.xmlText.startsWith('<?xml version="1.0" encoding="UTF-8" ?>')).toBe(true);
    expect(component.fileUrl).toBe('safe-url' as any);
  });

  it('copies xml text to clipboard', () => {
    component.xmlText = '<xml>copy-me</xml>';
    component.copyToClipboard();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('<xml>copy-me</xml>');
  });
});
