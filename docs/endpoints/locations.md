# Locations

Base path principal: `/api/locations`

## Endpoints

### POST `/api/locations/sync`
- Roles: USER o ADMIN. Requiere `Authorization: Bearer <jwt>`
- Body (JSON):
```json
{
  "locations": [
    {
      "latitud": 19.123456,
      "longitud": -99.123456,
      "precision_gps": 5.2,
      "velocidad": 12.3,
      "bateria": 80,
      "senal": "LTE",
      "timestamp_captura": "2026-03-10T10:15:00Z"
    }
  ]
}
```
- Respuesta 200:
```json
{
  "message": "Sincronización offline completada exitosamente",
  "puntos_guardados": 1
}
```
- Errores comunes:
  - 400: body sin `locations` o arreglo vacío.
  - 401/403: token inválido o rol no permitido.
  - 500: error del servidor al sincronizar.

## Endpoints de reportes (consumen tabla Locations)
Base path: `/api/reports`

### GET `/api/reports/route/:userId`
- Roles: ADMIN o SUPERVISOR. Requiere JWT.
- Query: `startDate` (ISO), `endDate` (ISO) obligatorios.
- Respuesta 200: arreglo ordenado de ubicaciones del usuario.
- Errores: 400 si faltan fechas; 500 error interno.

### GET `/api/reports/stats/:userId`
- Roles: ADMIN o SUPERVISOR. Requiere JWT.
- Query: `startDate`, `endDate` obligatorios.
- Respuesta 200 ejemplo:
```json
{
  "velocidad_promedio": "18.42",
  "tiempo_total_parado_minutos": "12.00",
  "paradas": [
    {
      "start": "2026-03-10T09:00:00.000Z",
      "end": "2026-03-10T09:05:00.000Z",
      "lat": 19.1,
      "lng": -99.1,
      "duracion_minutos": 5
    }
  ]
}
```
- Errores: 400 si faltan fechas; 500 error interno.

### GET `/api/reports/export/pdf/:userId`
- Roles: ADMIN o SUPERVISOR. Requiere JWT.
- Query: `startDate`, `endDate` obligatorios.
- Respuesta 200: archivo PDF (attachment) con resumen básico del usuario y periodo.
- Errores: 404 si usuario no existe; 500 error al generar PDF.

### GET `/api/reports/export/excel/:userId`
- Roles: ADMIN o SUPERVISOR. Requiere JWT.
- Query: `startDate`, `endDate` obligatorios.
- Respuesta 200: archivo Excel con las filas de ubicaciones en el rango.
- Errores: 500 error al generar Excel.

## Cobertura CRUD (tabla Locations)
- Crear: sí (sync inserta múltiples).
- Leer: sí (route y export leen).
- Actualizar: no hay endpoint de actualización puntual.
- Eliminar: no implementado.
