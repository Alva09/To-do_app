import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import type { Observable } from 'rxjs';
import { from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { CategoryRepository } from '../../core/interfaces/category.repository';
import type { Category } from '../../core/models/category.model';
import { STORAGE_KEYS } from './storage-keys';

@Injectable()
export class LocalCategoryRepository extends CategoryRepository {
  private init: Promise<void> | null = null;

  constructor(private readonly storage: Storage) {
    super();
  }

  private ensureReady(): Promise<void> {
    this.init ??= this.storage.create().then(() => undefined);
    return this.init;
  }

  getAll(): Observable<Category[]> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.categories))),
      map((rows) => (Array.isArray(rows) ? (rows as Category[]) : [])),
    );
  }

  upsert(category: Category): Observable<void> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.categories))),
      map((rows) => (Array.isArray(rows) ? [...(rows as Category[])] : [])),
      switchMap((categories) => {
        const i = categories.findIndex((c) => c.id === category.id);
        if (i >= 0) {
          categories[i] = category;
        } else {
          categories.push(category);
        }
        return from(this.storage.set(STORAGE_KEYS.categories, categories));
      }),
    );
  }

  remove(id: string): Observable<void> {
    return from(this.ensureReady()).pipe(
      switchMap(() => from(this.storage.get(STORAGE_KEYS.categories))),
      map((rows) => (Array.isArray(rows) ? (rows as Category[]) : [])),
      switchMap((categories) =>
        from(
          this.storage.set(
            STORAGE_KEYS.categories,
            categories.filter((c) => c.id !== id),
          ),
        ),
      ),
    );
  }
}
