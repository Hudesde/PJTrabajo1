/**
 * Modelos (tipos) del dominio "tarea".
 *
 * Definir interfaces y tipos hace que el editor avise de errores y que el
 * código sea autoexplicativo.
 */

/** Estados posibles de una tarea (coinciden con el enum del backend). */
export type TaskStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA';
export type TaskPriority = 'BAJA' | 'MEDIA' | 'ALTA';
/** Tarea tal y como la devuelve la API (respuesta). */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;   // formato ISO 'YYYY-MM-DD'
  createdAt: string;
  updatedAt: string;
}

/** Datos que se envían al crear o actualizar una tarea (petición). */
export interface TaskRequest {
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
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


/**
 * Lista de prioridades con su etiqueta legible. Se usa tanto para el selector
 * del formulario como para el filtro del dashboard (donde `null` = "Todas").
 */
export const TASK_PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
];


