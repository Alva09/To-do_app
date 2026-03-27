/** Entidad de dominio: Tarea */
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId?: string;
  createdAt: string;
}
