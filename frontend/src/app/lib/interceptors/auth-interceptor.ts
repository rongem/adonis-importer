import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ApplicationStateService } from '../store/application-state.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/connection')) {
    return next(req);
  } else {
    const appState = inject(ApplicationStateService);
    const newRequest = req.clone({
        setHeaders: { Authorization: 'Basic ' + appState.basicAuth() },
      });
    return next(newRequest);
  }
};
