import type { Routes } from '@angular/router';

/** Rutas lazy de la feature Tareas — enlazar desde app.routes.ts */
export const TASKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/task-list/task-list.page').then((m) => m.TaskListPage),
  },
];
