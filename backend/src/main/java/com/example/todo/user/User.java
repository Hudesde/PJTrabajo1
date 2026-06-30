package com.example.todo.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Entidad JPA que representa a un usuario registrado.
 *
 * <p>IMPORTANTE: las entidades NO se exponen directamente en los controllers
 * (se usan DTOs). En concreto, esta entidad guarda el hash de la contraseña,
 * que nunca debe viajar al cliente.
 *
 * <p>La tabla real ({@code users}) se crea mediante la migración Flyway
 * {@code V1__create_users_table.sql}, no mediante Hibernate, para tener un
 * control versionado del esquema.
 */
@Entity
@Table(name = "users")
public class User {

    /** Clave primaria autogenerada por la base de datos (columna IDENTITY). */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nombre de usuario único usado para iniciar sesión. */
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** Contraseña cifrada con BCrypt (nunca en texto plano). */
    @Column(name = "password_hash", nullable = false)
    private String password;

    /** Fecha/hora de creación del registro. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /**
     * JPA exige un constructor sin argumentos (lo usa al rehidratar entidades
     * desde la base de datos).
     */
    protected User() {
    }

    /** Constructor de conveniencia para crear un usuario nuevo. */
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    /**
     * Callback de JPA: se ejecuta justo antes de insertar la fila.
     * Garantiza que {@code createdAt} siempre tenga valor.
     */
    @jakarta.persistence.PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    // ----------------------- Getters y setters -----------------------
    // (Se escriben de forma explícita, sin Lombok, para que el código sea
    //  totalmente transparente y fácil de explicar.)

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
