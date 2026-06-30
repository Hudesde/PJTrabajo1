import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Configuración global de la aplicación (equivalente moderno al antiguo
 * AppModule). Aquí se registran los "providers" disponibles en toda la app.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Router con nuestras rutas.
    provideRouter(routes),
    // Cliente HTTP con el interceptor que inyecta el token JWT en cada petición.
    provideHttpClient(withInterceptors([authInterceptor])),
    // Animaciones (requeridas por Angular Material: diálogos, ripples, etc.).
    provideAnimations(),
  ],
};
