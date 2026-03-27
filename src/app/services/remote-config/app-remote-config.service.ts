import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';

/**
 * Flags y parámetros remotos (Firebase Remote Config u otro backend).
 */
@Injectable({ providedIn: 'root' })
export class AppRemoteConfigService {
  /** Ej.: límite de tareas, tema forzado, feature flags */
  getBoolean$(key: string): Observable<boolean> {
    throw new Error('Implementar con @angular/fire/remote-config o SDK nativo');
  }

  getString$(key: string): Observable<string> {
    throw new Error('Implementar con @angular/fire/remote-config o SDK nativo');
  }
}
