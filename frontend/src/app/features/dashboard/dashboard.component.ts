import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../../core/models/task.model';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../shared/confirm-dialog/confirm-dialog.component';
import {
  TaskFormDialogComponent,
  TaskDialogData,
} from './task-form-dialog/task-form-dialog.component';
import {
  QuickActionsDialogComponent,
  QuickAction,
} from './quick-actions-dialog/quick-actions-dialog.component';

/**
 * Dashboard principal (estilo SaaS): toolbar, tarjetas de resumen, buscador,
 * filtro por estado (Reactive Forms), tabla con paginación/orden y chips de
 * estado. Las acciones de crear/editar/eliminar usan MatDialog.
 *
 * <p>La lógica de negocio y el {@link TaskService} no cambian: el filtrado y la
 * búsqueda se resuelven en el cliente para una UX instantánea y para mostrar
 * contadores precisos en las tarjetas de resumen.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    EmptyStateComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {

  /** Id de tarea expandida en móvil (null = ninguna). */
  readonly expandedTaskId = signal<number | null>(null);
  /** Indica si la vista está en móvil (ancho menor a 720px). */
  readonly isMobile = signal<boolean>(window.innerWidth <= 720);

  private resizeListener = () => this.isMobile.set(window.innerWidth <= 720);

  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Opciones del filtro de prioridad (incluye "Todas"). */
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;

  /** Opciones del filtro de estado (incluye "Todas"). */
  readonly statusOptions = TASK_STATUS_OPTIONS;

  /** Columnas visibles de la tabla. */
  readonly displayedColumns = ['title', 'status', 'dueDate', 'priority'];

  /** Controles reactivos para filtro y búsqueda. */
  readonly statusFilter = new FormControl<TaskStatus | null>(null);
  readonly priorityFilter = new FormControl<TaskPriority | null>(null);
  readonly search = new FormControl<string>('', { nonNullable: true });

  /** Fuente de datos de la tabla (gestiona paginación y orden). */
  readonly dataSource = new MatTableDataSource<Task>([]);

  /** Estado de la vista. */
  readonly allTasks = signal<Task[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  /** Nº de tareas tras aplicar filtro/búsqueda (para el estado "sin resultados"). */
  readonly resultCount = signal(0);

  /** Usuario en sesión. */
  readonly username = this.authService.currentUser;

  /** Nº total de tareas (para decidir el estado "sin tareas"). */
  readonly total = computed(() => this.allTasks().length);

  // ViewChild como setter: asigna paginator/sort en cuanto aparecen en el DOM
  // (la tabla se renderiza condicionalmente, así que pueden no existir al inicio).
  private _paginator?: MatPaginator;
  private _sort?: MatSort;

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this._paginator = value;
    if (value) {
      this.dataSource.paginator = value;
    }
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this._sort = value;
    if (value) {
      this.dataSource.sort = value;
    }
  }

  ngOnInit(): void {
    this.loadTasks();

    this.route.queryParamMap.subscribe((params) => {
      const statusParam = params.get('status');
      const status = this.parseStatus(statusParam);
      if (this.statusFilter.value !== status) {
        this.statusFilter.setValue(status, { emitEvent: false });
      }
      this.applyFilters();
    });

    this.statusFilter.valueChanges.subscribe((status) => {
      this.applyFilters();
      this.updateRouteStatus(status);
    });
    // El filtro de prioridad sólo afecta al listado en memoria (no va en la URL).
    this.priorityFilter.valueChanges.subscribe(() => this.applyFilters());
    this.search.valueChanges.subscribe(() => this.applyFilters());
    window.addEventListener('resize', this.resizeListener);

    // Modal de acciones rápidas: se abre en cuanto se llega al dashboard.
    // Se difiere un tick para no chocar con la detección de cambios inicial.
    setTimeout(() => this.openQuickActions());
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeListener);
  }

  /** Alterna la fila expandida en móvil. */
  toggleRow(task: Task): void {
    if (!this.isMobile()) {
      return;
    }
    this.expandedTaskId.update((id) => (id === task.id ? null : task.id));
  }

  /** Carga TODAS las tareas del usuario desde la API. */
  loadTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.list().subscribe({
      next: (tasks) => {
        this.allTasks.set(tasks);
        this.applyFilters();
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.buildErrorMessage(err));
      },
    });
  }

  /** Aplica filtro por estado + prioridad + búsqueda y actualiza la tabla. */
  private applyFilters(): void {
    const status = this.statusFilter.value;
    const priority = this.priorityFilter.value;
    const term = this.search.value.trim().toLowerCase();

    const filtered = this.allTasks().filter((t) => {
      const matchesStatus = !status || t.status === status;
      const matchesPriority = !priority || t.priority === priority;
      const matchesTerm =
        !term ||
        t.title.toLowerCase().includes(term) ||
        (t.description?.toLowerCase().includes(term) ?? false);
      return matchesStatus && matchesPriority && matchesTerm;
    });

    this.dataSource.data = filtered;
    this.resultCount.set(filtered.length);
    this._paginator?.firstPage();
  }

  /** Limpia los filtros (estado + prioridad) y la búsqueda. */
  clearFilters(): void {
    this.statusFilter.setValue(null);
    this.priorityFilter.setValue(null);
    this.search.setValue('');
  }

  private parseStatus(status: string | null): TaskStatus | null {
    return status === 'PENDIENTE' || status === 'EN_PROGRESO' || status === 'COMPLETADA'
      ? status
      : null;
  }

  private updateRouteStatus(status: TaskStatus | null): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: status ?? null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Abre el modal de acciones rápidas (al entrar al dashboard). Según lo que
   * elija el usuario, aplica un filtro por estado o abre el alta de tarea.
   */
  private openQuickActions(): void {
    const ref = this.dialog.open(QuickActionsDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      autoFocus: false,
    });
    ref.afterClosed().subscribe((result?: QuickAction) => {
      if (!result) {
        return; // Cerrado con la X, backdrop o Escape: no hacer nada.
      }
      switch (result.action) {
        case 'filter':
          // setValue dispara valueChanges -> applyFilters() + sincroniza la URL.
          this.statusFilter.setValue(result.status);
          break;
        case 'filterPriority':
          this.priorityFilter.setValue(result.priority);
          break;
        case 'create':
          this.openCreate();
          break;
      }
    });
  }

  /** Abre el diálogo para crear una tarea. */
  openCreate(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((created?: Task) => {
      if (created) {
        this.notify('Tarea creada correctamente', 'success');
        this.loadTasks();
      }
    });
  }

  /** Abre el diálogo para editar una tarea. */
  openEdit(task: Task): void {
    const data: TaskDialogData = { task };
    const ref = this.dialog.open(TaskFormDialogComponent, {
      width: '520px',
      maxWidth: '95vw',
      autoFocus: 'first-tabbable',
      data,
    });
    ref.afterClosed().subscribe((updated?: Task) => {
      if (updated) {
        this.notify('Tarea actualizada', 'success');
        this.loadTasks();
      }
    });
  }

  /** Pide confirmación y elimina la tarea. */
  deleteTask(task: Task): void {
    const data: ConfirmDialogData = {
      title: 'Eliminar tarea',
      message: `¿Seguro que quieres eliminar "${task.title}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    };
    const ref = this.dialog.open(ConfirmDialogComponent, { width: '420px', data });
    ref.afterClosed().subscribe((confirmed?: boolean) => {
      if (!confirmed) {
        return;
      }
      this.taskService.delete(task.id).subscribe({
        next: () => {
          this.notify('Tarea eliminada', 'success');
          this.loadTasks();
        },
        error: (err: HttpErrorResponse) =>
          this.notify(this.buildErrorMessage(err), 'error'),
      });
    });
  }

  // ----------------------- helpers de presentación -----------------------

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
    }
  }

  /** Clase CSS para el chip de estado (color por estado). */
  statusChipClass(status: TaskStatus): string {
    return `status-chip status-${status.toLowerCase()}`;
  }

  /** Etiqueta legible de la prioridad. */
  priorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case 'BAJA': return 'Baja';
      case 'MEDIA': return 'Media';
      case 'ALTA': return 'Alta';
    }
  }

  /** Clase CSS para el chip de prioridad (color por prioridad). */
  priorityChipClass(priority: TaskPriority): string {
    return `priority-chip priority-${priority.toLowerCase()}`;
  }

  /** Indica si una tarea pendiente/en progreso está vencida (fecha pasada). */
  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETADA') {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  }

  private notify(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3500,
      panelClass: `snack-${type}`,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    });
  }

  private buildErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está el backend en marcha?';
    }
    return err.error?.message ?? 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
}
