package com.example.todo.task.dto;

import com.example.todo.task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Datos de entrada para crear o actualizar una tarea.
 *
 * <p>Se usa el mismo DTO para POST (crear) y PUT (actualizar) porque los
 * campos editables son los mismos.
 */
public record TaskRequest(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título no puede superar 150 caracteres")
        String title,

        @Size(max = 5000, message = "La descripción es demasiado larga")
        String description,

        @NotNull(message = "El estado es obligatorio")
        TaskStatus status,

        // La fecha límite es opcional, por eso no lleva @NotNull.
        LocalDate dueDate
) {
}
