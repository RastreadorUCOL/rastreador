# Referencia de API (Contratos REST)

Este documento detalla la estructura y los contratos esperados por los endpoints de la API.

> **Nota General:** Todos los endpoints (salvo Registro y Login) requieren el header `Authorization: Bearer <token>`.

---

## 1. Módulo: Autenticación (`/api/auth`)

### 1.1 Registro de Usuario (`POST /register`)
- **Cuerpo (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@ejemplo.com",
  "password": "password123",
  "rol": "USER",
  "telefono": "555-0101",
  "identificador_interno": "EMP-001"
}
```

### 1.2 Iniciar Sesión (`POST /login`)
- **Respuesta de éxito (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "token": "...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "rol": "USER"
  }
}
```

---

## 2. Módulo: Ubicaciones (`/api/locations`)

### 2.1 Sincronización Offline (`POST /sync`)
- **Cuerpo (JSON):**
```json
{
  "locations": [
    {
      "latitud": 19.4326,
      "longitud": -99.1332,
      "timestamp_captura": "2026-03-10 15:00:00",
      "velocidad": 15.5
    }
  ]
}
```

---

## 3. Módulo: Geocercas (`/api/geofences`)

### 3.1 Crear Geocerca (`POST /`)
- **Cuerpo (JSON):**
```json
{
  "nombre": "Zona A",
  "tipo": "CIRCLE",
  "coordenadas": { "lat": 19.4326, "lng": -99.1332 },
  "radio": 500
}
```

---

## 6. Módulo: Clientes (`/api/clients`)

### 6.1 Crear Cliente (`POST /`)
- **Cuerpo (JSON):**
```json
{
  "nombre_empresa": "Logística SA",
  "contacto": "Juan Pérez",
  "id_user_admin": 1
}
```

---

## 9. Módulo: Consentimiento (`/api/consents`)

### 9.1 Registrar Consentimiento (`POST /`)
- **Cuerpo (JSON):**
```json
{
  "id_user": 3, 
  "ip_address": "127.0.0.1",
  "user_agent": "Mozilla/5.0..."
}
```
*(Nota: id_user es opcional si el usuario lo hace por sí mismo).*

### 9.2 Obtener Estado (`GET /user/:id_user`)
- **Respuesta:**
```json
{
  "id_consent": 1,
  "id_user": 3,
  "accepted_at": "2026-03-11T02:33:01.000Z",
  "ip_address": "127.0.0.1",
  "user_agent": "..."
}
```
