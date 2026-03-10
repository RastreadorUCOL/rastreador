# Referencia de API (Contratos REST)

Este documento detalla la estructura y los contratos esperados por los principales endpoints de la API.

---

## 1. Módulo: Autenticación (`/api/auth`)

### 1.1 Iniciar Sesión (`POST /login`)
Permite a un usuario autenticarse y recibir un token JWT para peticiones posteriores.

**Cuerpo de la petición (JSON):**
```json
{
  "correo": "usuario@ejemplo.com",
  "password": "mi_password_segura",
  "device_id": "ID_UNICO_DEL_DISPOSITIVO"
}
```

**Respuesta de éxito:**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "correo": "juan@ejemplo.com",
    "rol": "USER"
  }
}
```

---

## 2. Módulo: ubicaciones (`/api/locations`)

### 2.1 Sincronización Offline (`POST /sync`)
Endpoint especializado para que la aplicación móvil cargue múltiples coordenadas capturadas durante la pérdida de conectividad.

**Requisitos:** Requiere autenticación (JWT) y rol `USER` o `ADMIN`.

**Cuerpo de la Petición (JSON):**
```json
{
  "locations": [
    {
      "latitud": 19.4326,
      "longitud": -99.1332,
      "precision_gps": 5.0,
      "velocidad": 25.5,
      "bateria": 85,
      "senal": "4G",
      "timestamp_captura": "2023-10-27T10:00:00Z"
    },
    ...
  ]
}
```

**Respuesta de éxito:**
```json
{
  "message": "Sincronización offline completada exitosamente",
  "puntos_guardados": 15
}
```

---

## 3. Otros módulos

### 3.1 Geocercas (`/api/geofences`)
Administración de zonas virtuales.
- **`POST /`**: Crear una nueva geocerca (Solo ADMIN).
- **`GET /`**: Listar todas las geocercas configuradas (ADMIN, SUPERVISOR).

### 3.2 Alertas (`/api/alerts`)
Gestión de eventos críticos detectados por el sistema.
- **`GET /`**: Obtener el historial de alertas recientes (ADMIN, SUPERVISOR).
- **`PUT /:id/read`**: Marcar una alerta específica como leída (ADMIN, SUPERVISOR).

### 3.3 Reportes (`/api/reports`)
Generación de información histórica detallada y exportación de archivos.
- **`GET /route/:userId`**: Obtener las coordenadas de la ruta recorrida por un usuario en un rango de fechas.
- **`GET /stats/:userId`**: Estadísticas de velocidad y tiempos de parada.
- **`GET /export/pdf/:userId`**: Generar y descargar el reporte de actividad en formato PDF.
- **`GET /export/excel/:userId`**: Generar y descargar el reporte de actividad en formato Excel.
