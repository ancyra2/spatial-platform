import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { isNativeRuntime } from '../platform/runtime';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideRouter(appRoutes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production && !isNativeRuntime(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
