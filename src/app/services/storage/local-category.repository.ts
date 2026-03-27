import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { CategoryRepository } from '../../core/interfaces/category.repository';
import type { Category } from '../../core/models/category.model';

@Injectable()
export class LocalCategoryRepository extends CategoryRepository {
  getAll(): Observable<Category[]> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }

  upsert(): Observable<void> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }

  remove(): Observable<void> {
    throw new Error('Implementar con @ionic/storage-angular u otro proveedor');
  }
}
