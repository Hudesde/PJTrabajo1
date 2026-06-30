import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

/**
 * Rutas de la aplicación.
 *
 * <p>El login va fuera del layout. El resto de páginas (dashboard, calendario)
 * cuelgan del {@code ShellComponent}, que aporta el header y el menú lateral.
 * El {@link authGuard} protege todo el shell de una vez.
 */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
    title: 'Iniciar sesión',
  },
  {
    // Layout autenticado (header + menú lateral) con sus páginas hijas.
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Gestor de Tareas',
        data: { label: 'Gestor de Tareas' },
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/calendar/calendar.component').then((m) => m.CalendarComponent),
        title: 'Calendario',
        data: { label: 'Calendario' },
      },
    ],
  },

  // Cualquier ruta desconocida -> al inicio.
  { path: '**', redirectTo: '' },
];
