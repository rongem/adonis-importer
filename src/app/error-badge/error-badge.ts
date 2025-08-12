import { Component, input } from '@angular/core';


@Component({
    selector: 'app-error-badge',
    templateUrl: './error-badge.html',
    styleUrls: ['./error-badge.scss'],
    imports: []
})
export class ErrorBadge {
  readonly errorDescription = input<string | null>(`An error occured`);
  visibleText = false;
}
