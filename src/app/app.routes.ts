import type { Routes } from '@angular/router';

/**
 * Rutas de la aplicación (`provideRouter(routes)` en `app.config.ts`).
 * Cada `loadChildren` genera un chunk de compilación separado (carga diferida equivalente
 * a lazy-loaded NgModules en apps basadas en módulos).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tasks' },
  {
    path: 'tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then((m) => m.TASKS_ROUTES),
  },
  {
    path: 'categories',
    loadChildren: () =>
      import('./features/categories/categories.routes').then(
        (m) => m.CATEGORIES_ROUTES,
      ),
  },
];
