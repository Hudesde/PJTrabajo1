import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

import {
  TaskStatus,
  TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../../../core/models/task.model';

/**
 * Resultado que devuelve el modal al cerrarse:
 *  - filter:         filtro por estado   (status = null   -> "Todas").
 *  - filterPriority: filtro por prioridad (priority = null -> "Todas").
 *  - create:         crear una tarea nueva.
 *  - undefined (X / backdrop / Escape): no hacer nada.
 */
export type QuickAction =
  | { action: 'filter'; status: TaskStatus | null }
  | { action: 'filterPriority'; priority: TaskPriority | null }
  | { action: 'create' };

/** Configuración opcional del modal (permite reusarlo en dashboard y calendario). */
export interface QuickActionsData {
  /** Título de la cabecera. */
  title?: string;
  /** Mostrar la fila de filtros por prioridad (por defecto: sí). */
  showPriority?: boolean;
  /** Mostrar el botón "Nueva tarea" (por defecto: sí). */
  showCreate?: boolean;
}

/**
 * Modal de acciones rápidas reutilizable. Sustituye a las antiguas subopciones
 * del menú lateral. Ofrece accesos de filtrado por estado y por prioridad y,
 * opcionalmente, crear una tarea.
 *
 * <p>No ejecuta la acción: sólo cierra devolviendo la intención; quien lo abre
 * (dashboard o calendario) decide qué hacer con ella.
 */
@Component({
  selector: 'app-quick-actions-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './quick-actions-dialog.component.html',
  styleUrl: './quick-actions-dialog.component.css',
})
export class QuickActionsDialogComponent {
  private readonly dialogRef =
    inject(MatDialogRef<QuickActionsDialogComponent, QuickAction>);
  private readonly data =
    inject<QuickActionsData>(MAT_DIALOG_DATA, { optional: true }) ?? {};

  /** Opciones de filtro por estado (además de "Todas", que es status = null). */
  readonly statusOptions = TASK_STATUS_OPTIONS;
  /** Opciones de filtro por prioridad (además de "Todas", que es priority = null). */
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;

  readonly title = this.data.title ?? '¿Qué quieres hacer?';
  readonly showPriority = this.data.showPriority ?? true;
  readonly showCreate = this.data.showCreate ?? true;

  /** Icono representativo de cada estado (mismos que usa el menú/tabla). */
  statusIcon(status: TaskStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'schedule';
      case 'EN_PROGRESO': return 'autorenew';
      case 'COMPLETADA': return 'check_circle';
    }
  }

  /** Cierra devolviendo un filtro por estado (null = todas). */
  filterBy(status: TaskStatus | null): void {
    this.dialogRef.close({ action: 'filter', status });
  }

  /** Cierra devolviendo un filtro por prioridad (null = todas). */
  filterByPriority(priority: TaskPriority | null): void {
    this.dialogRef.close({ action: 'filterPriority', priority });
  }

  /** Cierra devolviendo la intención de crear una tarea. */
  create(): void {
    this.dialogRef.close({ action: 'create' });
  }
}
