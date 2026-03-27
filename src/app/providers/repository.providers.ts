import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CategoryRepository } from '../core/interfaces/category.repository';
import { TaskRepository } from '../core/interfaces/task.repository';
import { FirebaseCategoryRepository } from '../services/firebase/firebase-category.repository';
import { FirebaseTaskRepository } from '../services/firebase/firebase-task.repository';

/**
 * Composición raíz (DIP): las features inyectan puertos abstractos;
 * aquí eliges Firebase, local, o un decorador cache/offline-first.
 */
export function provideTaskAndCategoryRepositories(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TaskRepository, useClass: FirebaseTaskRepository },
    { provide: CategoryRepository, useClass: FirebaseCategoryRepository },
  ]);
}
