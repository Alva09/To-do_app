import type { EnvironmentProviders } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideRemoteConfig, getRemoteConfig } from '@angular/fire/remote-config';
import { environment } from '../../environments/environment';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../core/config/remote-config-keys';

/** Incluye `provideFirebaseApp` + `provideRemoteConfig` con defaults alineados a `REMOTE_CONFIG_*`. */
export function provideFirebaseAndRemoteConfig(): EnvironmentProviders[] {
  return [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideRemoteConfig(() => {
      const rc = getRemoteConfig();
      rc.defaultConfig = Object.fromEntries(
        Object.entries(REMOTE_CONFIG_DEFAULTS).map(([k, v]) => [k, String(v)]),
      ) as Record<string, string>;
      rc.settings.minimumFetchIntervalMillis = environment.production
        ? 43_200_000
        : 60_000;
      return rc;
    }),
  ];
}
