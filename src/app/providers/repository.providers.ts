import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CategoryRepository } from '../core/interfaces/category.repository';
import { TaskRepository } from '../core/interfaces/task.repository';
import { FirebaseCategoryRepository } from '../services/firebase/firebase-category.repository';
import { FirebaseTaskRepository } from '../services/firebase/firebase-task.repository';
import { LocalCategoryRepository } from '../services/storage/local-category.repository';
import { LocalTaskRepository } from '../services/storage/local-task.repository';

/**
 * Persistencia local (Ionic Storage). Requiere `provideIonicAppStorage()` en la misma lista de `providers`.
 */
export function provideLocalTaskAndCategoryRepositories(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TaskRepository, useClass: LocalTaskRepository },
    { provide: CategoryRepository, useClass: LocalCategoryRepository },
  ]);
}

/**
 * Firebase (stubs hasta implementar). No requiere Ionic Storage.
 */
export function provideFirebaseTaskAndCategoryRepositories(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TaskRepository, useClass: FirebaseTaskRepository },
    { provide: CategoryRepository, useClass: FirebaseCategoryRepository },
  ]);
}
