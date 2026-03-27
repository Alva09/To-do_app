import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app.routes';
import {
  provideFirebaseAndRemoteConfig,
  provideIonicAppStorage,
  provideLocalTaskAndCategoryRepositories,
} from './providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    ...provideFirebaseAndRemoteConfig(),
    provideIonicAppStorage(),
    provideLocalTaskAndCategoryRepositories(),
  ],
};
