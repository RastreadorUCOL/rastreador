# 🧪 Guía de Prueba Manual del Módulo de Reportes

## Paso 1: Verificar Acceso de Admin

```bash
# 1. Abre el navegador en: http://localhost:{puerto}/reports (o wherever expo sirve)
# 2. Si ves "🔒 Acceso Denegado" → NO ERES ADMIN
# 3. Si ves el formulario → ✅ ERES ADMIN

# Debugging: Abre DevTools (F12) → Console
# Verifica que el rol del JWT sea "admin"
```

## Paso 2: Probar Flujo de Reporte (CON DATOS EN BD)

```javascript
// En la consola del navegador (F12):
// Copia y ejecuta esto para verificar que tienes datos

// 1. Verifica el token
console.log(
  "Token:",
  localStorage.getItem("rastreador_token")?.substring(0, 20) + "...",
);

// 2. Verifica el usuario
const user = JSON.parse(localStorage.getItem("rastreador_user") || "{}");
console.log("Usuario:", user.id, "Rol:", user.rol);

// 3. Intenta hacer un fetch manual a rutas
const token = localStorage.getItem("rastreador_token");
fetch(
  "https://pruebarastreador-production.up.railway.app/api/reports/route/1?startDate=2024-01-01&endDate=2024-12-31",
  {
    headers: { Authorization: `Bearer ${token}` },
  },
)
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error);
```

## Paso 3: Generar Reporte

```
1. En el formulario, ingresa:
   - User ID: [un ID válido que tenga datos]
   - Inicio: 2024-01-01 (o una fecha con datos)
   - Fin: 2024-12-31 (fecha posterior)

2. Haz clic en "Generar Reporte"

3. Espera a que cargue (deberías ver: "Cargando...")

4. Debería mostrar:
   - RESUMEN con tarjetas de estadísticas
   - Sección "Rutas Recorridas" con mapa + puntos
   - Sección "Velocidad y Paradas" con estadísticas
   - Sección "Historial de Alertas" con eventos
   - Sección "Eventos de Geocercas" con entradas/salidas
```

## Paso 4: Probar Descarga PDF (CRÍTICO)

```
1. Una vez que el reporte está generado
2. En la sección "Descargar Reportes", haz clic en "📄 PDF"
3. Debería:
   - El botón mostrar "⏳ Descargando..." (deshabilitado)
   - Aparecer una alerta: "✅ Éxito - Descarga de reporte_X_2024-01-01_a_2024-12-31.pdf iniciada"
   - El archivo debería descargarse en tu carpeta de Descargas
   - El archivo debe ser un PDF real (abre en lectura de PDFs)

SI NO FUNCIONA:
→ Abre DevTools (F12) → Pestaña Network
→ Busca la petición a /export/pdf
→ ¿Qué status code devuelve? (200 = OK, 401 = sin auth, 403 = no es admin, 500 = error servidor)
→ ¿Qué headers devuelve? (debe tener Content-Type: application/pdf)
→ ¿El response body es binario? (debe tener datos raros, no JSON)
```

## Paso 5: Probar Descarga Excel (CRÍTICO)

```
1. Haz clic en "📊 Excel"
2. Debería:
   - El botón mostrar "⏳ Descargando..." (deshabilitado)
   - Aparecer una alerta: "✅ Éxito - Descarga de reporte_X_2024-01-01_a_2024-12-31.xlsx iniciada"
   - El archivo debería descargarse en tu carpeta de Descargas
   - El archivo debe ser un Excel real (abre en Excel, Numbers, Sheets)

SI NO FUNCIONA:
→ Abre DevTools (F12) → Console
→ Busca errores en rojo
→ El servidor devuelve: ¿JSON con error? ¿Archivo vacío? ¿Status 403?
```

## 📊 Checklist de Funcionalidad

- [ ] Puedo acceder a /reports como admin
- [ ] Veo "Acceso Denegado" si NO soy admin
- [ ] Puedo ver formulario de filtros
- [ ] Al generar reporte veo tarjetas de resumen
- [ ] El mapa aparece y muestra la ruta
- [ ] Veo puntos de ubicación con velo
- [ ] Veo estadísticas de velocidad y paradas
- [ ] Veo lista de paradas con detalles
- [ ] Veo alertas del historial
- [ ] Veo eventos de geocercas
- [ ] Puedo descargar PDF
- [ ] El PDF es un archivo real (no corrupto)
- [ ] Puedo descargar Excel
- [ ] El Excel es un archivo real (no corrupto)

## 🐛 Si NADA funciona:

1. **¿El servidor está UP?**
   → Intenta: curl https://pruebarastreador-production.up.railway.app/api/

2. **¿Tienes token válido?**
   → DevTools → Storage → LocalStorage → busca "rastreador_token"

3. **¿El rol es "admin"?**
   → DevTools → Storage → LocalStorage → busca "rastreador_user" → rol debe ser "admin"

4. **¿Hay datos en la BD?**
   → Intenta en la consola:

   ```javascript
   let token = localStorage.getItem("rastreador_token");
   fetch(
     "https://pruebarastreador-production.up.railway.app/api/reports/route/1?startDate=2024-01-01&endDate=2024-31-31",
     {
       headers: { Authorization: `Bearer ${token}` },
     },
   )
     .then((r) => r.json())
     .then(console.log);
   ```

   → ¿Retorna un array? Si no hay datos, el servidor retorna []

5. **¿La descarga tiene CORS?**
   → DevTools → Network → Busca /export/pdf
   → Headers de response → ¿Tiene "Access-Control-Allow-Origin"?
   → Si no, el servidor necesita CORS configurado
