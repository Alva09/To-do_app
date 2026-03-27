import { Pipe, PipeTransform } from '@angular/core';
import type { Task } from '../../core/models/task.model';

export type TaskFilter = 'all' | 'active' | 'completed';

@Pipe({
  name: 'filterTasks',
  standalone: true,
})
export class FilterTasksPipe implements PipeTransform {
  transform(tasks: Task[] | null | undefined, mode: TaskFilter = 'all'): Task[] {
    if (!tasks?.length) {
      return [];
    }
    switch (mode) {
      case 'active':
        return tasks.filter((t) => !t.completed);
      case 'completed':
        return tasks.filter((t) => t.completed);
      default:
        return [...tasks];
    }
  }
}
