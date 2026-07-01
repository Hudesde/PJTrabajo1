package com.example.todo.task;

import com.example.todo.exception.ResourceNotFoundException;
import com.example.todo.task.dto.TaskRequest;
import com.example.todo.task.dto.TaskResponse;
import com.example.todo.user.User;
import com.example.todo.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Test UNITARIO de {@link TaskService} con JUnit 5 + Mockito.
 *
 * <p>"Unitario" significa que probamos la lógica del servicio de forma aislada:
 * los repositorios son simulados (mocks), no hay base de datos ni Spring.
 * Así el test es rápido y sólo falla si falla la lógica del servicio.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskService taskService;

    private User owner;

    @BeforeEach
    void setUp() {
        owner = new User("ana", "hash");
        // Como el id lo genera la BD, lo fijamos por reflexión para el test.
        setId(owner, 1L);
    }

    @Test
    @DisplayName("create() guarda la tarea asociándola al usuario autenticado")
    void create_savesTaskForCurrentUser() {
        // GIVEN: el usuario existe y el repositorio devuelve lo que se le guarda.
        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(owner));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskRequest request = new TaskRequest(
                "Comprar pan", "Integral", TaskStatus.PENDIENTE, TaskPriority.MEDIA, LocalDate.now());

        // WHEN
        TaskResponse result = taskService.create("ana", request);

        // THEN: la respuesta refleja los datos enviados y se llamó a save().
        assertThat(result.title()).isEqualTo("Comprar pan");
        assertThat(result.status()).isEqualTo(TaskStatus.PENDIENTE);
        assertThat(result.priority()).isEqualTo(TaskPriority.MEDIA);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("list() sin filtro devuelve todas las tareas del usuario")
    void list_withoutFilter_returnsAllUserTasks() {
        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(owner));
        Task t1 = new Task("A", null, TaskStatus.PENDIENTE, TaskPriority.MEDIA, null, owner);
        Task t2 = new Task("B", null, TaskStatus.COMPLETADA, TaskPriority.ALTA, null, owner);
        when(taskRepository.findByOwnerIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(t1, t2));

        List<TaskResponse> result = taskService.list("ana", null);

        assertThat(result).hasSize(2);
        // Al no pasar estado, NO debe llamarse al método de filtrado por estado.
        verify(taskRepository, never())
                .findByOwnerIdAndStatusOrderByCreatedAtDesc(any(), any());
    }

    @Test
    @DisplayName("get() lanza 404 (ResourceNotFoundException) si la tarea no es del usuario")
    void get_whenTaskNotOwned_throwsNotFound() {
        when(userRepository.findByUsername("ana")).thenReturn(Optional.of(owner));
        // El repositorio no encuentra la tarea para ese propietario -> Optional vacío.
        when(taskRepository.findByIdAndOwnerId(99L, 1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.get("ana", 99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // -------- utilidad: asigna el id privado de una entidad por reflexión --------
    private static void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException(e);
        }
    }
}
