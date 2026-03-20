# Requisitos del Backend para Módulo de Reportes

## 🔐 Control de Acceso

- **Solo admins pueden acceder**: El endpoint debe validar que el token JWT contiene `rol: "admin"` o `rol: "administrador"`
- Si no es admin, devolver: `HTTP 403 Forbidden` con mensaje de error JSON

## 📋 Endpoints Requeridos

### 1. GET `/api/reports/route/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Retorna:** Array de puntos de ruta

**Estructura esperada:**

```json
[
  {
    "latitud": number,
    "longitud": number,
    "timestamp_captura": "ISO-8601-datetime",
    "velocidad": number,
    "bateria": number
  }
]
```

### 2. GET `/api/reports/stats/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Retorna:** Estadísticas de velocidad y paradas

**Estructura esperada:**

```json
{
  "velocidad_promedio": number,
  "velocidad_maxima": number,
  "tiempo_total_parado_minutos": number,
  "tiempo_viajando_minutos": number,
  "paradas": [
    {
      "latitud": number,
      "longitud": number,
      "inicio": "ISO-8601-datetime",
      "fin": "ISO-8601-datetime",
      "duracion_minutos": number
    }
  ]
}
```

### 3. GET `/api/reports/alerts/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Retorna:** Array de alertas

**Estructura esperada:**

```json
[
  {
    "tipo_alerta": "BATTERY_LOW|SIGNAL_LOST|DISCONNECTED|DEVICE_OFF|GEOFENCE_ENTER|GEOFENCE_EXIT",
    "timestamp_alerta": "ISO-8601-datetime",
    "descripcion": "string opcional"
  }
]
```

### 4. GET `/api/reports/geofence-events/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**Retorna:** Array de eventos de geocercas

**Estructura esperada:**

```json
[
  {
    "geofence_nombre": "string",
    "tipo_evento": "ENTER|EXIT",
    "timestamp_evento": "ISO-8601-datetime"
  }
]
```

### 5. GET `/api/reports/export/pdf/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**CRÍTICO**: Este endpoint debe:

- ✅ Validar que el usuario es admin (JWT)
- ✅ Generar un PDF con los datos del reporte
- ✅ Devolver con headers:
  ```
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="reporte_{userId}_{date}.pdf"
  Access-Control-Allow-Origin: *
  ```
- ✅ El archivo debe ser un Blob binario real

### 6. GET `/api/reports/export/excel/{userId}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

**CRÍTICO**: Este endpoint debe:

- ✅ Validar que el usuario es admin (JWT)
- ✅ Generar un Excel con los datos del reporte
- ✅ Devolver con headers:
  ```
  Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Content-Disposition: attachment; filename="reporte_{userId}_{date}.xlsx"
  Access-Control-Allow-Origin: *
  ```
- ✅ El archivo debe ser un Blob binario real

## ⚠️ Headers CORS Requeridos (MUY IMPORTANTE)

Todos los endpoints de descarga DEBEN incluir:

```
Access-Control-Allow-Origin: * (o el origen específico)
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
```

## 🧪 Test Rápido

```bash
# Test de acceso admin
curl -H "Authorization: Bearer {TOKEN_ADMIN}" \
  "https://pruebarastreador-production.up.railway.app/api/reports/route/1?startDate=2024-01-01&endDate=2024-12-31"

# Test de descarga PDF
curl -H "Authorization: Bearer {TOKEN_ADMIN}" \
  -H "Accept: application/pdf" \
  "https://pruebarastreador-production.up.railway.app/api/reports/export/pdf/1?startDate=2024-01-01&endDate=2024-12-31" \
  -o reporte.pdf
```

## 📝 Notas

- Los parámetros `startDate` y `endDate` son OBLIGATORIOS en formato YYYY-MM-DD
- El `userId` viene en la URL (es un parámetro PATH)
- El rol del usuario viene en el JWT bajo la clave `rol` o `role`
- Los archivos descargables DEBEN ser binarios válidos (no JSON con error embebido)
