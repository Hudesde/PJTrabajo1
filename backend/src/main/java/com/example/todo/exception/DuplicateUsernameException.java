package com.example.todo.exception;

/**
 * Se lanza al intentar registrar un nombre de usuario que ya existe.
 * El {@link GlobalExceptionHandler} la traduce a HTTP 409 (Conflict).
 */
public class DuplicateUsernameException extends RuntimeException {

    public DuplicateUsernameException(String message) {
        super(message);
    }
}
