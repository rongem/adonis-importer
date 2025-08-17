import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';


@Component({
    selector: 'app-error-badge',
    templateUrl: './error-badge.html',
    styleUrls: ['./error-badge.scss'],
    imports: [NgClass]
})
export class ErrorBadge {
  readonly errorDescription = input<string | null>(`Es sind Validierungsfehler aufgetreten.`);
  visibleText = false;
}
