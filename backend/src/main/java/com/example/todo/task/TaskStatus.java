package com.example.todo.task;

/**
 * Estados posibles de una tarea.
 *
 * <p>Se almacena en base de datos como texto (ver {@code @Enumerated(EnumType.STRING)}
 * en la entidad {@link Task}) para que la columna sea legible y estable aunque
 * se reordenen los valores del enum.
 */
public enum TaskStatus {
    PENDIENTE,
    EN_PROGRESO,
    COMPLETADA
}
