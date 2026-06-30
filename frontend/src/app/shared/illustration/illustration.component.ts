import { Component, Input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/**
 * Muestra una ilustración. Si la imagen indicada en {@link src} todavía no
 * existe (p. ej. aún no la has generado con IA), muestra un placeholder
 * elegante con un icono y la ruta esperada, de modo que la interfaz nunca
 * se ve rota. Cuando coloques el archivo real, aparecerá automáticamente.
 *
 * Uso: <app-illustration src="/assets/illustrations/empty-tasks.png"
 *                        alt="Sin tareas" icon="inbox" />
 */
@Component({
  selector: 'app-illustration',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (!failed()) {
      <img [src]="src" [alt]="alt" class="illu-img" (error)="failed.set(true)" />
    } @else {
      <div class="illu-placeholder" role="img" [attr.aria-label]="alt">
        <mat-icon aria-hidden="true">{{ icon }}</mat-icon>
        <span class="illu-caption">Imagen sugerida<br /><code>{{ src }}</code></span>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .illu-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .illu-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      width: 100%;
      height: 100%;
      min-height: 180px;
      padding: 24px;
      border: 2px dashed var(--c-border);
      border-radius: var(--radius);
      background: var(--c-bg);
      color: var(--c-text-muted);
      text-align: center;
    }
    .illu-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--brand-secondary);
    }
    .illu-caption { font-size: 12px; line-height: 1.5; }
    .illu-caption code {
      font-size: 11px;
      color: var(--c-text);
      background: var(--c-bg-alt);
      padding: 2px 6px;
      border-radius: 6px;
    }
  `],
})
export class IllustrationComponent {
  /** Ruta de la imagen (servida desde /assets/illustrations). */
  @Input({ required: true }) src!: string;
  /** Texto alternativo accesible. */
  @Input() alt = '';
  /** Icono Material Symbols a mostrar en el placeholder si falta la imagen. */
  @Input() icon = 'image';

  /** Pasa a true si la imagen no se pudo cargar (muestra el placeholder). */
  readonly failed = signal(false);
}
