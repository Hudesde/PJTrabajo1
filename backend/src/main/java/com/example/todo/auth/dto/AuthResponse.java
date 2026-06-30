package com.example.todo.auth.dto;

/**
 * Respuesta devuelta tras un registro o login correcto.
 *
 * @param token    el JWT que el cliente debe enviar en las siguientes peticiones
 * @param username el nombre del usuario autenticado (cómodo para la UI)
 */
public record AuthResponse(String token, String username) {
}
