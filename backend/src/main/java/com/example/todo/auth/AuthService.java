package com.example.todo.auth;

import com.example.todo.auth.dto.AuthResponse;
import com.example.todo.auth.dto.LoginRequest;
import com.example.todo.auth.dto.RegisterRequest;
import com.example.todo.exception.DuplicateUsernameException;
import com.example.todo.security.JwtService;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Lógica de negocio de autenticación: registro e inicio de sesión.
 *
 * <p>Mantener la lógica aquí (y no en el controller) facilita probarla de
 * forma aislada con tests unitarios.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Registra un usuario nuevo y devuelve directamente su token (para que el
     * frontend pueda dejarlo logueado tras el registro).
     *
     * @throws DuplicateUsernameException si el nombre ya está en uso
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateUsernameException(
                    "El nombre de usuario ya está en uso: " + request.username());
        }

        // Nunca guardamos la contraseña en claro: se cifra con BCrypt.
        String hashedPassword = passwordEncoder.encode(request.password());
        User user = new User(request.username(), hashedPassword);
        userRepository.save(user);

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername());
    }

    /**
     * Valida usuario+contraseña y, si son correctos, devuelve un token nuevo.
     *
     * <p>Delegamos en el {@link AuthenticationManager}, que internamente usa
     * nuestro {@code UserDetailsService} + BCrypt. Si las credenciales son
     * incorrectas lanza {@code BadCredentialsException} (HTTP 401).
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.username(), request.password()));

        String token = jwtService.generateToken(request.username());
        return new AuthResponse(token, request.username());
    }
}
