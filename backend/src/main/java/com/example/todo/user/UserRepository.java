package com.example.todo.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repositorio de acceso a datos de {@link User}.
 *
 * <p>Al extender {@link JpaRepository} obtenemos gratis los métodos CRUD
 * (save, findById, findAll, delete...). Spring Data genera la implementación
 * en tiempo de ejecución; no hay que escribir SQL.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Busca un usuario por su nombre de usuario.
     * Spring Data deduce la consulta a partir del nombre del método.
     */
    Optional<User> findByUsername(String username);

    /** Indica si ya existe un usuario con ese nombre (para validar el registro). */
    boolean existsByUsername(String username);
}
