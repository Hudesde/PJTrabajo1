# Instalación rápida — Proyecto To‑Do

Pasos mínimos para levantar la aplicación en desarrollo (DB, API y frontend).

## Requisitos previos

- Docker y Docker Compose (usa `docker compose ...`).
- Java JDK 21 instalado y disponible en `PATH`.
- Maven instalado (`mvn`).
- Node.js y npm instalados.
- Puerto `5433` libre para PostgreSQL local, o usar Docker.

1. Variables de entorno: el repositorio ya incluye un `.env` con valores de
   **desarrollo** (sin secretos reales), así que no necesitas crear nada para
   probar la app. Si prefieres partir de la plantilla:

```bash
cp .env.example .env
```

2. Arranca la base de datos PostgreSQL (con Docker):

```bash
docker compose up -d db
```

3. Levanta el backend (en otra terminal):

```bash
cd backend
mvn spring-boot:run
```

4. Levanta el frontend (en otra terminal):

```bash
cd frontend
npm install    # si no lo hiciste ya
npm start
```

5. Abre la app en el navegador: http://localhost:4200

## Credenciales de acceso

Al arrancar, Flyway siembra automáticamente un **usuario de demostración** (con
tareas de ejemplo repartidas por junio, julio y agosto de 2026, ideales para ver
el calendario con colores y prioridades):

| Usuario | Contraseña  |
|---------|-------------|
| `demo`  | `Demo1234!` |

También puedes **crear tu propia cuenta** desde la pantalla de inicio de sesión
(el registro está abierto).

Notas rápidas:
- Si no tienes Docker puedes iniciar PostgreSQL local en el puerto 5433 (el `application.yml` usa 5433 por defecto).
- El `.env` versionado contiene **sólo valores de desarrollo**. Para producción,
  usa credenciales propias (por ejemplo en un `.env.local`, que sí está ignorado
  por git) y cambia `APP_JWT_SECRET`.
