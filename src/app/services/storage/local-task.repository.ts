import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import type { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { TaskRepository } from '../../core/interfaces/task.repository';
import type { Task } from '../../core/models/task.model';
import { STORAGE_KEYS } from './storage-keys';

@Injectable()
export class LocalTaskRepository extends TaskRepository {
  private init: Promise<void> | null = null;

  constructor(private readonly storage: Storage) {
    super();
  }

  private ensureReady(): Promise<void> {
    this.init ??= this.storage.create().then(() => undefined);
    return this.init;
  }

  getAll(): Observable<Task[]> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.tasks))),
      map((rows) => (Array.isArray(rows) ? (rows as Task[]) : [])),
    );
  }

  getById(id: string): Observable<Task | undefined> {
    return this.getAll().pipe(map((tasks) => tasks.find((t) => t.id === id)));
  }

  upsert(task: Task): Observable<void> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.tasks))),
      map((rows) => (Array.isArray(rows) ? [...(rows as Task[])] : [])),
      switchMap((tasks) => {
        const i = tasks.findIndex((t) => t.id === task.id);
        if (i >= 0) {
          tasks[i] = task;
        } else {
          tasks.push(task);
        }
        return from(this.storage.set(STORAGE_KEYS.tasks, tasks));
      }),
    );
  }

  remove(id: string): Observable<void> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.tasks))),
      map((rows) => (Array.isArray(rows) ? (rows as Task[]) : [])),
      switchMap((tasks) =>
        from(this.storage.set(STORAGE_KEYS.tasks, tasks.filter((t) => t.id !== id))),
      ),
    );
  }

  clearAll(): Observable<void> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.set(STORAGE_KEYS.tasks, []))),
    );
  }
}
