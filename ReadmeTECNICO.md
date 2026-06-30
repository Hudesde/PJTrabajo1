# Gestor de Tareas (To‑Do) — Aplicación Fullstack

Aplicación web de **gestión de tareas con autenticación**. Cada usuario se
registra, inicia sesión y gestiona **sus propias** tareas (crear, listar,
filtrar por estado, editar y eliminar).

- **Backend:** Spring Boot 3 + Spring Security (JWT) + Spring Data JPA + PostgreSQL + Flyway.
- **Frontend:** Angular 18 (componentes *standalone*, Router, HttpClient, Reactive Forms).

> Este README contiene **todo lo necesario para instalar, ejecutar y explicar**
> el proyecto. Si vas a presentarlo, las secciones
> [¿Qué hace la aplicación?](#1-qué-hace-la-aplicación),
> [Flujo de autenticación JWT](#9-flujo-de-autenticación-jwt) y
> [El menú lateral de 4 niveles](#10-el-menú-lateral-de-4-niveles) son las más
> útiles para la exposición.

---

## Índice

1. [¿Qué hace la aplicación?](#1-qué-hace-la-aplicación)
2. [Arquitectura y stack tecnológico](#2-arquitectura-y-stack-tecnológico)
3. [Estructura del repositorio](#3-estructura-del-repositorio)
4. [Requisitos previos](#4-requisitos-previos)
5. [Puesta en marcha rápida](#5-puesta-en-marcha-rápida)
6. [Variables de entorno](#6-variables-de-entorno)
7. [Endpoints de la API](#7-endpoints-de-la-api)
8. [Documentación interactiva (Swagger)](#8-documentación-interactiva-swagger)
9. [Flujo de autenticación JWT](#9-flujo-de-autenticación-jwt)
10. [El menú lateral de 4 niveles](#10-el-menú-lateral-de-4-niveles)
11. [Pruebas (tests)](#11-pruebas-tests)
12. [Decisiones técnicas](#12-decisiones-técnicas)
13. [Entregables (checklist)](#13-entregables-checklist)
14. [Solución de problemas](#14-solución-de-problemas)
15. [Diseño de la interfaz (OGDS Starter)](#15-diseño-de-la-interfaz-ogds-starter)

---

## 1. ¿Qué hace la aplicación?

Es una lista de tareas (estilo "To‑Do") **multiusuario**:

- **Registro e inicio de sesión.** Las contraseñas se guardan cifradas (BCrypt)
  y, tras autenticarse, el usuario recibe un **token JWT**.
- **Gestión de tareas (CRUD).** Cada tarea tiene: título, descripción, **estado**
  (`PENDIENTE`, `EN_PROGRESO`, `COMPLETADA`) y fecha límite opcional.
- **Aislamiento por usuario.** Un usuario sólo puede ver y modificar sus propias
  tareas; nunca las de otro.
- **Filtro por estado** desde un **menú lateral de 4 opciones** (Todas,
  Pendientes, En progreso, Completadas).
- **Experiencia cuidada:** indicadores de carga (spinners) y mensajes de error
  claros.

---

## 2. Arquitectura y stack tecnológico

```
┌─────────────────────────┐        HTTP + JSON          ┌──────────────────────────┐
│       FRONTEND          │   (cabecera Authorization:   │         BACKEND          │
│       Angular 18        │     Bearer <token JWT>)       │       Spring Boot 3      │
│                         │ ───────────────────────────▶ │                          │
│  - Componentes UI       │                              │  - Controllers (REST)    │
│  - Servicios (HTTP)     │ ◀─────────────────────────── │  - Services (negocio)    │
│  - AuthGuard            │        respuestas JSON        │  - Repositories (JPA)    │
│  - Interceptor JWT      │                              │  - Spring Security + JWT │
└─────────────────────────┘                              └────────────┬─────────────┘
        :4200                                                          │ JDBC
                                                                       ▼
                                                            ┌──────────────────────┐
                                                            │      PostgreSQL      │
                                                            │   (esquema gestionado │
                                                            │      por Flyway)     │
                                                            └──────────────────────┘
                                                                     :5433
```

| Capa        | Tecnología                          | Versión |
|-------------|-------------------------------------|---------|
| Lenguaje BE | Java                                | 21      |
| Framework BE| Spring Boot                         | 3.5.16  |
| Seguridad   | Spring Security + JWT (jjwt)         | 0.12.7  |
| Persistencia| Spring Data JPA (Hibernate)         | —       |
| Migraciones | Flyway                              | —       |
| Base de datos| PostgreSQL                         | 17      |
| Build BE    | Maven                               | 3.9.x   |
| Framework FE| Angular                             | 18      |
| Runtime FE  | Node.js                             | 20 LTS  |
| Tests BE    | JUnit 5 + Mockito                   | —       |
| Tests FE    | Jest + jest-preset-angular          | —       |

---

## 3. Estructura del repositorio

```
PJTrabajo1/
├── docker-compose.yml          # Levanta PostgreSQL + (opcional) la API
├── .env.example                # Plantilla de variables de entorno
├── .gitignore
├── README.md                   # Este archivo
│
├── backend/                    # API REST (Spring Boot)
│   ├── pom.xml                 # Dependencias y build de Maven
│   ├── Dockerfile              # Imagen del backend (multi-etapa)
│   └── src/
│       ├── main/java/com/example/todo/
│       │   ├── TodoApiApplication.java     # Arranque
│       │   ├── auth/           # Registro / login (controller, service, DTOs)
│       │   ├── task/           # CRUD de tareas (entidad, repo, service, controller, DTOs)
│       │   ├── user/           # Entidad y repositorio de usuarios
│       │   ├── security/       # JwtService, filtro JWT, UserDetailsService
│       │   ├── config/         # SecurityConfig, OpenApiConfig
│       │   └── exception/      # Manejo centralizado de errores (@ControllerAdvice)
│       ├── main/resources/
│       │   ├── application.yml                  # Configuración
│       │   └── db/migration/                    # Migraciones Flyway (V1, V2)
│       └── test/java/...                        # Tests (JUnit + Mockito)
│
└── frontend/                   # Aplicación Angular
    ├── package.json
    ├── jest.config.js          # Configuración de tests (Jest)
    └── src/app/
        ├── core/               # Lógica transversal (no visual)
        │   ├── models/         # Interfaces (Task, AuthResponse...)
        │   ├── services/       # auth.service.ts, task.service.ts (@Injectable)
        │   ├── guards/         # auth.guard.ts (protege rutas)
        │   └── interceptors/   # auth.interceptor.ts (añade el token JWT)
        ├── features/
        │   ├── auth/login/     # Pantalla de login/registro
        │   └── dashboard/      # Tablero con menú lateral + CRUD
        ├── app.config.ts       # Providers globales (router, http, interceptor)
        └── app.routes.ts       # Rutas (con guard de autenticación)
```

---

## 4. Requisitos previos

Para ejecutar el proyecto necesitas:

- **Java JDK 21** (con `javac`, no sólo el JRE).
- **Maven 3.9+**.
- **Node.js 20 LTS** y **npm**.
- **Docker + Docker Compose** (recomendado, para PostgreSQL).
  - *Alternativa:* un PostgreSQL instalado localmente escuchando en el puerto 5433.

> **Nota sobre este equipo:** el toolchain (JDK 21, Maven, Node 20, Angular CLI 18)
> se instaló en `~/.local` y se añadió al `PATH` en `~/.bashrc` y `~/.profile`.
> Abre una **terminal nueva** (o ejecuta `source ~/.bashrc`) para que `java`,
> `mvn`, `node`, `npm` y `ng` estén disponibles. Comprueba con:
> ```bash
> java -version && mvn -v && node -v && ng version
> ```

---

## 5. Puesta en marcha rápida

Necesitas **3 cosas corriendo**: la base de datos, el backend y el frontend.

### Paso 0 — Configurar variables de entorno

```bash
cp .env.example .env       # luego edita .env si quieres cambiar credenciales
```

### Paso 1 — Base de datos PostgreSQL (con Docker)

```bash
docker compose up -d db
```

Esto arranca PostgreSQL en `localhost:5433` con la base `todo_db`
(usuario `todo`, contraseña `todo` por defecto).

### Paso 2 — Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Al arrancar, **Flyway crea automáticamente** las tablas. La API queda en
`http://localhost:8080`.

### Paso 3 — Frontend (Angular)

En **otra terminal**:

```bash
cd frontend
npm install        # sólo la primera vez
npm start          # equivale a 'ng serve'
```

Abre **`http://localhost:4200`** en el navegador. ¡Regístrate y empieza a crear tareas!

---

### Alternativa: backend + base de datos con Docker

Si prefieres no instalar Maven/Java, puedes levantar **la base de datos y la API**
juntas con Docker (la API se compila dentro de la imagen):

```bash
docker compose up --build      # arranca 'db' + 'api'
```

Y luego sólo necesitas el frontend (`cd frontend && npm install && npm start`).

---

### Alternativa sin Docker: PostgreSQL local (ya configurado en este equipo)

En este equipo no hay Docker, así que se instaló un **PostgreSQL portable en
`~/.local/pgsql`** (sin permisos de administrador) con un clúster propio en el
puerto **5433** y la base **`todo_db`** ya creada. Se gestiona con el script
`todo-pg`:

```bash
todo-pg start     # arranca la base de datos (puerto 5433)
todo-pg status    # ¿está corriendo?
todo-pg stop      # la detiene
todo-pg log       # ver el log del servidor
```

Con la base de datos arrancada, el backend (`mvn spring-boot:run`) se conecta a
ella sin más, ya que `application.yml` apunta por defecto a `localhost:5433`.

> Datos de conexión: `host=localhost  port=5433  db=todo_db  user=todo` (auth
> *trust* en local, por lo que la contraseña no se valida). Los binarios y los
> datos viven en `~/.local/pgsql` y `~/.local/pgdata`.

---

## 6. Variables de entorno

Definidas en `.env` (ver `.env.example`). Tienen valores por defecto razonables
para desarrollo:

| Variable                | Por defecto                 | Descripción                              |
|-------------------------|-----------------------------|------------------------------------------|
| `POSTGRES_USER`         | `todo`                      | Usuario de la base de datos              |
| `POSTGRES_PASSWORD`     | `todo`                      | Contraseña de la base de datos           |
| `POSTGRES_DB`           | `todo_db`                   | Nombre de la base de datos               |
| `APP_JWT_SECRET`        | `dev-secret-...` (32+ chars)| Clave para firmar los JWT (**cámbiala**) |
| `APP_JWT_EXPIRATION_MS` | `86400000` (24 h)           | Vida del token en milisegundos           |

> El backend también acepta `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`
> y `SPRING_DATASOURCE_PASSWORD` (ver `backend/src/main/resources/application.yml`).

---

## 7. Endpoints de la API

Base: `http://localhost:8080/api`

| Método | Ruta                 | Auth | Descripción                                   |
|--------|----------------------|------|-----------------------------------------------|
| POST   | `/auth/register`     | No   | Registra un usuario y devuelve un token JWT   |
| POST   | `/auth/login`        | No   | Inicia sesión y devuelve un token JWT         |
| GET    | `/tasks`             | Sí   | Lista las tareas del usuario                  |
| GET    | `/tasks?status=...`  | Sí   | Lista filtrando por estado                    |
| GET    | `/tasks/{id}`        | Sí   | Obtiene una tarea                             |
| POST   | `/tasks`             | Sí   | Crea una tarea                                |
| PUT    | `/tasks/{id}`        | Sí   | Actualiza una tarea                           |
| DELETE | `/tasks/{id}`        | Sí   | Elimina una tarea                             |

**Ejemplo con `curl`:**

```bash
# 1) Registro -> devuelve { "token": "...", "username": "ana" }
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ana","password":"secreto123"}'

# 2) Crear una tarea (usa el token del paso anterior)
TOKEN="pega-aqui-el-token"
curl -X POST http://localhost:8080/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Comprar pan","description":"Integral","status":"PENDIENTE","dueDate":"2026-07-15"}'
```

---

## 8. Documentación interactiva (Swagger)

Con el backend en marcha, abre:

**`http://localhost:8080/swagger-ui.html`**

Ahí puedes ver todos los endpoints y **probarlos desde el navegador**. Para las
rutas protegidas: haz login, copia el token y pégalo en el botón **"Authorize"**.

---

## 9. Flujo de autenticación JWT

```
1. El usuario envía usuario+contraseña a /api/auth/login.
2. El backend valida las credenciales (BCrypt) y devuelve un TOKEN JWT firmado.
3. El frontend guarda el token (localStorage).
4. En cada petición, el INTERCEPTOR añade la cabecera:
       Authorization: Bearer <token>
5. El FILTRO JWT del backend valida la firma y la expiración del token, e
   identifica al usuario. Si es válido, la petición continúa; si no, responde 401.
6. Si el frontend recibe un 401, cierra la sesión y redirige al login.
```

**Piezas clave:**

- Backend: [`JwtService`](backend/src/main/java/com/example/todo/security/JwtService.java) (crea/valida tokens) y
  [`JwtAuthenticationFilter`](backend/src/main/java/com/example/todo/security/JwtAuthenticationFilter.java) (lee la cabecera en cada petición).
- Frontend: [`auth.interceptor.ts`](frontend/src/app/core/interceptors/auth.interceptor.ts) (añade el token) y
  [`auth.guard.ts`](frontend/src/app/core/guards/auth.guard.ts) (protege `/dashboard`).

---

## 10. El menú lateral de 4 niveles

El dashboard tiene un **menú lateral con 4 entradas**, que son los 4 filtros por
estado de las tareas:

```
┌───────────────┬──────────────────────────┐
│  📋 Mis tareas │   [ + Nueva tarea ]       │
│               │                           │
│ ▸ Todas       │   ☐ Comprar pan    PEND   │
│ ▸ Pendientes  │   ☐ Llamar a Ana   PROG   │
│ ▸ En progreso │   ☑ Pagar luz      COMP   │
│ ▸ Completadas │                           │
│               │                           │
│ 👤 ana        │                           │
│ Cerrar sesión │                           │
└───────────────┴──────────────────────────┘
```

Cada vez que eliges una opción, el listado se recarga desde la API aplicando ese
filtro. **El filtro está implementado con Reactive Forms** (un `FormControl` cuyo
valor cambia al pulsar cada entrada del menú), tal y como pide el enunciado.
Ver [`dashboard.component.ts`](frontend/src/app/features/dashboard/dashboard.component.ts).

---

## 11. Pruebas (tests)

### Backend (JUnit 5 + Mockito)

```bash
cd backend
mvn test
```

Incluye **9 pruebas**:

- `AuthServiceTest` — el registro cifra la contraseña y rechaza usuarios duplicados.
- `TaskServiceTest` — creación, listado y control de propiedad (404 si la tarea
  no es del usuario).
- `JwtServiceTest` — generación y validación de tokens.
- `TodoApiApplicationTests` — *smoke test* que arranca todo el contexto de Spring
  (con base de datos H2 en memoria) para verificar que la aplicación "enciende".

### Frontend (Jest)

```bash
cd frontend
npm test
```

Incluye el test de componente `login.component.spec.ts`, que comprueba: que el
componente se crea, que no envía el formulario si es inválido, que llama al
servicio y navega al dashboard cuando es válido, y que muestra error con
credenciales incorrectas.

> Se usa **Jest** (en lugar de Karma/Jasmine) porque corre en Node con un DOM
> simulado (jsdom): no necesita un navegador real, lo que lo hace ideal para
> integración continua. El enunciado admite "Jasmine/Karma **o** Jest".

---

## 12. Decisiones técnicas

- **DTOs separados de las entidades.** Los controllers nunca exponen entidades
  JPA; usan DTOs (`record`) de entrada/salida. Así no se filtran datos internos
  (p. ej. el hash de la contraseña).
- **Manejo centralizado de errores.** Un `@RestControllerAdvice`
  ([`GlobalExceptionHandler`](backend/src/main/java/com/example/todo/exception/GlobalExceptionHandler.java))
  convierte las excepciones en respuestas JSON uniformes con el código HTTP
  correcto (400, 401, 404, 409...).
- **Validación.** Bean Validation (`@Valid`, `@NotBlank`, `@Size`...) en los DTOs.
- **Esquema versionado con Flyway.** Las tablas se crean con scripts SQL
  versionados (`V1__...`, `V2__...`), no "a mano". Hibernate sólo *valida* que
  coincidan (`ddl-auto: validate`).
- **Sin Lombok.** Getters/setters escritos de forma explícita para que el código
  sea 100 % transparente y fácil de explicar.
- **Angular standalone + signals.** Sin NgModules; estado de la vista con
  *signals*; rutas con *lazy loading*.
- **Servicios separados de los componentes.** Toda la lógica HTTP vive en
  `@Injectable` (`AuthService`, `TaskService`).

---

## 13. Entregables (checklist)

Mapa de lo que pide el enunciado y dónde está resuelto:

**Backend**
- [x] Registro/login con JWT (Spring Security) → `auth/`, `security/`
- [x] CRUD de tareas (título, descripción, estado, fecha límite) → `task/`
- [x] Relación usuario‑tareas con aislamiento → `Task.owner`, consultas `...ByOwnerId...`
- [x] Bean Validation + `@ControllerAdvice` → DTOs + `exception/`
- [x] Migraciones con Flyway → `resources/db/migration/`
- [x] DTOs separados de las entidades → `auth/dto/`, `task/dto/`

**Frontend**
- [x] Login/registro + AuthGuard + interceptor JWT → `features/auth`, `core/guards`, `core/interceptors`
- [x] Listado con filtro por estado usando Reactive Forms → `dashboard.component.ts`
- [x] Crear, editar y eliminar desde la UI → dashboard
- [x] Estados de carga y error (spinners, mensajes) → signals `loading`/`errorMessage`
- [x] Servicios `@Injectable` separados de los componentes → `core/services`

**Entregables**
- [x] Repositorio con README de instalación + `docker-compose.yml` para PostgreSQL
- [x] ≥ 2 tests backend (JUnit + Mockito) → en realidad **9**
- [x] ≥ 1 test de componente Angular → `login.component.spec.ts`

---

## 14. Solución de problemas

| Problema | Causa probable / solución |
|----------|---------------------------|
| `release version 21 not supported` al compilar | Sólo tienes el JRE. Instala un **JDK 21** (con `javac`) y apunta `JAVA_HOME` a él. |
| El backend no arranca: *Connection refused* a la BD | PostgreSQL no está corriendo. Ejecuta `docker compose up -d db`. |
| El frontend muestra "No se pudo conectar con el servidor" | El backend no está en marcha en `http://localhost:8080`. |
| Error CORS en el navegador | El frontend debe servirse en `http://localhost:4200` (origen permitido en `SecurityConfig`). |
| `ng: command not found` | Abre una terminal nueva o `source ~/.bashrc` para cargar el `PATH`. |
| El puerto 5433 está ocupado | Cambia el mapeo en `docker-compose.yml` (p. ej. `5434:5432`) y `SPRING_DATASOURCE_URL`. |

---

## 15. Diseño de la interfaz (OGDS Starter)

Más allá de los requisitos funcionales, la interfaz sigue un pequeño **sistema de
diseño** propio creado para esta prueba: el **OGDS Starter**
(*Oaxaca Government Design System Starter*).

> **¿Qué es un “design system” / OGDS?** Es un conjunto de reglas y componentes
> reutilizables —paleta de color, tipografía, espaciado, botones, tarjetas,
> diálogos, etc.— que garantiza que **todas las pantallas se vean y se comporten
> igual**. Aporta consistencia, acelera el desarrollo y mejora la
> mantenibilidad. El **OGDS** es esa guía aplicada a este proyecto.

**Inspiración.** Toma como referencia el *Manual de Identidad Gráfica del
Gobierno del Estado de Oaxaca (2022–2028)* —su paleta, tipografía y principios—
para lograr una interfaz institucional, **sin copiar** el portal oficial.

**Principios.** Identidad visual consistente · jerarquía clara · interfaces
limpias con mucho espacio en blanco · alta legibilidad · accesibilidad **WCAG
AA** · diseño responsive · componentes reutilizables · separación lógica /
presentación · uso consistente de **Angular Material**. Se evitaron a propósito
el *glassmorphism*, el *neomorphism*, los gradientes agresivos, las interfaces
oscuras y los dashboards recargados: la prioridad es **confianza y
profesionalismo** sobre el efectismo.

**Paleta institucional**

| Uso | Color |
|-----|-------|
| Primario | `#9D2449` |
| Secundario | `#B38E5D` |
| Éxito | `#59B038` |
| Información | `#0098D4` |
| Advertencia | `#F6C54A` |
| Error | `#D32F2F` |
| Fondo / Superficie | `#FFFFFF` / `#F8F8F8` |

**Tipografía.** El manual define *GMX* para títulos y *Montserrat* para texto;
por disponibilidad en navegadores se usa **Montserrat** en toda la interfaz,
conservando la jerarquía propuesta.

**Componentes cubiertos.** Login y registro, navegación, tarjetas, formularios,
tabla de tareas, badges/chips de estado, diálogos, *snackbars*, y estados de
carga, vacío y error —todos con las mismas reglas visuales.

**Evolución prevista (*OGDS Professional*).** Como trabajo futuro, ampliar el
sistema con *design tokens*, biblioteca completa de componentes documentados,
temas reutilizables para Angular Material, guías de accesibilidad y de Figma, e
iconografía e ilustraciones propias —para que otras aplicaciones reutilicen el
mismo lenguaje visual.
