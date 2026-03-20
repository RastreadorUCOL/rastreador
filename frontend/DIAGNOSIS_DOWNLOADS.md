# 🚨 DIAGNÓSTICO RÁPIDO: POR QUÉ NO SE DESCARGAN LOS ARCHIVOS

## El Problema en 30 Segundos

```
Usuario hace clic en "📄 PDF"
        ↓
Frontend envía petición FETCH con token
        ↓
Servidor DEBERÍA devolver: BLOB BINARIO (archivo PDF)
        ↓
¿QUÉ ESTÁ SUCEDIENDO EN REALIDAD?
        ↓
❌ Opción 1: Servidor devuelve JSON con error
❌ Opción 2: Servidor devuelve archivo vacío (0 bytes)
❌ Opción 3: Servidor falta headers CORS
❌ Opción 4: Servidor error 403/401/500
```

---

## 🔍 CÓMO IDENTIFICAR CUÁL ES EL PROBLEMA

### Paso 1: Abre DevTools

```
Navegador → F12 → Network
```

### Paso 2: Reproduce el problema

```
1. Genera un reporte
2. Haz clic en "📄 PDF"
3. Abre DevTools si no estaba abierto
```

### Paso 3: Busca la petición fallida

```
Pestaña Network → Busca la fila con URL que contiene "export/pdf"
```

### Paso 4: Verifica el Status Code

```
┌─────────────────────────────────────────────────────────────┐
│ Status | Significado                                        │
├─────────────────────────────────────────────────────────────┤
│ 200    | ✅ OK (mirar más detalles abajo)                   │
│ 201    | ✅ Created (probablemente OK)                      │
│ 400    | ❌ Bad Request (parámetros mal)                    │
│ 401    | ❌ Unauthorized (token inválido/expirado)          │
│ 403    | ❌ Forbidden (NO ES ADMIN)                         │
│ 404    | ❌ Not Found (endpoint no existe)                  │
│ 500    | ❌ Server Error (crash en backend)                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 DIAGNÓSTICO POR STATUS CODE

### 🟢 Status 200 pero NO SE DESCARGA

```
Pestaña Network → Haz clic en la petición
        ↓
Response Headers:
  - Content-Type: ¿Es application/pdf?
  - Content-Disposition: ¿Tiene filename?
  - Access-Control-Allow-Origin: ¿Existe?

  ❌ Si Content-Type es "application/json" → ERROR!
     El servidor devuelve JSON, no PDF

  ❌ Si Content-Length es "0" → ERROR!
     Es un archivo vacío

  ❌ Si falta Access-Control-Allow-Origin → ERROR CORS!
     El navegador bloquea la descarga
```

### 🔴 Status 401 Unauthorized

```
Significa: Tu token no es válido

Soluciones:
1. Inicia sesión de nuevo
2. Veifica que el token esté en LocalStorage
3. DevTools → Storage → LocalStorage → rastreador_token

Comando para revisar el token:
  localStorage.getItem('rastreador_token')
```

### 🔴 Status 403 Forbidden

```
Significa: NO ERES ADMIN

Soluciones:
1. Verifica que tu usuario sea admin en la BD
2. Re-inicia sesión para que se cargue el rol correcto
3. DevTools → Storage → LocalStorage → rastreador_user
4. Busca "rol": "admin"

Si no tiene rol: habla con el admin del servidor
```

### 🔴 Status 404 Not Found

```
Significa: El endpoint /api/reports/export/pdf NO EXISTE

Soluciones:
1. El backend no implementó el endpoint
2. La URL es incorrecta
3. El servidor está caído

Verifica: ¿Existe en el backend el archivo/ruta para /api/reports/export/pdf?
```

### 🔴 Status 500 Internal Server Error

```
Significa: El servidor CRASHEÓ

Soluciones:
1. Revisa los logs del backend (stderr, stdout)
2. El servidor probablemente falla al generar el PDF
3. Hay un error no manejado en el backend

Ejemplo tipo de error:
  - No tien librería para generar PDF (npm/pip install missing)
  - Ruta a archivo incorrecto
  - Error en la BD
```

---

## 🧪 SCRIPT RÁPIDO DE DIAGNÓSTICO

Copia esto en la consola del navegador (F12) y ejecuta:

```javascript
// ============ DIAGNÓSTICO RÁPIDO ============

async function diagnostico() {
  console.log("🔍 INICIANDO DIAGNÓSTICO...\n");

  const token = localStorage.getItem("rastreador_token");
  const user = JSON.parse(localStorage.getItem("rastreador_user") || "{}");

  console.log("📋 Información del Usuario:");
  console.log("  User ID:", user.id);
  console.log("  Rol:", user.rol);
  console.log("  Token (primeros 20 chars):", token?.substring(0, 20) + "...");

  if (!token) {
    console.error("❌ ERROR: NO TIENES TOKEN! Inicia sesión primero.");
    return;
  }

  if (user.rol?.toLowerCase() !== "admin") {
    console.error("❌ ERROR: NO ERES ADMIN! Rol actual:", user.rol);
    return;
  }

  console.log("\n📡 Haciendo test de descarga PDF...\n");

  try {
    const response = await fetch(
      "https://pruebarastreador-production.up.railway.app/api/reports/export/pdf/1?startDate=2024-01-01&endDate=2024-12-31",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf",
        },
      },
    );

    console.log("📊 RESPUESTA DEL SERVIDOR:");
    console.log("  Status:", response.status, response.statusText);
    console.log("  Content-Type:", response.headers.get("content-type"));
    console.log("  Content-Length:", response.headers.get("content-length"));
    console.log(
      "  CORS Origin:",
      response.headers.get("access-control-allow-origin"),
    );

    if (response.status === 200) {
      const blob = await response.blob();
      console.log("\n📦 BLOB RECIBIDO:");
      console.log("  Tamaño:", blob.size, "bytes");
      console.log("  Tipo:", blob.type);

      if (blob.size === 0) {
        console.error("❌ ERROR: ¡BLOB VACÍO! El servidor devolvió 0 bytes");
        console.error(
          "   El backend NO está generando el archivo correctamente",
        );
      } else if (!blob.type.includes("pdf")) {
        console.error("❌ ERROR: ¡TIPO INCORRECTO! El blob es:", blob.type);
        console.error("   Debería ser: application/pdf");
      } else {
        console.log(
          "✅ TODO OK! PDF válido, tamaño:",
          (blob.size / 1024).toFixed(2),
          "KB",
        );
      }
    } else {
      console.error("❌ ERROR HTTP", response.status);
      const text = await response.text();
      console.error("   Respuesta:", text.substring(0, 200));
    }
  } catch (error) {
    console.error("❌ FETCH ERROR:", error.message);
  }
}

// Ejecutar diagnóstico
diagnostico();
```

---

## 📋 CHECKLIST DE DEBUGGGING

- [ ] ¿Tienes token válido? (NO está vacío en localStorage)
- [ ] ¿Eres admin? (tu rol es "admin")
- [ ] ¿El servidor está UP? (puedes acceder a https://pruebarastreador-production.up.railway.app)
- [ ] ¿El status 200?: (no 401, 403, 500)
- [ ] ¿Content-Type es application/pdf?: (no application/json)
- [ ] ¿El blob no está vacío?: (size > 0)
- [ ] ¿Hay Access-Control headers?: (access-control-allow-origin exists)

---

## 🎯 RESULTADO DEL DIAGNÓSTICO

```
Si ves en console:
✅ Status: 200
✅ Content-Type: application/pdf
✅ Blob size: 45823 bytes
→ EL FRONTEND ESTÁ OK, EL PROBLEMA ESTÁ EN EL NAVEGADOR/SO

Si ves:
⚠️ Blob size: 0 bytes
→ EL BACKEND NO GENERA EL ARCHIVO

Si ves:
❌ Status: 403
→ NO ERES ADMIN

Si ves:
❌ Status: 404
→ EL ENDPOINT NO EXISTE EN EL BACKEND

Si ves:
❌ Content-Type: application/json
→ EL BACKEND DEVUELVE JSON, NO PDF
    (Probablemente un error embebido en JSON)
```

---

## 📞 PRÓXIMO PASO

Corre el script de diagnóstico arriba y comparte el resultado aquí.
Los primeros 20-30 caracteres do output te dirán exactamente qué está fallando.
