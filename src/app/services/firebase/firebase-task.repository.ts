import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { TaskRepository } from '../../core/interfaces/task.repository';
import type { Task } from '../../core/models/task.model';

/**
 * Adaptador Firebase — implementa el puerto TaskRepository.
 * Aquí vive Firestore / Realtime Database según tu stack.
 */
@Injectable()
export class FirebaseTaskRepository extends TaskRepository {
  getAll(): Observable<Task[]> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }

  getById(): Observable<Task | undefined> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }

  upsert(): Observable<void> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }

  remove(): Observable<void> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }
}
