# Capa de Acceso a Datos

## Herramientas de conexión
- **MySQL2**: Librería utilizada para establecer el pool de conexiones.
- **Transacciones SQL**: Se emplean para asegurar que los lotes de ubicaciones (sincronización offline) se guarden de forma atómica.

## Entidades principales

Listado inferido de entidades y sus operaciones recurrentes en la Base de Datos (`schema.sql`):

1. **`Users`**: Usuarios registrados con roles (ADMIN, SUPERVISOR, CLIENT, USER).
2. **`Clients`**: Empresas u organizaciones que contratan el servicio de rastreo.
3. **`User_Client`**: Relación entre un usuario rastreado (USER) y un cliente (CLIENT).
4. **`Supervisor_User`**: Asignación de usuarios a supervisores para su monitoreo.
5. **`Locations`**: Historial de coordenadas (latitud, longitud, velocidad, batería, etc.).
6. **`Geofences`**: Zonas virtuales configuradas (círculos o polígonos).
7. **`Geofence_Events`**: Registro histórico de entradas y salidas de geocercas.
8. **`Alerts`**: Alertas críticas generadas por el sistema (batería baja, geocercas, desconexión).
9. **`Consents`**: Registro de aceptación de términos y condiciones de rastreo.
10. **`Sessions`**: Control de sesiones activas por dispositivo para evitar duplicidad de transmisión.

## Diagrama entidad-relación

A continuación se presenta la estructura de la base de datos y sus relaciones:

```mermaid
erDiagram
    USERS ||--o{ LOCATIONS : transmits
    USERS ||--o{ GEOFENCES : creates
    USERS ||--o{ GEOFENCE_EVENTS : triggers
    USERS ||--o{ ALERTS : has
    USERS ||--o{ CONSENTS : gives
    USERS ||--o{ SESSIONS : starts
    
    USERS ||--o{ SUPERVISOR_USER : supervises_as_supervisor
    USERS ||--o{ SUPERVISOR_USER : is_supervised_as_user
    
    USERS ||--o{ USER_CLIENT : belongs_to_as_user
    CLIENTS ||--o{ USER_CLIENT : has_as_client
    
    CLIENTS }o--|| USERS : managed_by_client_admin
    
    GEOFENCES ||--o{ GEOFENCE_EVENTS : defines
    
    LOCATIONS {
        BIGINT id_location
        INT id_user
        DECIMAL latitud
        DECIMAL longitud
        FLOAT velocidad
        INT bateria
        DATETIME timestamp_captura
        ENUM estado_sincronizacion
    }
    
    USERS {
        INT id_user
        VARCHAR nombre
        VARCHAR correo
        ENUM rol
        BOOLEAN is_active
    }
```
