# Instalación rápida — Proyecto To‑Do

Pasos mínimos para levantar la aplicación en desarrollo (DB, API y frontend).

## Requisitos previos

- Docker y Docker Compose (usa `docker compose ...`).
- Java JDK 21 instalado y disponible en `PATH`.
- Maven instalado (`mvn`).
- Node.js y npm instalados.
- Puerto `5433` libre para PostgreSQL local, o usar Docker.

1. Copia el archivo de ejemplo de variables de entorno y edítalo si hace falta:

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

Notas rápidas:
- Si no tienes Docker puedes iniciar PostgreSQL local en el puerto 5433 (el `application.yml` usa 5433 por defecto).
- No subas el fichero `.env` al repositorio: usa `.env.example` para compartir la plantilla.
