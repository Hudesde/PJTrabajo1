import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Componente raíz de la aplicación.
 *
 * <p>Es deliberadamente mínimo: sólo contiene el {@code <router-outlet>}, el
 * "hueco" donde el router muestra el componente de la ruta activa
 * (login o dashboard).
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {}
