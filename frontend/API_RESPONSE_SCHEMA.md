# 📊 Estructura de Datos Exacta Esperada por el Frontend

## 1. Endpoint: `/api/reports/route/{userId}`

**Response esperado:**

```json
[
  {
    "latitud": 20.6592,
    "longitud": -103.3496,
    "timestamp_captura": "2024-01-15T08:30:00Z",
    "velocidad": 45.5,
    "bateria": 85
  },
  {
    "latitud": 20.6595,
    "longitud": -103.35,
    "timestamp_captura": "2024-01-15T08:31:00Z",
    "velocidad": 48.2,
    "bateria": 84
  }
]
```

**Campos obligatorios:**

- `latitud` (number): Coordenada decimal
- `longitud` (number): Coordenada decimal
- `timestamp_captura` (ISO-8601): Momento de captura
- `velocidad` (number): km/h
- `bateria` (number): Porcentaje 0-100

---

## 2. Endpoint: `/api/reports/stats/{userId}`

**Response esperado:**

```json
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
    },
    {
      "latitud": 20.7,
      "longitud": -103.4,
      "inicio": "2024-01-15T15:00:00Z",
      "fin": "2024-01-15T15:55:00Z",
      "duracion_minutos": 55
    }
  ]
}
```

**Campos obligatorios:**

- `velocidad_promedio` (number): km/h promedio
- `velocidad_maxima` (number): km/h máxima
- `tiempo_total_parado_minutos` (number): Total parado
- `tiempo_viajando_minutos` (number): Total en movimiento
- `paradas` (array of objects):
  - `latitud` (number)
  - `longitud` (number)
  - `inicio` (ISO-8601)
  - `fin` (ISO-8601)
  - `duracion_minutos` (number)

---

## 3. Endpoint: `/api/reports/alerts/{userId}`

**Response esperado:**

```json
[
  {
    "tipo_alerta": "BATTERY_LOW",
    "timestamp_alerta": "2024-01-15T09:30:00Z",
    "descripcion": "Batería por debajo del 20%"
  },
  {
    "tipo_alerta": "GEOFENCE_ENTER",
    "timestamp_alerta": "2024-01-15T12:00:00Z",
    "descripcion": "Entrada a zona permitida"
  },
  {
    "tipo_alerta": "SIGNAL_LOST",
    "timestamp_alerta": "2024-01-15T14:45:00Z",
    "descripcion": null
  }
]
```

**Campos obligatorios:**

- `tipo_alerta` (enum): Uno de:
  - `BATTERY_LOW`
  - `SIGNAL_LOST`
  - `DISCONNECTED`
  - `DEVICE_OFF`
  - `GEOFENCE_ENTER`
  - `GEOFENCE_EXIT`
- `timestamp_alerta` (ISO-8601)
- `descripcion` (string nullable): Descripción del evento

---

## 4. Endpoint: `/api/reports/geofence-events/{userId}`

**Response esperado:**

```json
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
  },
  {
    "geofence_nombre": "Almacén San Luis",
    "tipo_evento": "ENTER",
    "timestamp_evento": "2024-01-15T12:15:00Z"
  }
]
```

**Campos obligatorios:**

- `geofence_nombre` (string): Nombre de la geocerca
- `tipo_evento` (enum): `ENTER` o `EXIT`
- `timestamp_evento` (ISO-8601)

---

## 5. Endpoint: `/api/reports/export/pdf/{userId}` ⚠️ CRÍTICO

**Headers de Request:**

```
GET /api/reports/export/pdf/1?startDate=2024-01-01&endDate=2024-12-31 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/pdf
```

**Headers de Response OBLIGATORIOS:**

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="reporte_1_2024-01-01_2024-12-31.pdf"
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Content-Length: 45823
```

**Body:**

- ❌ NO es JSON
- ❌ NO es texto
- ✅ ES un blob binario válido de PDF (bytes puros)

---

## 6. Endpoint: `/api/reports/export/excel/{userId}` ⚠️ CRÍTICO

**Headers de Request:**

```
GET /api/reports/export/excel/1?startDate=2024-01-01&endDate=2024-12-31 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

**Headers de Response OBLIGATORIOS:**

```
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="reporte_1_2024-01-01_2024-12-31.xlsx"
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Content-Length: 34567
```

**Body:**

- ❌ NO es JSON
- ❌ NO es texto
- ✅ ES un blob binario válido de Excel (bytes puros)

---

## ⚠️ Errores Comunes a EVITAR

### ❌ Devolver JSON en lugar de binario

```json
// ❌ MALO - El frontend recibirá un "PDF" corrupto
{
  "error": "No se pudo generar el PDF"
}
// Result: Archivo descargado es un JSON, no PDF
```

### ❌ Olvidar CORS Headers

```
// ❌ MALO - El navegador bloqueará la descarga
Access-Control-Allow-Origin: <falta>
// Result: CORS error en DevTools, no se descarga
```

### ❌ Devolver archivo vacío

```
// ❌ MALO - Archivo válido pero con 0 bytes
Content-Length: 0
// Result: Alerta en frontend "El servidor devolvió un archivo vacío"
```

### ❌ Devolver content-type incorrecto

```
// ❌ MALO - Content-Type JSON en lugar de PDF
Content-Type: application/json
// Result: El navegador intenta abrir como JSON
```

---

## 🧪 Validador Rápido

Usa este script en tu servidor para validar respuestas:

```javascript
// Node.js test
const fetch = require("node-fetch");

async function testReports() {
  const token = "your_admin_token";
  const baseUrl = "http://localhost:3000/api";

  // Test 1: Route
  console.log("🧪 Test 1: Rutas");
  let r1 = await fetch(
    `${baseUrl}/reports/route/1?startDate=2024-01-01&endDate=2024-12-31`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  console.log("Status:", r1.status, "Type:", r1.headers.get("content-type"));
  let d1 = await r1.json();
  console.log("Data:", d1.length, "items", Array.isArray(d1) ? "✅" : "❌");

  // Test 2: Stats
  console.log("\n🧪 Test 2: Stats");
  let r2 = await fetch(
    `${baseUrl}/reports/stats/1?startDate=2024-01-01&endDate=2024-12-31`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  console.log("Status:", r2.status, "Type:", r2.headers.get("content-type"));
  let d2 = await r2.json();
  console.log("Fields:", Object.keys(d2).join(", "));

  // Test 3: PDF (BINARIO!)
  console.log("\n🧪 Test 3: PDF Export");
  let r3 = await fetch(
    `${baseUrl}/reports/export/pdf/1?startDate=2024-01-01&endDate=2024-12-31`,
    {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/pdf" },
    },
  );
  console.log("Status:", r3.status);
  console.log(
    "Type:",
    r3.headers.get("content-type"),
    "✅ debe ser: application/pdf",
  );
  console.log("CORS:", r3.headers.get("access-control-allow-origin"));
  let blob = await r3.blob();
  console.log("Size:", blob.size, blob.size > 0 ? "✅" : "❌ VACÍO!");
}

testReports().catch(console.error);
```
