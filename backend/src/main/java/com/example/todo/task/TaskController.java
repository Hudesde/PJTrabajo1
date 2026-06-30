package com.example.todo.task;

import com.example.todo.task.dto.TaskRequest;
import com.example.todo.task.dto.TaskResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controlador REST del CRUD de tareas. Todas las rutas requieren JWT.
 *
 * <p>El usuario autenticado se obtiene con {@code @AuthenticationPrincipal}:
 * Spring inyecta el {@link UserDetails} que el filtro JWT colocó en el contexto
 * de seguridad. Su {@code username} se pasa al servicio para garantizar que
 * cada quien sólo opera sobre sus propias tareas.
 */
@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tareas", description = "CRUD de tareas del usuario autenticado")
@SecurityRequirement(name = "bearerAuth") // Swagger: estas rutas necesitan token
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @Operation(summary = "Listar tareas (opcionalmente filtradas por estado)")
    @GetMapping
    public List<TaskResponse> list(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(name = "status", required = false) TaskStatus status) {
        return taskService.list(user.getUsername(), status);
    }

    @Operation(summary = "Obtener una tarea por id")
    @GetMapping("/{id}")
    public TaskResponse getById(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        return taskService.get(user.getUsername(), id);
    }

    @Operation(summary = "Crear una tarea")
    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserDetails user,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.create(user.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "Actualizar una tarea existente")
    @PutMapping("/{id}")
    public TaskResponse update(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return taskService.update(user.getUsername(), id, request);
    }

    @Operation(summary = "Eliminar una tarea")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        taskService.delete(user.getUsername(), id);
        // 204 No Content: operación correcta, sin cuerpo de respuesta.
        return ResponseEntity.noContent().build();
    }
}
