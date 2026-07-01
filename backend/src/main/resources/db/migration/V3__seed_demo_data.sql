-- ============================================================================
--  Migración V3: datos de demostración (seed).
--
--  Crea un usuario de ejemplo y sus tareas para poder probar la aplicación tras
--  un clon limpio, sin tener que registrarse ni cargar datos a mano. Las tareas
--  están repartidas por junio, julio y agosto de 2026 para lucir el calendario.
--
--  CREDENCIALES:  usuario = demo    contraseña = Demo1234!
--  La contraseña se guarda cifrada con BCrypt (igual que en el registro real).
--
--  Nota: se usa ON CONFLICT para que sea seguro aunque el usuario ya existiera.
-- ============================================================================

INSERT INTO users (username, password_hash, created_at)
VALUES ('demo', '$2a$10$mk4IQcex8XFF7ef7uJnOXeKroPCR2sDxmwwSfs2KurGsG7CWVPnjW', '2026-06-01 08:00:00+00')
ON CONFLICT (username) DO NOTHING;

-- Las tareas se asocian al usuario 'demo' mediante subconsulta, de modo que
-- funciona sea cual sea el id que le asigne la base de datos.
INSERT INTO tasks (title, description, status, priority, due_date, user_id, created_at, updated_at)
SELECT v.title, v.description, v.status, v.priority, v.due_date::date, u.id,
       v.created_at::timestamptz, v.created_at::timestamptz
FROM users u
CROSS JOIN (VALUES
    ('Auditoría interna', 'Revisión de procesos Q2', 'COMPLETADA', 'ALTA', '2026-06-02', '2026-06-01 09:00:00+00'),
    ('Revisión de presupuesto', 'Ajustar partidas de junio', 'PENDIENTE', 'MEDIA', '2026-06-04', '2026-06-02 09:00:00+00'),
    ('Onboarding becario', 'Alta y accesos del nuevo becario', 'EN_PROGRESO', 'BAJA', '2026-06-08', '2026-06-08 09:00:00+00'),
    ('Migración de servidor', 'Mover API al nuevo host', 'PENDIENTE', 'ALTA', '2026-06-11', '2026-06-09 09:00:00+00'),
    ('Cierre contable mayo', 'Conciliación del mes anterior', 'COMPLETADA', 'MEDIA', '2026-06-15', '2026-06-15 09:00:00+00'),
    ('Rediseño landing', 'Nueva página de inicio', 'EN_PROGRESO', 'ALTA', '2026-06-18', '2026-06-16 09:00:00+00'),
    ('Encuesta de clima', 'Enviar formulario al equipo', 'PENDIENTE', 'BAJA', '2026-06-22', '2026-06-22 09:00:00+00'),
    ('Firma de contrato', 'Contrato con proveedor cloud', 'COMPLETADA', 'ALTA', '2026-06-25', '2026-06-25 09:00:00+00'),
    ('Optimizar consultas SQL', 'Mejorar rendimiento del listado', 'EN_PROGRESO', 'MEDIA', '2026-06-27', '2026-06-26 09:00:00+00'),
    ('Informe semestral', 'Resumen de resultados H1', 'PENDIENTE', 'ALTA', '2026-06-30', '2026-06-28 09:00:00+00'),
    ('Reunión de planificación', 'Definir objetivos del sprint', 'PENDIENTE', 'ALTA', '2026-07-03', '2026-07-01 09:00:00+00'),
    ('Revisar correos', 'Responder mensajes pendientes', 'EN_PROGRESO', 'MEDIA', '2026-07-04', '2026-07-04 08:30:00+00'),
    ('Preparar presentación', 'Diapositivas para el cliente', 'PENDIENTE', 'BAJA', '2026-07-07', '2026-07-06 10:00:00+00'),
    ('Entrega informe mensual', 'Informe de resultados de junio', 'COMPLETADA', 'MEDIA', '2026-07-09', '2026-07-09 11:00:00+00'),
    ('Llamada con proveedor', 'Negociar plazos de entrega', 'PENDIENTE', 'ALTA', '2026-07-13', '2026-07-13 09:15:00+00'),
    ('Desarrollo módulo pagos', 'Implementar pasarela de pago', 'EN_PROGRESO', 'ALTA', '2026-07-16', '2026-07-14 09:00:00+00'),
    ('Actualizar documentación', 'Manual de usuario v2', 'PENDIENTE', 'MEDIA', '2026-07-20', '2026-07-20 12:00:00+00'),
    ('Backup de servidores', 'Copia de seguridad semanal', 'COMPLETADA', 'BAJA', '2026-07-23', '2026-07-22 18:00:00+00'),
    ('Pruebas de integración', 'QA de la release 2.0', 'EN_PROGRESO', 'MEDIA', '2026-07-27', '2026-07-27 08:00:00+00'),
    ('Cierre de mes', 'Conciliación contable de julio', 'PENDIENTE', 'ALTA', '2026-07-30', '2026-07-28 09:00:00+00'),
    ('Planificar sprint 12', 'Objetivos y backlog', 'PENDIENTE', 'MEDIA', '2026-08-03', '2026-08-03 09:00:00+00'),
    ('Integración pasarela', 'Conectar Stripe en producción', 'EN_PROGRESO', 'ALTA', '2026-08-05', '2026-08-03 09:00:00+00'),
    ('Actualizar dependencias', 'Bump de librerías del frontend', 'COMPLETADA', 'BAJA', '2026-08-07', '2026-08-07 09:00:00+00'),
    ('Campaña de marketing', 'Lanzamiento de la versión 2.0', 'PENDIENTE', 'ALTA', '2026-08-12', '2026-08-10 09:00:00+00'),
    ('Formación de equipo', 'Taller de accesibilidad web', 'EN_PROGRESO', 'MEDIA', '2026-08-14', '2026-08-14 09:00:00+00'),
    ('Revisar tickets soporte', 'Depurar cola de incidencias', 'PENDIENTE', 'BAJA', '2026-08-18', '2026-08-17 09:00:00+00'),
    ('Backup trimestral', 'Copia completa de la base', 'COMPLETADA', 'MEDIA', '2026-08-21', '2026-08-21 09:00:00+00'),
    ('Auditoría de seguridad', 'Pentest de la API', 'EN_PROGRESO', 'ALTA', '2026-08-24', '2026-08-22 09:00:00+00'),
    ('Retro del mes', 'Retrospectiva de agosto', 'PENDIENTE', 'MEDIA', '2026-08-28', '2026-08-28 09:00:00+00'),
    ('Preparar demo cliente', 'Ensayo de la demo final', 'COMPLETADA', 'ALTA', '2026-08-31', '2026-08-29 09:00:00+00')
) AS v(title, description, status, priority, due_date, created_at)
WHERE u.username = 'demo';
