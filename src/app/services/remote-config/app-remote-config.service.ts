import { Injectable, inject } from '@angular/core';
import { RemoteConfig } from '@angular/fire/remote-config';
import { fetchAndActivate, getValue } from 'firebase/remote-config';
import { concat, defer, from, of, type Observable } from 'rxjs';
import { catchError, distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../../core/config/remote-config-keys';

@Injectable({ providedIn: 'root' })
export class AppRemoteConfigService {
  private readonly rc = inject(RemoteConfig, { optional: true });

  /**
   * Feature flag: mostrar «Eliminar todas las tareas».
   * Emite primero el valor por defecto (en caché / `defaultConfig`) y vuelve a emitir tras `fetchAndActivate`.
   */
  readonly showDeleteAllTasks$: Observable<boolean>;

  constructor() {
    const key = REMOTE_CONFIG_KEYS.showDeleteAllTasks;
    const offline = REMOTE_CONFIG_DEFAULTS[key];
    this.showDeleteAllTasks$ = this.rc
      ? this.observeBoolean(key)
      : of(offline);
  }

  /**
   * Parámetro booleano genérico; usa `REMOTE_CONFIG_DEFAULTS` o `false` como respaldo.
   */
  getBoolean$(paramName: string): Observable<boolean> {
    if (!this.rc) {
      return of(this.defaultFor(paramName));
    }
    return this.observeBoolean(paramName);
  }

  private observeBoolean(paramName: string): Observable<boolean> {
    const fb = this.defaultFor(paramName);
    return defer(() => {
      const read = () => this.safeAsBoolean(paramName, fb);
      return concat(
        of(read()),
        from(fetchAndActivate(this.rc!)).pipe(
          map(() => read()),
          catchError(() => of(read())),
        ),
      );
    }).pipe(
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private defaultFor(paramName: string): boolean {
    const map = REMOTE_CONFIG_DEFAULTS as Record<string, boolean>;
    return map[paramName] ?? false;
  }

  private safeAsBoolean(key: string, fallback: boolean): boolean {
    try {
      return getValue(this.rc!, key).asBoolean();
    } catch {
      return fallback;
    }
  }
}
