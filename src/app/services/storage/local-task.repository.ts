import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { TaskRepository } from '../../core/interfaces/task.repository';
import type { Task } from '../../core/models/task.model';

/**
 * Persistencia local (Ionic Storage, IndexedDB, SQLite/Capacitor, etc.).
 */
@Injectable()
export class LocalTaskRepository extends TaskRepository {
  getAll(): Observable<Task[]> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }

  getById(): Observable<Task | undefined> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }

  upsert(): Observable<void> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }

  remove(): Observable<void> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }
}
