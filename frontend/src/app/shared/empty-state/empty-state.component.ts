import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IllustrationComponent } from '../illustration/illustration.component';

/**
 * Estado vacío reutilizable: ilustración + título + mensaje + acción opcional.
 * Se usa, por ejemplo, cuando el usuario aún no tiene tareas.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, IllustrationComponent],
  template: `
    <div class="empty">
      <app-illustration
        class="empty-illu"
        [src]="illustration"
        [alt]="title"
        [icon]="icon" />

      <h2 class="empty-title">{{ title }}</h2>
      <p class="empty-msg text-muted">{{ message }}</p>

      @if (actionLabel) {
        <button mat-flat-button color="primary" (click)="action.emit()">
          <mat-icon>{{ actionIcon }}</mat-icon>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      padding: 48px 24px;
    }
    .empty-illu { width: 220px; max-width: 70vw; }
    .empty-title { margin: 8px 0 0; font-weight: 600; }
    .empty-msg { margin: 0 0 8px; max-width: 420px; }
  `],
})
export class EmptyStateComponent {
  @Input() illustration = '/assets/illustrations/empty-tasks.png';
  @Input() icon = 'inbox';
  @Input() title = '';
  @Input() message = '';
  /** Si se indica, se muestra un botón de acción. */
  @Input() actionLabel = '';
  @Input() actionIcon = 'add';
  @Output() action = new EventEmitter<void>();
}
