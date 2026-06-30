import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../api.config';
import { AuthResponse, Credentials } from '../models/auth.model';

/**
 * Servicio de autenticación.
 *
 * <p>Concentra TODA la lógica de auth (llamadas HTTP + manejo del token), de
 * modo que los componentes sólo lo invocan. El token se guarda en
 * localStorage para que la sesión sobreviva a recargas de página.
 *
 * <p>`providedIn: 'root'` hace que haya una única instancia compartida en toda
 * la aplicación (singleton).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  /** Clave bajo la que se guarda el token en localStorage. */
  private static readonly TOKEN_KEY = 'todo_token';

  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/auth`;

  /**
   * Señal reactiva con el nombre del usuario actual (o null si no hay sesión).
   * Los componentes pueden leerla para mostrar/ocultar elementos de la UI.
   */
  readonly currentUser = signal<string | null>(this.readUsername());

  /** Registra un usuario nuevo y guarda su token. */
  register(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, credentials)
      .pipe(tap((res) => this.storeSession(res)));
  }

  /** Inicia sesión y guarda el token recibido. */
  login(credentials: Credentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(tap((res) => this.storeSession(res)));
  }

  /** Cierra la sesión borrando el token guardado. */
  logout(): void {
    localStorage.removeItem(AuthService.TOKEN_KEY);
    localStorage.removeItem('todo_username');
    this.currentUser.set(null);
  }

  /** Devuelve el token actual (o null si no hay sesión). */
  getToken(): string | null {
    return localStorage.getItem(AuthService.TOKEN_KEY);
  }

  /** Indica si hay un usuario autenticado (usado por el AuthGuard). */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // ----------------------- privados -----------------------

  /** Guarda token + usuario y actualiza la señal reactiva. */
  private storeSession(res: AuthResponse): void {
    localStorage.setItem(AuthService.TOKEN_KEY, res.token);
    localStorage.setItem('todo_username', res.username);
    this.currentUser.set(res.username);
  }

  private readUsername(): string | null {
    return localStorage.getItem('todo_username');
  }
}
