# Sessions

Base path asociado: `/api/auth`

La tabla `Sessions` se maneja de forma interna al iniciar o cerrar sesión. No hay endpoints dedicados a CRUD de sesiones, pero:
- `POST /api/auth/login` crea un registro de sesión con `token_jti` y `device_id`.
- `POST /api/auth/logout` marca la sesión (por `jti`) como inactiva.

## Cobertura CRUD
- Crear: sí (implícito en login)
- Leer: no hay endpoints públicos
- Actualizar: sí (logout marca `is_active = FALSE`)
- Eliminar: no
