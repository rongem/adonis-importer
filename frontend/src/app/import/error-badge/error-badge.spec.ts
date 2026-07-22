import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBadge } from './error-badge';

describe('ErrorBadgeComponent', () => {
  let component: ErrorBadge;
  let fixture: ComponentFixture<ErrorBadge>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ErrorBadge]
    });
    fixture = TestBed.createComponent(ErrorBadge);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles error details visibility on click', () => {
    fixture.detectChanges();

    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(component.visibleText).toBe(false);

    button.click();
    fixture.detectChanges();
    expect(component.visibleText).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('#error-desc')).toBeTruthy();

    button.click();
    fixture.detectChanges();
    expect(component.visibleText).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('#error-desc')).toBeFalsy();
  });

  it('closes details on Escape key', () => {
    component.visibleText = true;

    component.onErrorKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(component.visibleText).toBe(false);
  });

  it('toggles details on Enter and prevents default action', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefault = vi.spyOn(event, 'preventDefault');

    component.visibleText = false;
    component.onErrorKeydown(event);

    expect(component.visibleText).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('focuses error region after opening details', async () => {
    vi.useFakeTimers();
    fixture.detectChanges();
    const focusSpy = vi.fn();
    vi.spyOn(document, 'getElementById').mockReturnValue({ focus: focusSpy } as unknown as HTMLElement);

    component.toggleVisibleText();
    await vi.runAllTimersAsync();

    expect(focusSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
  });
});
