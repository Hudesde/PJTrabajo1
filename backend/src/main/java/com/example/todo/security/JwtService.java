package com.example.todo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * Servicio responsable de CREAR y VALIDAR los JSON Web Tokens (JWT).
 *
 * <p>Un JWT es una cadena firmada que contiene "claims" (datos). Aquí guardamos
 * el nombre de usuario en el campo {@code subject}. Como está firmado con una
 * clave secreta que sólo conoce el servidor, el cliente no puede falsificarlo.
 *
 * <p>La clave secreta y la expiración se leen de la configuración
 * ({@code application.yml} / variables de entorno), nunca se escriben a mano
 * en el código.
 */
@Service
public class JwtService {

    /** Clave secreta usada para firmar y verificar (mínimo 32 bytes para HS256). */
    private final SecretKey secretKey;

    /** Tiempo de vida del token en milisegundos. */
    private final long expirationMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMillis) {
        // Derivamos una clave HMAC-SHA a partir del texto secreto configurado.
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMillis = expirationMillis;
    }

    /**
     * Genera un token firmado para el usuario indicado.
     *
     * @param username nombre de usuario que quedará en el "subject" del token
     * @return el JWT como cadena compacta
     */
    public String generateToken(String username) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);
        return Jwts.builder()
                .subject(username)          // a quién pertenece el token
                .issuedAt(now)              // cuándo se emitió
                .expiration(expiry)         // cuándo caduca
                .signWith(secretKey)        // firma con la clave secreta
                .compact();
    }

    /** Extrae el nombre de usuario (subject) contenido en el token. */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Indica si el token es válido: la firma coincide, no ha caducado y el
     * usuario es el esperado.
     */
    public boolean isTokenValid(String token, String expectedUsername) {
        try {
            final String username = extractUsername(token);
            return username.equals(expectedUsername) && !isExpired(token);
        } catch (Exception ex) {
            // Cualquier error de parseo/firma/expiración -> token inválido.
            return false;
        }
    }

    // ----------------------- Métodos auxiliares -----------------------

    private boolean isExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /** Parsea el token, verifica la firma y aplica una función sobre los claims. */
    private <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = Jwts.parser()
                .verifyWith(secretKey)   // valida la firma con nuestra clave
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return resolver.apply(claims);
    }
}
