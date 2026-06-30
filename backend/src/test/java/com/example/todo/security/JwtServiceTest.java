package com.example.todo.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test UNITARIO de {@link JwtService}.
 *
 * <p>No necesita mocks: comprueba que un token generado se puede volver a leer
 * y validar correctamente, y que un token manipulado se rechaza.
 */
class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        // Secreto de prueba de longitud suficiente para HS256 (>= 32 bytes).
        jwtService = new JwtService(
                "unit-test-secret-key-1234567890-abcdefghij", 3_600_000L);
    }

    @Test
    @DisplayName("El token generado contiene el usuario y se valida correctamente")
    void generatedToken_isValidAndContainsUsername() {
        String token = jwtService.generateToken("ana");

        assertThat(jwtService.extractUsername(token)).isEqualTo("ana");
        assertThat(jwtService.isTokenValid(token, "ana")).isTrue();
    }

    @Test
    @DisplayName("El token NO es válido para un usuario distinto")
    void token_isInvalidForDifferentUser() {
        String token = jwtService.generateToken("ana");

        assertThat(jwtService.isTokenValid(token, "otro")).isFalse();
    }

    @Test
    @DisplayName("Un token corrupto se considera inválido (no lanza excepción)")
    void corruptedToken_isInvalid() {
        assertThat(jwtService.isTokenValid("esto-no-es-un-jwt", "ana")).isFalse();
    }
}
