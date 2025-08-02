import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { provideStore, provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { authInterceptor } from './lib/interceptors/auth-interceptor';
import { routes } from './app.routes';
import { STORE, storeReducer } from './lib/store/store.reducer';
import { StoreEffects } from './lib/store/store.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
    ),
    provideRouter(routes),
    importProvidersFrom(ReactiveFormsModule),
    provideStore(),
    provideState({ name: STORE, reducer: storeReducer }),
    provideEffects(StoreEffects),
  ]
};
