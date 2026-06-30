package com.example.todo.exception;

import java.time.Instant;
import java.util.Map;

/**
 * Cuerpo JSON estándar para todas las respuestas de error de la API.
 *
 * <p>Tener un formato único facilita que el frontend muestre los mensajes
 * siempre de la misma forma.
 *
 * @param timestamp instante en que ocurrió el error
 * @param status    código HTTP (p. ej. 404)
 * @param error     texto del código HTTP (p. ej. "Not Found")
 * @param message   mensaje legible para el usuario
 * @param path      ruta que provocó el error
 * @param fieldErrors errores de validación por campo (vacío si no aplica)
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors
) {
}
