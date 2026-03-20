# ✅ CHECKLIST DE IMPLEMENTACIÓN - PARA EL EQUIPO DE BACKEND

## 🎯 OBJETIVO

Implementar 6 endpoints para el módulo de Reportes 1.7

**Prioridad:** 🔴 CRÍTICA - El frontend está lista, solo falta esto

---

## 📋 ENDPOINTS A IMPLEMENTAR

### Endpoint 1: GET `/api/reports/route/{userId}`

```
Propósito: Obtener puntos de ubicación del usuario
Autenticación: Bearer Token (verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

□ Validar que usuario es admin
□ Validar formato de fechas
□ Retornar array de objetos con:
  - latitud (número)
  - longitud (número)
  - timestamp_captura (ISO-8601)
  - velocidad (número km/h)
  - bateria (número 0-100)

Response espeado:
Status: 200 OK
Content-Type: application/json
[
  {
    "latitud": 20.6592,
    "longitud": -103.3496,
    "timestamp_captura": "2024-01-15T08:30:00Z",
    "velocidad": 45.5,
    "bateria": 85
  }
]

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

### Endpoint 2: GET `/api/reports/stats/{userId}`

```
Propósito: Obtener estadísticas de velocidad y paradas
Autenticación: Bearer Token (verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

□ Validar que usuario es admin
□ Validar formato de fechas
□ Calcular velocidad promedio
□ Calcular velocidad máxima
□ Calcular tiempo total parado en minutos
□ Calcular tiempo viajando en minutos
□ Retornar array de paradas con:
  - latitud, longitud (números)
  - inicio, fin (ISO-8601)
  - duracion_minutos (número)

Response esperado:
Status: 200 OK
Content-Type: application/json
{
  "velocidad_promedio": 42.3,
  "velocidad_maxima": 89.5,
  "tiempo_total_parado_minutos": 145,
  "tiempo_viajando_minutos": 480,
  "paradas": [
    {
      "latitud": 20.6592,
      "longitud": -103.3496,
      "inicio": "2024-01-15T12:00:00Z",
      "fin": "2024-01-15T13:30:00Z",
      "duracion_minutos": 90
    }
  ]
}

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

### Endpoint 3: GET `/api/reports/alerts/{userId}`

```
Propósito: Obtener historial de alertas
Autenticación: Bearer Token (verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

□ Validar que usuario es admin
□ Validar formato de fechas
□ Retornar array de alertas con:
  - tipo_alerta (enum: BATTERY_LOW, SIGNAL_LOST, DISCONNECTED, DEVICE_OFF, GEOFENCE_ENTER, GEOFENCE_EXIT)
  - timestamp_alerta (ISO-8601)
  - descripcion (string nullable)

Response esperado:
Status: 200 OK
Content-Type: application/json
[
  {
    "tipo_alerta": "BATTERY_LOW",
    "timestamp_alerta": "2024-01-15T09:30:00Z",
    "descripcion": "Batería por debajo del 20%"
  },
  {
    "tipo_alerta": "GEOFENCE_ENTER",
    "timestamp_alerta": "2024-01-15T12:00:00Z",
    "descripcion": null
  }
]

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

### Endpoint 4: GET `/api/reports/geofence-events/{userId}`

```
Propósito: Obtener eventos de geocercas (entrada/salida)
Autenticación: Bearer Token (verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

□ Validar que usuario es admin
□ Validar formato de fechas
□ Retornar array de eventos con:
  - geofence_nombre (string)
  - tipo_evento (enum: ENTER, EXIT)
  - timestamp_evento (ISO-8601)

Response esperado:
Status: 200 OK
Content-Type: application/json
[
  {
    "geofence_nombre": "Oficina Central",
    "tipo_evento": "ENTER",
    "timestamp_evento": "2024-01-15T08:00:00Z"
  },
  {
    "geofence_nombre": "Oficina Central",
    "tipo_evento": "EXIT",
    "timestamp_evento": "2024-01-15T17:30:00Z"
  }
]

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

### Endpoint 5: GET `/api/reports/export/pdf/{userId}` ⚠️ CRÍTICO

```
Propósito: Exportar reporte en PDF
Autenticación: Bearer Token (OBLIGATORIO verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

⚠️ IMPORTANTE: ESTE ENDPOINT ES CRÍTICO Y ES DONDE ESTÁ EL PROBLEMA

□ Validar que usuario es admin (si no → 403 Forbidden)
□ Validar formato de fechas
□ Generar PDF con:
  - Título del reporte
  - Datos del usuario
  - Rango de fechas
  - Tabla de rutas
  - Estadísticas de velocidad
  - Lista de paradas
  - Historial de alertas
  - Eventos de geocercas
  - Mapa (opcional pero recomendado)

□ Devolver BLOB BINARIO (NO JSON!)
□ Headers OBLIGATORIOS:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="reporte_1_2024-01-01_2024-12-31.pdf"
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Authorization, Content-Type, Accept
  Content-Length: [tamaño real del archivo]

□ El archivo debe tener CONTENIDO (no 0 bytes)

Response esperado:
Status: 200 OK
Content-Type: application/pdf
[BINARIO PDF REAL - NO JSON]

RES MALO (NO HACER):
{
  "error": "PDF not generated"
}

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

### Endpoint 6: GET `/api/reports/export/excel/{userId}` ⚠️ CRÍTICO

```
Propósito: Exportar reporte en Excel
Autenticación: Bearer Token (OBLIGATORIO verificar rol = admin)
Parámetros: startDate, endDate (YYYY-MM-DD)

⚠️ IMPORTANTE: ESTE ENDPOINT ES CRÍTICO Y ES DONDE ESTÁ EL PROBLEMA

□ Validar que usuario es admin (si no → 403 Forbidden)
□ Validar formato de fechas
□ Generar Excel con:
  - Sheet 1: Datos de rutas (columnas: timestamp, lat, lng, velocidad, bateria)
  - Sheet 2: Estadísticas (columnas: métrica, valor)
  - Sheet 3: Paradas (columnas: número, inicio, fin, duración, lat, lng)
  - Sheet 4: Alertas (columnas: tipo, timestamp, descripción)
  - Sheet 5: Geocercas (columnas: nombre, evento, timestamp)

□ Devolver BLOB BINARIO (NO JSON!)
□ Headers OBLIGATORIOS:
  Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Content-Disposition: attachment; filename="reporte_1_2024-01-01_2024-12-31.xlsx"
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Access-Control-Allow-Headers: Authorization, Content-Type, Accept
  Content-Length: [tamaño real del archivo]

□ El archivo debe tener CONTENIDO (no 0 bytes)

Response esperado:
Status: 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
[BINARIO EXCEL REAL - NO JSON]

Response MALO (NO HACER):
{
  "error": "Excel not generated"
}

□ IMPLEMENTADO
□ TESTEADO
□ DOCUMENTADO
```

---

## 🔒 VALIDACIÓN GENERAL

Para todos los endpoints:

### Autenticación

```
□ Verificar que Authorization header existe
□ Verificar que Bearer token es válido
□ Decodificar JWT y extraer rol
□ Verificar que rol es "admin" o "administrador"
□ Si falla: Retornar 403 Forbidden con mensaje
```

### Validación de Parámetros

```
□ startDate formato YYYY-MM-DD
□ endDate formato YYYY-MM-DD
□ startDate < endDate
□ userId es válido (existe en BD)
□ Si falta parámetro: Retornar 400 Bad Request
```

### CORS

```
□ Todos los endpoints deben tener:
   Access-Control-Allow-Origin: *
   (o specific origin si es necesario)
□ Soportar OPTIONS request para preflight
□ Headers requeridos: Authorization, Content-Type, Accept
```

### Error Handling

```
□ 400 Bad Request: Parámetros inválidos
□ 401 Unauthorized: Token inválido/expirado
□ 403 Forbidden: Usuario no es admin
□ 404 Not Found: Recurso no existe
□ 500 Internal Server Error: Error en servidor

□ Todos los errores deben retornar JSON:
   {
     "error": "descripción del error",
     "status": 400
   }
```

---

## 🧪 TEST CHECKLIST

```
Para cada endpoint:

□ Test sin token → Debe retornar 401
□ Test con token no-admin → Debe retornar 403
□ Test con token admin → Debe retornar 200
□ Test sin parámetros → Debe retornar 400
□ Test con fechas inválidas → Debe retornar 400
□ Test con rango grande → Debe funcionar
□ Test con rango pequeño → Debe funcionar
□ Test con user ID que no existe → Debe retornar [] o error consistente

Para endpoints de descarga (PDF/Excel):

□ Verificar que el archivo descargado no está vacío
□ Verificar que la descripción Content-Disposition tiene filename
□ Verificar que Content-Type es correcto
□ Verificar que CORS headers están presentes
□ Intentar descargar desde navegador web
□ Verificar que el archivo es binario (no JSON embebido)
□ Abrir archivo con aplicación correspondiente (PDF reader, Excel)
□ Verificar que el contenido es correcto
```

---

## 📊 STATUS DE IMPLEMENTACIÓN

```
Endpoint 1: /reports/route
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO

Endpoint 2: /reports/stats
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO

Endpoint 3: /reports/alerts
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO

Endpoint 4: /reports/geofence-events
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO

Endpoint 5: /reports/export/pdf
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO

Endpoint 6: /reports/export/excel
Status:  □ NO INICIADO  □ EN PROGRESO  □ COMPLETADO
```

---

## 🚀 DEPENDENCIAS RECOMENDADAS

```
Node.js / Express:
  □ npm install --save pdfkit        (generar PDF)
  □ npm install --save exceljs       (generar Excel)
  □ npm install --save cors          (CORS middleware)

Python / Django:
  □ pip install reportlab           (generar PDF)
  □ pip install openpyxl            (generar Excel)
  □ pip install django-cors-headers (CORS)

Java / Spring:
  □ Usar iText o Apache PDFBox       (generar PDF)
  □ Usar Apache POI                  (generar Excel)
  □ Usar spring-boot-starter-web     (CORS automático)
```

---

## 📞 CONTACTO

Si tienes dudas:

1. Revisa: `API_RESPONSE_SCHEMA.md`
2. Revisa: `BACKEND_REPORTS_REQUIREMENTS.md`
3. Usa: `test-reports-api.js` para validar

**Deadline sugerido:** ASAP (El frontend ya está 100% listo)

Status: 🚧 BLOQUEADO POR BACKEND
