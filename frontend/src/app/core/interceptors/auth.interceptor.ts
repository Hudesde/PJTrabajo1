import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

/**
 * Interceptor HTTP funcional.
 *
 * <p>Dos responsabilidades:
 * <ol>
 *   <li>Añadir automáticamente la cabecera {@code Authorization: Bearer <token>}
 *       a TODAS las peticiones salientes si hay sesión. Así ningún servicio
 *       tiene que preocuparse del token.</li>
 *   <li>Si la API responde 401 (token caducado/ inválido), cerrar la sesión y
 *       redirigir al login.</li>
 * </ol>
 *
 * <p>Se registra en app.config.ts con `withInterceptors([authInterceptor])`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  // Clonamos la petición añadiendo la cabecera sólo si hay token.
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
      }
      // Propagamos el error para que el componente pueda mostrar un mensaje.
      return throwError(() => error);
    }),
  );
};
