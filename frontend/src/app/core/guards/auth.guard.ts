import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * AuthGuard funcional.
 *
 * <p>Protege rutas que requieren sesión. Si el usuario NO está autenticado,
 * lo redirige a /login y bloquea la navegación devolviendo `false`.
 *
 * <p>Se usa en app.routes.ts con `canActivate: [authGuard]`.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Sin sesión: redirigir al login.
  router.navigate(['/login']);
  return false;
};
