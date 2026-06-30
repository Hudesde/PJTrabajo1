package com.example.todo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Datos de entrada para registrar un usuario nuevo.
 *
 * <p>Es un {@code record}: una clase inmutable y concisa, ideal para DTOs.
 * Las anotaciones de Bean Validation se comprueban automáticamente cuando el
 * controller anota el parámetro con {@code @Valid}.
 */
public record RegisterRequest(

        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(min = 3, max = 50, message = "El usuario debe tener entre 3 y 50 caracteres")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 100, message = "La contraseña debe tener al menos 6 caracteres")
        String password
) {
}
