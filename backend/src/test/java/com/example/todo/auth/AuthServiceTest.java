package com.example.todo.auth;

import com.example.todo.auth.dto.AuthResponse;
import com.example.todo.auth.dto.RegisterRequest;
import com.example.todo.exception.DuplicateUsernameException;
import com.example.todo.security.JwtService;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test UNITARIO de {@link AuthService} con JUnit 5 + Mockito.
 *
 * <p>Verifica las dos reglas clave del registro:
 * <ul>
 *   <li>La contraseña se cifra (nunca se guarda en claro).</li>
 *   <li>No se permite registrar un nombre de usuario ya existente.</li>
 * </ul>
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("register() cifra la contraseña, guarda el usuario y devuelve un token")
    void register_hashesPasswordAndReturnsToken() {
        // GIVEN
        RegisterRequest request = new RegisterRequest("ana", "secreto123");
        when(userRepository.existsByUsername("ana")).thenReturn(false);
        when(passwordEncoder.encode("secreto123")).thenReturn("HASH");
        when(jwtService.generateToken("ana")).thenReturn("token-jwt");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // WHEN
        AuthResponse response = authService.register(request);

        // THEN: token correcto y contraseña cifrada en la entidad guardada.
        assertThat(response.token()).isEqualTo("token-jwt");
        assertThat(response.username()).isEqualTo("ana");

        // Capturamos el usuario guardado para comprobar que NO se guardó en claro.
        var captor = org.mockito.ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("HASH");
        assertThat(captor.getValue().getPassword()).isNotEqualTo("secreto123");
    }

    @Test
    @DisplayName("register() lanza 409 si el nombre de usuario ya existe")
    void register_whenUsernameTaken_throwsConflict() {
        when(userRepository.existsByUsername("ana")).thenReturn(true);

        assertThatThrownBy(() ->
                authService.register(new RegisterRequest("ana", "secreto123")))
                .isInstanceOf(DuplicateUsernameException.class);

        // No debe intentarse guardar nada si el nombre está duplicado.
        verify(userRepository, never()).save(any());
    }
}
