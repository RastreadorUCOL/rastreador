#!/usr/bin/env node

/**
 * Script de Test para API de Reportes
 * Uso: node test-reports-api.js <token> <userId>
 *
 * Ejemplo: node test-reports-api.js "eyJhbGciOi..." 1
 */

const API_BASE = "https://pruebarastreador-production.up.railway.app/api";

async function testEndpoint(name, url, headers = {}) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🧪 TEST: ${name}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, { headers });

    console.log(
      `\n📊 Response Status: ${response.status} ${response.statusText}`,
    );
    console.log(`Content-Type: ${response.headers.get("content-type")}`);
    console.log(
      `CORS Allow-Origin: ${response.headers.get("access-control-allow-origin")}`,
    );

    if (response.status === 200) {
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        try {
          const data = await response.json();
          console.log(`\n✅ Response es JSON válido`);
          console.log(`Data Type: ${Array.isArray(data) ? "Array" : "Object"}`);

          if (Array.isArray(data)) {
            console.log(`Length: ${data.length} items`);
            if (data.length > 0) {
              console.log(`\nPrimer item:`);
              console.log(JSON.stringify(data[0], null, 2));
            }
          } else {
            console.log(`Keys: ${Object.keys(data).join(", ")}`);
            console.log(`\nData:`);
            console.log(JSON.stringify(data, null, 2));
          }
          return { success: true, status: 200 };
        } catch (e) {
          console.log(`❌ No es JSON válido: ${e.message}`);
          const text = await response.text();
          console.log(`Raw: ${text.substring(0, 200)}`);
          return { success: false, status: 200 };
        }
      } else if (
        contentType.includes("application/pdf") ||
        contentType.includes("application/vnd.openxmlformats")
      ) {
        const blob = await response.blob();
        console.log(
          `\n✅ Response es Binario (${response.headers.get("content-type")})`,
        );
        console.log(`File Size: ${blob.size} bytes`);

        if (blob.size === 0) {
          console.log(`⚠️ WARNING: Archivo vacío!`);
          return { success: false, status: 200, message: "Empty file" };
        } else {
          console.log(`✅ Archivo válido`);
          return { success: true, status: 200, bytes: blob.size };
        }
      } else {
        const text = await response.text();
        console.log(
          `❌ Content-Type desconocido: ${response.headers.get("content-type")}`,
        );
        console.log(`Raw: ${text.substring(0, 200)}`);
        return { success: false, status: 200 };
      }
    } else {
      const text = await response.text();
      console.log(`\n❌ Error ${response.status}`);
      console.log(`Response: ${text.substring(0, 300)}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.log(`\n❌ Fetch Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const token = args[0];
  const userId = args[1] || "1";
  const startDate = "2024-01-01";
  const endDate = "2024-12-31";

  if (!token) {
    console.log(`
❌ ERROR: Token requerido

Uso: node test-reports-api.js <TOKEN> [userId]

Ejemplo:
  node test-reports-api.js "eyJhbGciOiJIUzI1NiIs..." 1

Para obtener tu token:
  1. Abre DevTools (F12) en el navegador
  2. Ve a Storage → LocalStorage
  3. Busca "rastreador_token" o "authToken"
  4. Copia el valor (sin comillas)
    `);
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          TEST SUITE: API de Reportes                           ║
╚════════════════════════════════════════════════════════════════╝

Token: ${token.substring(0, 30)}...
User ID: ${userId}
Date Range: ${startDate} a ${endDate}
  `);

  const results = [];

  // Test 1: Rutas
  results.push(
    await testEndpoint(
      "GET /reports/route",
      `${API_BASE}/reports/route/${userId}?startDate=${startDate}&endDate=${endDate}`,
      headers,
    ),
  );

  // Test 2: Stats
  results.push(
    await testEndpoint(
      "GET /reports/stats",
      `${API_BASE}/reports/stats/${userId}?startDate=${startDate}&endDate=${endDate}`,
      headers,
    ),
  );

  // Test 3: Alertas
  results.push(
    await testEndpoint(
      "GET /reports/alerts",
      `${API_BASE}/reports/alerts/${userId}?startDate=${startDate}&endDate=${endDate}`,
      headers,
    ),
  );

  // Test 4: Geocercas
  results.push(
    await testEndpoint(
      "GET /reports/geofence-events",
      `${API_BASE}/reports/geofence-events/${userId}?startDate=${startDate}&endDate=${endDate}`,
      headers,
    ),
  );

  // Test 5: PDF
  const pdfHeaders = {
    ...headers,
    Accept: "application/pdf",
  };
  results.push(
    await testEndpoint(
      "GET /reports/export/pdf (DESCARGA)",
      `${API_BASE}/reports/export/pdf/${userId}?startDate=${startDate}&endDate=${endDate}`,
      pdfHeaders,
    ),
  );

  // Test 6: Excel
  const excelHeaders = {
    ...headers,
    Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  results.push(
    await testEndpoint(
      "GET /reports/export/excel (DESCARGA)",
      `${API_BASE}/reports/export/excel/${userId}?startDate=${startDate}&endDate=${endDate}`,
      excelHeaders,
    ),
  );

  // Summary
  console.log(`\n
╔════════════════════════════════════════════════════════════════╗
║                    RESUMEN                                     ║
╚════════════════════════════════════════════════════════════════╝
  `);

  const testNames = ["Rutas", "Stats", "Alertas", "Geocercas", "PDF", "Excel"];
  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result, idx) => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    const detail = result.message
      ? ` (${result.message})`
      : result.bytes
        ? ` (${result.bytes} bytes)`
        : "";
    console.log(`${status} - ${testNames[idx]}${detail}`);
  });

  console.log(`\nTotal: ${passed} pasados, ${failed} fallidos\n`);

  if (failed === 0) {
    console.log(`🎉 ¡TODOS LOS TESTS PASARON! El API está listo.\n`);
    process.exit(0);
  } else {
    console.log(`⚠️ ${failed} tests fallaron. Revisa el backend.\n`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
