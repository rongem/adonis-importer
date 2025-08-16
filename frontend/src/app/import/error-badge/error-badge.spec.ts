import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
