package com.example.todo.security;

import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Adaptador entre NUESTRA entidad {@link User} y el modelo de seguridad de
 * Spring ({@link UserDetails}).
 *
 * <p>Spring Security necesita un {@code UserDetailsService} para saber cómo
 * cargar un usuario a partir de su nombre. Mantenemos la entidad de dominio
 * separada del modelo de seguridad y aquí hacemos la "traducción".
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Carga un usuario por su nombre. Lo llama Spring Security durante la
     * autenticación.
     *
     * @throws UsernameNotFoundException si no existe el usuario
     */
    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Usuario no encontrado: " + username));

        // Construimos el UserDetails estándar de Spring. No usamos roles
        // (la app sólo distingue "autenticado" vs "anónimo"), por eso la
        // lista de autoridades va vacía.
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .authorities(Collections.emptyList())
                .build();
    }
}
