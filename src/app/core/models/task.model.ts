/** Entidad de dominio: Tarea */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  /** Referencia a {@link Category.id} cuando la tarea está categorizada; omitir o vacío = sin categoría */
  categoryId?: string;
  createdAt: string;
}
