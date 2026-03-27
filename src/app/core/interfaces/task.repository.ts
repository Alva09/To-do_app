import type { Observable } from 'rxjs';
import type { Task } from '../models/task.model';

/** Puerto (abstracción) — la capa de datos debe implementar este contrato */
export abstract class TaskRepository {
  abstract getAll(): Observable<Task[]>;
  abstract getById(id: string): Observable<Task | undefined>;
  abstract upsert(task: Task): Observable<void>;
  abstract remove(id: string): Observable<void>;
}
