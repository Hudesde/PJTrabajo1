package com.example.todo.task;

import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.task.dto.TaskRequest;
import com.example.todo.task.dto.TaskResponse;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Lógica de negocio de las tareas.
 *
 * <p>Regla central: TODAS las operaciones reciben el {@code username} del
 * usuario autenticado y filtran por su id. De este modo es imposible que un
 * usuario acceda a tareas de otro (se traduce en 404, no en 403, para no
 * revelar siquiera que la tarea existe).
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lista las tareas del usuario. Si {@code status} es null devuelve todas;
     * en caso contrario filtra por ese estado.
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> list(String username, TaskStatus status) {
        Long ownerId = currentUser(username).getId();

        List<Task> tasks = (status == null)
                ? taskRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                : taskRepository.findByOwnerIdAndStatusOrderByCreatedAtDesc(ownerId, status);

        // Convertimos cada entidad a su DTO de respuesta.
        return tasks.stream().map(TaskResponse::fromEntity).toList();
    }

    /** Devuelve una tarea concreta del usuario, o 404 si no es suya / no existe. */
    @Transactional(readOnly = true)
    public TaskResponse get(String username, Long id) {
        return TaskResponse.fromEntity(findOwnedTask(username, id));
    }

    /** Crea una tarea nueva asociada al usuario. */
    @Transactional
    public TaskResponse create(String username, TaskRequest request) {
        User owner = currentUser(username);
        Task task = new Task(
                request.title(),
                request.description(),
                request.status(),
                request.dueDate(),
                owner);
        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    /** Actualiza una tarea existente del usuario. */
    @Transactional
    public TaskResponse update(String username, Long id, TaskRequest request) {
        Task task = findOwnedTask(username, id);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setDueDate(request.dueDate());
        // Al estar dentro de una transacción, JPA detecta el cambio y hace
        // UPDATE automáticamente (dirty checking); save() es opcional pero
        // lo dejamos explícito por claridad.
        Task saved = taskRepository.save(task);
        return TaskResponse.fromEntity(saved);
    }

    /** Elimina una tarea del usuario (404 si no es suya / no existe). */
    @Transactional
    public void delete(String username, Long id) {
        Task task = findOwnedTask(username, id);
        taskRepository.delete(task);
    }

    // ----------------------- Métodos auxiliares -----------------------

    /** Obtiene el usuario autenticado a partir de su nombre. */
    private User currentUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Usuario no encontrado: " + username));
    }

    /** Busca una tarea garantizando que pertenece al usuario indicado. */
    private Task findOwnedTask(String username, Long id) {
        Long ownerId = currentUser(username).getId();
        return taskRepository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Tarea no encontrada con id: " + id));
    }
}
