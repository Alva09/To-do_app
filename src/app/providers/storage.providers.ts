import { importProvidersFrom } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

/** Debe incluirse en `app.config.ts` cuando uses repositorios locales (`LocalTaskRepository` / `LocalCategoryRepository`). */
export function provideIonicAppStorage() {
  return importProvidersFrom(
    IonicStorageModule.forRoot({
      name: 'prueba_tec_db',
    }),
  );
}
