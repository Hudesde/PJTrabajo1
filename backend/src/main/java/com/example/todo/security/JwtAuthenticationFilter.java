package com.example.todo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro que se ejecuta UNA vez por petición y se encarga de:
 * <ol>
 *   <li>Leer la cabecera {@code Authorization: Bearer <token>}.</li>
 *   <li>Validar el token con {@link JwtService}.</li>
 *   <li>Si es válido, marcar al usuario como autenticado en el
 *       {@code SecurityContext} para que el resto de la app lo trate como tal.</li>
 * </ol>
 *
 * <p>Si no hay token o es inválido, simplemente no autentica y deja seguir la
 * cadena de filtros; será Spring Security quien rechace (401) las rutas
 * protegidas.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader(HEADER);

        // 1) Sin cabecera Bearer -> no hay nada que autenticar, seguimos.
        if (authHeader == null || !authHeader.startsWith(PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2) Extraemos el token (lo que va después de "Bearer ").
        final String token = authHeader.substring(PREFIX.length());
        final String username = safeExtractUsername(token);

        // 3) Si hay usuario y todavía no está autenticado en este contexto...
        if (username != null
                && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            // 4) Verificamos firma + expiración + coincidencia de usuario.
            if (jwtService.isTokenValid(token, userDetails.getUsername())) {
                var authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                // A partir de aquí, la petición se considera autenticada.
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    /** Extrae el usuario del token sin lanzar excepción si el token es inválido. */
    private String safeExtractUsername(String token) {
        try {
            return jwtService.extractUsername(token);
        } catch (Exception ex) {
            return null;
        }
    }
}
