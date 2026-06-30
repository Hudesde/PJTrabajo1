package com.example.todo.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Datos de entrada para iniciar sesión.
 */
public record LoginRequest(

        @NotBlank(message = "El nombre de usuario es obligatorio")
        String username,

        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
