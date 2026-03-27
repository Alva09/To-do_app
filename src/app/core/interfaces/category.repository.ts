import type { Observable } from 'rxjs';
import type { Category } from '../models/category.model';

export abstract class CategoryRepository {
  abstract getAll(): Observable<Category[]>;
  abstract upsert(category: Category): Observable<void>;
  abstract remove(id: string): Observable<void>;
}
