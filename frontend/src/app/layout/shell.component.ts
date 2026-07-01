import {
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../core/services/auth.service';

/** Cada opción de navegación del menú lateral. */
interface NavItem {
  label: string;
  icon: string;
  link: string;
}

/**
 * Layout principal de la app autenticada (shell).
 *
 * <p>Contiene el header estático y el menú lateral (hamburguesa). El menú
 * arranca oculto y sólo se abre/cierra con el botón de 3 rayitas. El título del
 * header cambia según la página activa (Gestor de Tareas / Calendario).
 *
 * <p>No toca la lógica de negocio: sólo organiza la navegación y el layout.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  /** Opciones del menú lateral (sin subopciones desplegables). */
  readonly navItems: NavItem[] = [
    { label: 'Gestor de Tareas', icon: 'task_alt', link: '/dashboard' },
    { label: 'Calendario', icon: 'calendar_month', link: '/calendario' },
  ];

  /** Estado del menú lateral (abierto/cerrado). Arranca oculto. */
  readonly menuOpen = signal(false);
  /** Título de la página activa (se muestra en el header). */
  readonly pageTitle = signal('Gestor de Tareas');
  /** Usuario en sesión. */
  readonly username = this.authService.currentUser;

  constructor() {
    // El título refleja la ruta activa (dato 'label' de cada ruta).
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.updateTitle());
    this.updateTitle();
  }

  /** Abre/cierra el menú (botón hamburguesa). */
  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  /** Cierra sesión. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /** Lee el 'label' de la ruta activa más profunda para el título del header. */
  private updateTitle(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const label = route?.snapshot?.data?.['label'];
    if (label) {
      this.pageTitle.set(label);
    }
  }
}
