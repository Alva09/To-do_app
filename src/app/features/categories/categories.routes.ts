import type { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/category-list/category-list.page').then(
        (m) => m.CategoryListPage,
      ),
  },
];
