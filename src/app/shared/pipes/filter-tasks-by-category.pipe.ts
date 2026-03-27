import { Pipe, PipeTransform } from '@angular/core';
import type { Task } from '../../core/models/task.model';
import {
  type TaskCategoryFilter,
  taskMatchesCategoryFilter,
} from '../../core/utils/task-category-filter';

type Memo = {
  tasksRef: Task[] | null | undefined;
  filter: TaskCategoryFilter;
  result: Task[];
};

/**
 * Filtra tareas por categoría. Incluye memoización por referencia de `tasks` + valor de `filter`
 * para devolver la misma instancia de array cuando los inputs no cambian (menos trabajo en CD).
 */
@Pipe({
  name: 'filterTasksByCategory',
  standalone: true,
  pure: true,
})
export class FilterTasksByCategoryPipe implements PipeTransform {
  private memo: Memo | null = null;

  transform(
    tasks: Task[] | null | undefined,
    categoryFilter: TaskCategoryFilter,
  ): Task[] {
    if (!tasks?.length) {
      const m = this.memo;
      if (
        m &&
        m.tasksRef === tasks &&
        m.filter === categoryFilter &&
        m.result.length === 0
      ) {
        return m.result;
      }
      const empty: Task[] = [];
      this.memo = { tasksRef: tasks, filter: categoryFilter, result: empty };
      return empty;
    }

    if (
      this.memo &&
      this.memo.tasksRef === tasks &&
      this.memo.filter === categoryFilter
    ) {
      return this.memo.result;
    }

    const result = tasks.filter((t) =>
      taskMatchesCategoryFilter(t, categoryFilter),
    );
    this.memo = { tasksRef: tasks, filter: categoryFilter, result };
    return result;
  }
}
