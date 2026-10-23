import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdonisStoreService } from '../store/adonis-store.service';

// origin (scheme, host, port) of a URL, normalized by the browser (e.g. host in lower case)
const originOf = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
};

// send the credentials only to the ADONIS system the user has logged in to;
// links delivered by ADONIS (rest_links) may differ in spelling, so the origins are compared
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const adonisStore = inject(AdonisStoreService);
  const baseUrl = adonisStore.restBaseUrl();
  const basicAuth = adonisStore.basicAuth();
  if (!baseUrl || !basicAuth || originOf(req.url) !== originOf(baseUrl)) {
    return next(req);
  }
  return next(req.clone({
    setHeaders: { Authorization: 'Basic ' + basicAuth },
  }));
};
