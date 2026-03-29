/** Nombres de parámetros (deben coincidir con Remote Config en la consola de Firebase). */
export const REMOTE_CONFIG_KEYS = {
  /** Si es true, la UI muestra «Eliminar todas las tareas». */
  showDeleteAllTasks: 'feature_show_delete_all_tasks',
} as const;

/**
 * Valores por defecto en cliente hasta que `fetchAndActivate` termine (y si falla la red).
 * Remote Config almacena strings; el SDK las convierte con `.asBoolean()`.
 */
export const REMOTE_CONFIG_DEFAULTS: Record<
  (typeof REMOTE_CONFIG_KEYS)[keyof typeof REMOTE_CONFIG_KEYS],
  boolean
> = {
  [REMOTE_CONFIG_KEYS.showDeleteAllTasks]: true,
};
