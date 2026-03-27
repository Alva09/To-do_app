import type { Task } from '../models/task.model';

/** Valores reservados: `all` y `uncategorized`; en otro caso, id de categoría (ver modelo `Category`). */
export type TaskCategoryFilter = 'all' | 'uncategorized' | string;

export function taskMatchesCategoryFilter(
  task: Task,
  filter: TaskCategoryFilter,
): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'uncategorized') {
    return task.categoryId == null || task.categoryId === '';
  }
  return task.categoryId === filter;
}
