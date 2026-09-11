import { InjectionToken } from '@angular/core';
import { environment } from '../environments/environment';
export interface PublicAppConfig {
  readonly apiBaseUrl: string;
}
export const APP_CONFIG = new InjectionToken<PublicAppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => ({ apiBaseUrl: environment.apiBaseUrl }),
});
