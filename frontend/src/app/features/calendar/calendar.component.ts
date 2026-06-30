import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TaskService } from '../../core/services/task.service';
import { Task, TaskStatus } from '../../core/models/task.model';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

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
  isOverdue: boolean;
  label: string;
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
    EmptyStateComponent,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {

  private readonly taskService = inject(TaskService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasPendingTasks = signal(false);
  readonly taskGroups = signal<TaskGroup[]>([]);
  readonly pendingCount = signal(0);
  readonly overdueCount = signal(0);
  readonly calendarWeeks = signal<WeekRow[]>([]);
  readonly weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService.list().subscribe({
      next: (tasks) => {
        const pendingTasks = tasks.filter((task) => task.status !== 'COMPLETADA');
        this.pendingCount.set(pendingTasks.length);
        this.overdueCount.set(pendingTasks.filter((task) => this.isOverdue(task)).length);
        this.taskGroups.set(this.buildGroups(pendingTasks));
        this.calendarWeeks.set(this.buildCalendarWeeks(pendingTasks));
        this.hasPendingTasks.set(pendingTasks.length > 0);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.buildErrorMessage(err));
      },
    });
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_PROGRESO': return 'En progreso';
      case 'COMPLETADA': return 'Completada';
    }
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
    const month = today.getMonth();
    const year = today.getFullYear();
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
          isOverdue: this.isOverdue(task),
          label: task.dueDate ? this.formatDueDate(task.dueDate) : 'Sin fecha',
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
