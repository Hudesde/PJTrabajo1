/**
 * Modelos (tipos) del dominio "tarea".
 *
 * Definir interfaces y tipos hace que el editor avise de errores y que el
 * código sea autoexplicativo.
 */

/** Estados posibles de una tarea (coinciden con el enum del backend). */
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';

/** Tarea tal y como la devuelve la API (respuesta). */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;   // formato ISO 'YYYY-MM-DD'
  createdAt: string;
  updatedAt: string;
}

/** Datos que se envían al crear o actualizar una tarea (petición). */
export interface TaskRequest {
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
}

/**
 * Lista de estados con su etiqueta legible. Se usa para pintar el menú lateral
 * y el selector de estado en el formulario. El valor `null` representa "Todas".
 */
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'EN_PROGRESO', label: 'En progreso' },
  { value: 'COMPLETADA', label: 'Completadas' },
];
