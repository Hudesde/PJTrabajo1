import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import {
  MAT_DATE_LOCALE,
  provideNativeDateAdapter,
} from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../../core/services/task.service';
import {
  Task,
  TaskRequest,
  TaskStatus,
  TaskPriority,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '../../../core/models/task.model';

/** Datos opcionales del diálogo: si llega `task`, es modo edición. */
export interface TaskDialogData {
  task?: Task;
}

/**
 * Diálogo para CREAR o EDITAR una tarea (MatDialog + Reactive Forms).
 *
 * IMPORTANTE: no modifica la lógica de negocio ni el servicio: simplemente
 * reutiliza {@link TaskService} (create/update) y devuelve el resultado al
 * cerrarse para que el dashboard recargue la lista.
 */
@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  // Adaptador de fechas nativo en español (DD/MM/YYYY) para el MatDatepicker.
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },

  ],
  templateUrl: './task-form-dialog.component.html',
  styleUrl: './task-form-dialog.component.css',
})
export class TaskFormDialogComponent {

  private readonly fb = inject(FormBuilder);
  private readonly taskService = inject(TaskService);
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly data = inject<TaskDialogData>(MAT_DIALOG_DATA);

  readonly statusOptions = TASK_STATUS_OPTIONS;
  readonly priorityOptions = TASK_PRIORITY_OPTIONS;
  readonly isEdit = !!this.data?.task;
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  /** Formulario reactivo. La fecha se maneja como Date y se convierte a texto. */
  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    status: ['PENDIENTE' as TaskStatus, Validators.required],
    priority: ['MEDIA' as TaskPriority, Validators.required],
    dueDate: [null as Date | null],
  });

  constructor() {
    // En modo edición, precargamos los datos de la tarea.
    const task = this.data?.task;
    if (task) {
      this.form.setValue({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: this.parseDate(task.dueDate),
      });
    }
  }

  /** Crea o actualiza la tarea y cierra el diálogo devolviendo el resultado. */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload: TaskRequest = {
      title: raw.title.trim(),
      description: raw.description.trim() === '' ? null : raw.description.trim(),
      status: raw.status,
      priority: raw.priority,
      dueDate: this.formatDate(raw.dueDate),
    };

    const request$ = this.isEdit
      ? this.taskService.update(this.data.task!.id, payload)
      : this.taskService.create(payload);

    request$.subscribe({
      next: (task) => {
        this.saving.set(false);
        // Devolvemos la tarea creada/editada al dashboard.
        this.dialogRef.close(task);
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.errorMessage.set(this.buildErrorMessage(err));
      },
    });
  }

  // ----------------------- helpers de fecha -----------------------

  /** Convierte un Date a texto 'YYYY-MM-DD' (en horario local) o null. */
  private formatDate(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /** Convierte un texto 'YYYY-MM-DD' a Date (evitando desfases de zona). */
  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private buildErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    return err.error?.message ?? 'No se pudo guardar la tarea. Inténtalo de nuevo.';
  }
}
