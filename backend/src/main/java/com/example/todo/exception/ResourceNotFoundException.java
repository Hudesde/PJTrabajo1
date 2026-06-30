package com.example.todo.exception;

/**
 * Se lanza cuando se busca un recurso que no existe (o que no pertenece al
 * usuario actual). El {@link GlobalExceptionHandler} la traduce a HTTP 404.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
