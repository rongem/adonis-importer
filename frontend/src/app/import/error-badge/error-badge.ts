import { NgClass } from '@angular/common';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';


@Component({
    selector: 'app-error-badge',
    templateUrl: './error-badge.html',
    styleUrls: ['./error-badge.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgClass]
})
export class ErrorBadge {
  readonly errorDescription = input<string | null>(`Es sind Validierungsfehler aufgetreten.`);
  visibleText = false;

  toggleVisibleText() {
    this.visibleText = !this.visibleText;
    if (this.visibleText) {
      // focus the error region when it appears
      setTimeout(() => {
        const el = document.getElementById('error-desc') as HTMLElement | null;
        if (el) el.focus();
      }, 0);
    }
  }

  onErrorKeydown(ev: KeyboardEvent) {
    if (ev.key === 'Escape' || ev.key === 'Esc') {
      this.visibleText = false;
    }
    if (ev.key === 'Enter' || ev.key === ' ') {
      // treat Enter/Space like click to close
      this.visibleText = !this.visibleText;
      ev.preventDefault();
    }
  }
}
