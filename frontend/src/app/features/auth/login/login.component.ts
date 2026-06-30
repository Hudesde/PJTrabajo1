import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

/**
 * Pantalla de inicio de sesión y registro.
 *
 * <p>Un mismo componente sirve para ambas acciones; un botón alterna entre
 * "Iniciar sesión" y "Crear cuenta". Usa Reactive Forms para validar la
 * entrada y muestra estados de carga (spinner) y de error.
 *
 * <p>Diseño: pantalla dividida (ilustración + tarjeta) con Angular Material.
 * La lógica (formulario, submit, manejo de errores) se conserva intacta.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /** Modo actual del formulario: iniciar sesión o registrarse. */
  readonly mode = signal<'login' | 'register'>('login');
  /** Indica si hay una petición en curso (para mostrar el spinner). */
  readonly loading = signal(false);
  /** Mensaje de error a mostrar (null si no hay error). */
  readonly errorMessage = signal<string | null>(null);
  /** Año actual (para el pie de página). */
  readonly year = new Date().getFullYear();

  /** Formulario reactivo con sus validaciones. */
  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  /** Cambia entre los modos login/registro y limpia el error. */
  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.errorMessage.set(null);
  }

  /** Envía el formulario (login o registro según el modo). */
  submit(): void {
    // Si el formulario es inválido, marcamos los campos para mostrar errores.
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const credentials = this.form.getRawValue();
    const request$ = this.mode() === 'login'
      ? this.authService.login(credentials)
      : this.authService.register(credentials);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.errorMessage.set(this.buildErrorMessage(err));
      },
    });
  }

  /** Traduce el error HTTP a un mensaje legible para el usuario. */
  private buildErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está el backend en marcha?';
    }
    if (err.status === 401) {
      return 'Usuario o contraseña incorrectos.';
    }
    if (err.status === 409) {
      return 'Ese nombre de usuario ya está en uso.';
    }
    // Si el backend envió un mensaje, lo mostramos.
    return err.error?.message ?? 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
}
