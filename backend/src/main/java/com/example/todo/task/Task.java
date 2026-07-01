package com.example.todo.task;

import com.example.todo.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Entidad JPA que representa una tarea (To-Do).
 *
 * <p>Cada tarea pertenece a un único {@link User} (relación muchos-a-uno).
 * Esa relación es la base de la regla de negocio "cada usuario sólo ve y
 * modifica sus propias tareas".
 *
 * <p>La tabla {@code tasks} se crea con la migración Flyway
 * {@code V2__create_tasks_table.sql}.
 */
@Entity
@Table(name = "tasks")
public class Task {

    /** Clave primaria autogenerada. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Título de la tarea (obligatorio a nivel de BD). */
    @Column(nullable = false, length = 150)
    private String title;

    /** Descripción opcional, texto largo. */
    @Column(columnDefinition = "TEXT")
    private String description;

    /** Estado de la tarea. Se guarda como texto (PENDIENTE / EN_PROGRESO / COMPLETADA). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TaskStatus status;
    


    /** Prioridad de la tarea. Se guarda como texto (BAJA / NORMAL / ALTA). */
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 20)
    private TaskPriority priority;

    /** Fecha límite (opcional). Sólo fecha, sin hora. */
    @Column(name = "due_date")
    private LocalDate dueDate;

    /**
     * Usuario propietario de la tarea.
     * {@code FetchType.LAZY}: el usuario sólo se carga si se accede a él,
     * evitando consultas innecesarias.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    /** Constructor sin argumentos requerido por JPA. */
    protected Task() {
    }

    /** Constructor de conveniencia para crear una tarea nueva. */
    public Task(String title, String description, TaskStatus status, TaskPriority priority, LocalDate dueDate, User owner) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.dueDate = dueDate;
        this.owner = owner;
    }

    /** Se ejecuta antes de insertar: fija las marcas de tiempo iniciales. */
    @jakarta.persistence.PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /** Se ejecuta antes de cada UPDATE: actualiza la marca de modificación. */
    @jakarta.persistence.PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // ----------------------- Getters y setters -----------------------

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(TaskPriority priority) {
        this.priority = priority;
    }


    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
