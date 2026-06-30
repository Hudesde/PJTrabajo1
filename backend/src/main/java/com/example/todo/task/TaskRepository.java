package com.example.todo.task;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio de acceso a datos de {@link Task}.
 *
 * <p>Las consultas están siempre filtradas por el id del propietario para
 * garantizar el aislamiento entre usuarios: un usuario nunca puede leer ni
 * tocar las tareas de otro.
 */
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Todas las tareas de un usuario, ordenadas de más nueva a más antigua. */
    List<Task> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    /** Tareas de un usuario filtradas por estado. */
    List<Task> findByOwnerIdAndStatusOrderByCreatedAtDesc(Long ownerId, TaskStatus status);

    /**
     * Busca una tarea por su id PERO sólo si pertenece al usuario indicado.
     * Devuelve vacío si la tarea no existe o es de otro usuario.
     */
    Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);
}
