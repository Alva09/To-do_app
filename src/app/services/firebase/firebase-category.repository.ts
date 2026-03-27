import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { CategoryRepository } from '../../core/interfaces/category.repository';
import type { Category } from '../../core/models/category.model';

@Injectable()
export class FirebaseCategoryRepository extends CategoryRepository {
  getAll(): Observable<Category[]> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }

  upsert(): Observable<void> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }

  remove(): Observable<void> {
    throw new Error('Implementar con AngularFire / SDK Firebase');
  }
}
