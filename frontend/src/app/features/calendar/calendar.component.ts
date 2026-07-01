import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus, TaskPriority } from '../../core/models/task.model';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import {
  QuickActionsDialogComponent,
  QuickAction,
} from '../dashboard/quick-actions-dialog/quick-actions-dialog.component';

interface MonthDay {
  dateValue: string;
  display: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

interface CalendarSegment {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  /** 'bar' para pendiente/en progreso; 'dot' (círculo) para completada. */
  kind: 'bar' | 'dot';
  isOverdue: boolean;
  label: string;
  /** Descripción de la tarea (para la tarjeta flotante). */
  description: string | null;
  leftPct: number;
  widthPct: number;
  row: number;
  startOffset: number;
  endOffset: number;
}

interface WeekRow {
  weekLabel: string;
  days: MonthDay[];
  segments: CalendarSegment[];
  rowCount: number;
}

interface TaskGroup {
  label: string;
  dateValue: string | null;
  tasks: Task[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDialogModule,
    EmptyStateComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {

  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasPendingTasks = signal(false);
  readonly taskGroups = signal<TaskGroup[]>([]);
  readonly pendingCount = signal(0);
  readonly overdueCount = signal(0);
  readonly calendarWeeks = signal<WeekRow[]>([]);
  readonly weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  /** Mes que se está visualizando en la rejilla (se cambia con ‹ ›). */
  private readonly viewDate = signal(new Date());
  /** Etiqueta del mes visualizado, p. ej. "Julio de 2026". */
  readonly monthLabel = computed(() => {
    const label = this.viewDate().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  /** Todas las tareas del usuario (sin filtrar). */
  private readonly allTasks = signal<Task[]>([]);
  /** Filtro por estado (null = Todas, incluye completadas). */
  private readonly statusFilter = signal<TaskStatus | null>(null);
  /** Filtro por prioridad (null = Todas). */
  private readonly priorityFilter = signal<TaskPriority | null>(null);

  /** Segmento sobre el que está el ratón (para la tarjeta flotante); null = ninguno. */
  readonly hovered = signal<CalendarSegment | null>(null);
  /** Posición (viewport) donde se dibuja la tarjeta flotante. */
  readonly hoverPos = signal<{ x: number; y: number }>({ x: 0, y: 0 });

  ngOnInit(): void {
    this.load();
    // Modal de filtrado: se abre al entrar al calendario (igual que el dashboard).
    setTimeout(() => this.openFilterModal());
  }

  load(): void {
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

  /**
   * Abre el modal de filtrado del calendario (sin "Nueva tarea"). Según lo que
   * elija el usuario, aplica el filtro por estado o por prioridad. Se llama al
   * entrar y desde el botón "Filtrar" de la cabecera.
   */
  openFilterModal(): void {
    const ref = this.dialog.open(QuickActionsDialogComponent, {
      width: '440px',
      maxWidth: '95vw',
      autoFocus: false,
      data: { title: 'Filtrar calendario', showPriority: true, showCreate: false },
    });
    ref.afterClosed().subscribe((result?: QuickAction) => {
      if (!result) {
        return; // Cerrado sin elegir: se mantiene el filtro actual.
      }
      if (result.action === 'filter') {
        this.statusFilter.set(result.status);
        this.applyFilters();
      } else if (result.action === 'filterPriority') {
        this.priorityFilter.set(result.priority);
        this.applyFilters();
      }
    });
  }

  /** Recalcula lo que se muestra aplicando los filtros de estado y prioridad. */
  private applyFilters(): void {
    const status = this.statusFilter();
    const priority = this.priorityFilter();

    const visible = this.allTasks().filter((task) => {
      const matchesStatus = !status || task.status === status;
      const matchesPriority = !priority || task.priority === priority;
      return matchesStatus && matchesPriority;
    });

    // "Por realizar" = tareas visibles no completadas; "Vencidas" = visibles vencidas.
    this.pendingCount.set(visible.filter((t) => t.status !== 'COMPLETADA').length);
    this.overdueCount.set(visible.filter((task) => this.isOverdue(task)).length);
    this.taskGroups.set(this.buildGroups(visible));
    this.calendarWeeks.set(this.buildCalendarWeeks(visible));
    this.hasPendingTasks.set(visible.length > 0);
  }

  /** Retrocede un mes en la rejilla del calendario. */
  prevMonth(): void { this.shiftMonth(-1); }
  /** Avanza un mes en la rejilla del calendario. */
  nextMonth(): void { this.shiftMonth(1); }

  private shiftMonth(delta: number): void {
    const d = this.viewDate();
    this.viewDate.set(new Date(d.getFullYear(), d.getMonth() + delta, 1));
    this.applyFilters(); // Reconstruye la rejilla para el nuevo mes.
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
    }
  }

  priorityLabel(priority: TaskPriority): string {
    switch (priority) {
      case 'BAJA': return 'Baja';
      case 'MEDIA': return 'Media';
      case 'ALTA': return 'Alta';
    }
  }

  /** Muestra la tarjeta flotante con la info de la tarea al pasar el ratón. */
  showCard(segment: CalendarSegment, event: MouseEvent): void {
    const cardW = 340;
    const cardH = 200;
    let x = event.clientX + 16;
    let y = event.clientY + 16;
    // Evita que la tarjeta se salga de la pantalla.
    if (x + cardW > window.innerWidth) {
      x = event.clientX - cardW - 16;
    }
    if (y + cardH > window.innerHeight) {
      y = window.innerHeight - cardH - 12;
    }
    this.hoverPos.set({ x: Math.max(8, x), y: Math.max(8, y) });
    this.hovered.set(segment);
  }

  /** Oculta la tarjeta flotante al salir de la tarea. */
  hideCard(): void {
    this.hovered.set(null);
  }

  formatDueDate(value: string | null): string {
    if (!value) {
      return 'Sin fecha límite';
    }
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'COMPLETADA') {
      return false;
    }
    return this.dayIndex(task.dueDate) < this.todayIndex();
  }

  trackByGroup(_: number, group: TaskGroup): string | null {
    return group.dateValue ?? 'none';
  }

  trackByTask(_: number, task: Task): number {
    return task.id;
  }

  trackByWeek(_: number, week: WeekRow): string {
    return week.weekLabel;
  }

  trackBySegment(_: number, segment: CalendarSegment): number {
    return segment.id;
  }

  private buildGroups(tasks: Task[]): TaskGroup[] {
    const groups = new Map<string | null, TaskGroup>();

    for (const task of tasks) {
      const key = task.dueDate ?? null;
      const label = task.dueDate ? this.formatDueDate(task.dueDate) : 'Sin fecha límite';
      const group = groups.get(key) ?? { label, dateValue: key, tasks: [] };
      group.tasks.push(task);
      groups.set(key, group);
    }

    const sorted = Array.from(groups.values());
    sorted.forEach((group) => {
      group.tasks.sort((a, b) => this.sortByDueDate(a, b));
    });

    sorted.sort((a, b) => {
      if (a.dateValue === null) { return 1; }
      if (b.dateValue === null) { return -1; }
      return this.dayIndex(a.dateValue) - this.dayIndex(b.dateValue);
    });

    return sorted;
  }

  private buildCalendarWeeks(tasks: Task[]): WeekRow[] {
    const today = new Date();
    const base = this.viewDate();          // Mes que se está visualizando.
    const month = base.getMonth();
    const year = base.getFullYear();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const startDay = startOfMonth.getDay();
    const mondayStart = new Date(startOfMonth);
    mondayStart.setDate(startOfMonth.getDate() - ((startDay + 6) % 7));

    const endDay = endOfMonth.getDay();
    const sundayEnd = new Date(endOfMonth);
    sundayEnd.setDate(endOfMonth.getDate() + ((7 - ((endDay + 6) % 7) - 1 + 7) % 7));

    const weeks: WeekRow[] = [];
    const allDays: MonthDay[] = [];
    for (let dt = new Date(mondayStart); dt <= sundayEnd; dt.setDate(dt.getDate() + 1)) {
      const current = new Date(dt);
      allDays.push({
        dateValue: this.formatISODate(current),
        display: String(current.getDate()),
        isCurrentMonth: current.getMonth() === month,
        isToday: this.isSameDay(current, today),
      });
    }

    for (let i = 0; i < allDays.length; i += 7) {
      const weekDays = allDays.slice(i, i + 7);
      weeks.push({
        weekLabel: this.formatWeekLabel(weekDays, Math.floor(i / 7) + 1),
        days: weekDays,
        segments: [],
        rowCount: 1,
      });
    }

    for (const week of weeks) {
      const weekStart = this.dayIndex(week.days[0].dateValue);
      const weekEnd = this.dayIndex(week.days[6].dateValue);
      const segments: CalendarSegment[] = [];

      for (const task of tasks) {
        // Completadas: no se dibuja barra, sólo un círculo en la fecha de entrega
        // (o de creación si no tiene fecha límite).
        if (task.status === 'COMPLETADA') {
          const dueIdx = this.dayIndex(task.dueDate ?? task.createdAt);
          if (dueIdx < weekStart || dueIdx > weekEnd) {
            continue;
          }
          const offset = dueIdx - weekStart;
          segments.push({
            id: task.id * 100 + weekStart,
            title: task.title,
            status: task.status,
            priority: task.priority,
            kind: 'dot',
            isOverdue: false,
            label: task.dueDate ? this.formatDueDate(task.dueDate) : 'Sin fecha',
            description: task.description,
            leftPct: (offset / 7) * 100,
            widthPct: (1 / 7) * 100,
            row: 0,
            startOffset: offset,
            endOffset: offset,
          });
          continue;
        }

        const taskStart = this.dayIndex(task.createdAt);
        const taskEnd = this.dayIndex(task.dueDate ?? task.createdAt);
        if (taskEnd < weekStart || taskStart > weekEnd) {
          continue;
        }

        const segmentStart = Math.max(taskStart, weekStart);
        const segmentEnd = Math.min(taskEnd, weekEnd);
        const startOffset = segmentStart - weekStart;
        const span = segmentEnd - segmentStart + 1;

        segments.push({
          id: task.id * 100 + weekStart,
          title: task.title,
          status: task.status,
          priority: task.priority,
          kind: 'bar',
          isOverdue: this.isOverdue(task),
          label: task.dueDate ? this.formatDueDate(task.dueDate) : 'Sin fecha',
          description: task.description,
          leftPct: (startOffset / 7) * 100,
          widthPct: (span / 7) * 100,
          row: 0,
          startOffset,
          endOffset: startOffset + span - 1,
        });
      }

      segments.sort((a, b) => a.leftPct - b.leftPct || a.widthPct - b.widthPct);
      const rows: CalendarSegment[][] = [];
      for (const segment of segments) {
        let rowIndex = 0;
        while (true) {
          const row = rows[rowIndex] ?? [];
          const overlap = row.some((existing) => !(segment.endOffset < existing.startOffset || segment.startOffset > existing.endOffset));
          if (!overlap) {
            segment.row = rowIndex;
            row.push(segment);
            rows[rowIndex] = row;
            break;
          }
          rowIndex += 1;
        }
      }

      week.segments = segments;
      week.rowCount = Math.max(1, segments.reduce((max, current) => Math.max(max, current.row + 1), 0));
    }

    return weeks;
  }

  private formatWeekLabel(days: MonthDay[], weekNumber: number): string {
    const start = this.parseISODate(days[0].dateValue);
    const end = this.parseISODate(days[6].dateValue);
    return `${this.formatShortDate(start)} – ${this.formatShortDate(end)}`;
  }

  private parseISODate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  private formatShortDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    }).replace(/\./g, '');
  }

  private sortByDueDate(a: Task, b: Task): number {
    if (!a.dueDate && !b.dueDate) {
      return a.title.localeCompare(b.title);
    }
    if (!a.dueDate) {
      return 1;
    }
    if (!b.dueDate) {
      return -1;
    }
    return this.dayIndex(a.dueDate) - this.dayIndex(b.dueDate);
  }

  private dayIndex(value: string): number {
    const [year, month, day] = value.substring(0, 10).split('-').map(Number);
    return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
  }

  private todayIndex(): number {
    const now = new Date();
    return Math.floor(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
    );
  }

  private formatISODate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  private buildErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor.';
    }
    return err.error?.message ?? 'No se pudieron cargar las tareas.';
  }
}
