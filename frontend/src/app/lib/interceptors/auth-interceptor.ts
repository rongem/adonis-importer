import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdonisStoreService } from '../store/adonis-store.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/connection')) {
    return next(req);
  } else {
    const adonisStore = inject(AdonisStoreService);
    const newRequest = req.clone({
        setHeaders: { Authorization: 'Basic ' + adonisStore.basicAuth() },
      });
    return next(newRequest);
  }
};
