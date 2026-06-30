package com.example.todo.task.dto;

import com.example.todo.task.Task;
import com.example.todo.task.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Datos de salida que representan una tarea hacia el cliente.
 *
 * <p>No exponemos la entidad {@link Task} directamente: así evitamos filtrar
 * datos internos (como el propietario o relaciones JPA) y controlamos
 * exactamente qué se serializa a JSON.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {

    /** Convierte una entidad {@link Task} en su DTO de respuesta. */
    public static TaskResponse fromEntity(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
