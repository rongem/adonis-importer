import { HttpInterceptorFn } from '@angular/common/http';
import { AppSettings } from '../app-settings';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('/connection')) {
    return next(req);
  } else {
    const newRequest = req.clone({
        setHeaders: { Authorization: 'Basic ' + AppSettings.basicAuth },
      });
    return next(newRequest);
  }
};
