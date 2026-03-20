import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

// Conditional import for map component (web only)
let MapComponent = null;
if (Platform.OS === "web") {
  try {
    const dynamic = require("react").lazy(
      () => import("../_components/route-map"),
    );
    MapComponent = dynamic;
  } catch (e) {
    MapComponent = null;
  }
}

// Utility functions for date formatting
function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
function daysAgoIsoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// Lazy Map Viewer Component
function MapRouteViewer({ routeData }) {
  if (!routeData || routeData.length === 0) return null;

  // Calculate center and bounds
  const lats = routeData.map((r) => r.latitud).filter(Boolean);
  const lngs = routeData.map((r) => r.longitud).filter(Boolean);

  if (lats.length === 0 || lngs.length === 0) return null;

  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

  return (
    <View style={styles.mapWrapper}>
      <iframe
        title="route-map"
        style={{
          width: "100%",
          height: "400px",
          border: "none",
          borderRadius: "12px",
        }}
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
              <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
              <style>
                body { margin: 0; padding: 0; }
                #map { position: absolute; top: 0; bottom: 0; width: 100%; }
              <\/style>
            </head>
            <body>
              <div id="map"><\/div>
              <script>
                const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  attribution: '© OpenStreetMap contributors',
                  maxZoom: 19,
                }).addTo(map);

                const routePoints = ${JSON.stringify(routeData.map((r) => [r.latitud, r.longitud]))};
                
                // Draw polyline
                L.polyline(routePoints.filter(p => p[0] && p[1]), {
                  color: '#3b82f6',
                  weight: 3,
                  opacity: 0.7,
                  smoothFactor: 1
                }).addTo(map);

                // Mark start and end
                L.circleMarker([${routeData[0].latitud}, ${routeData[0].longitud}], {
                  radius: 8,
                  fillColor: '#10b981',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).bindPopup('Inicio').addTo(map);

                L.circleMarker([${routeData[routeData.length - 1].latitud}, ${routeData[routeData.length - 1].longitud}], {
                  radius: 8,
                  fillColor: '#ef4444',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).bindPopup('Fin').addTo(map);
              <\/script>
            </body>
          </html>
        `}
      />
    </View>
  );
}

// Helper component for alert color mapping
function getAlertColor(tipo) {
  const colorMap = {
    BATTERY_LOW: styles.alertBattery,
    SIGNAL_LOST: styles.alertSignal,
    DISCONNECTED: styles.alertDisconnected,
    DEVICE_OFF: styles.alertDeviceOff,
    GEOFENCE_ENTER: styles.alertGeofence,
    GEOFENCE_EXIT: styles.alertGeofenceExit,
  };
  return colorMap[tipo] || styles.alertDefault;
}

// Report Card Component
function ReportCard({ title, value, label, color }) {
  return (
    <View
      style={[
        appUi.card,
        {
          flex: 1,
          minWidth: "45%",
          borderLeftColor: color,
          borderLeftWidth: 4,
        },
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

// Collapsible Section Component
function CollapsibleSection({ title, isExpanded, onToggle, children }) {
  return (
    <View style={appUi.card}>
      <TouchableOpacity onPress={onToggle} style={styles.sectionHeader}>
        <Text style={[appUi.sectionTitle, { flex: 1 }]}>{title}</Text>
        <Text style={styles.toggleIcon}>{isExpanded ? "▼" : "▶"}</Text>
      </TouchableOpacity>
      {isExpanded && children}
    </View>
  );
}

// Main Reports Component
export default function Reports() {
  const auth = getAuthContext();
  const [userId, setUserId] = useState(auth.userId ? String(auth.userId) : "");
  const [startDate, setStartDate] = useState(daysAgoIsoDate(7));
  const [endDate, setEndDate] = useState(todayIsoDate());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [routeRows, setRouteRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [geofenceEvents, setGeofenceEvents] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  // Check if user is admin
  const isAdmin =
    auth.role?.toLowerCase() === "admin" ||
    auth.role?.toLowerCase() === "administrador";

  const canRequest = Boolean(auth.token && userId && startDate && endDate);

  const summary = useMemo(
    () => ({
      routePoints: routeRows.length,
      averageSpeed: stats?.velocidad_promedio ?? "0.00",
      stoppedMinutes: stats?.tiempo_total_parado_minutos ?? "0.00",
      stopsCount: Array.isArray(stats?.paradas) ? stats.paradas.length : 0,
      alertsCount: alerts.length,
      eventsCount: geofenceEvents.length,
    }),
    [routeRows, stats, alerts, geofenceEvents],
  );

  const runReports = async () => {
    if (!canRequest) return;
    setLoading(true);
    setError("");
    try {
      const query = { startDate, endDate };
      const [routeData, statsData, alertsData, geofenceData] =
        await Promise.all([
          api.get(API_ROUTES.reports.route(userId), {
            token: auth.token,
            query,
          }),
          api.get(API_ROUTES.reports.stats(userId), {
            token: auth.token,
            query,
          }),
          api
            .get(API_ROUTES.reports.alerts(userId), {
              token: auth.token,
              query,
            })
            .catch(() => []),
          api
            .get(API_ROUTES.reports.geofenceEvents(userId), {
              token: auth.token,
              query,
            })
            .catch(() => []),
        ]);
      setRouteRows(Array.isArray(routeData) ? routeData : []);
      setStats(statsData || null);
      setAlerts(Array.isArray(alertsData) ? alertsData : []);
      setGeofenceEvents(Array.isArray(geofenceData) ? geofenceData : []);
    } catch (err) {
      setError("Error al generar reportes.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    if (!auth.token) {
      Alert.alert("Error", "No has iniciado sesión");
      return;
    }

    if (!userId || !startDate || !endDate) {
      Alert.alert("Error", "Completa todos los filtros antes de descargar");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      // Construir URL
      const baseUrl = API_ROUTES.reports.exportPdf(userId);
      const apiBase = baseUrl.substring(0, baseUrl.lastIndexOf("/reports"));
      const endpoint =
        format === "pdf"
          ? `${apiBase}/reports/export/pdf/${userId}`
          : `${apiBase}/reports/export/excel/${userId}`;

      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate,
      });
      const fullUrl = `${endpoint}?${params.toString()}`;

      console.log("📥 Descargando desde:", fullUrl);

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
          Accept:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}`;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || errorMsg;
          } catch {
            errorMsg = (await response.text()) || errorMsg;
          }
        } else {
          errorMsg = (await response.text()) || errorMsg;
        }

        throw new Error(errorMsg);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error("El servidor devolvió un archivo vacío");
      }

      const contentDisposition = response.headers.get("content-disposition");
      const filename = contentDisposition
        ? contentDisposition
            .split("filename=")[1]
            ?.replace(/"/g, "")
            ?.split(";")[0]
        : `reporte_${userId}_${startDate}_a_${endDate}.${format === "pdf" ? "pdf" : "xlsx"}`;

      if (Platform.OS === "web") {
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
        downloadLink.click();

        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobUrl);
        }, 100);

        console.log("✅ Descarga completada:", filename);
        Alert.alert("✅ Éxito", `Descarga de ${filename} iniciada`);
      } else {
        Alert.alert(
          "✅ Éxito",
          `Reporte generado. Tamaño: ${(blob.size / 1024).toFixed(2)} KB`,
        );
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error desconocido en descarga";
      console.error("❌ Error:", errorMsg);
      setError(`Error: ${errorMsg}`);
      Alert.alert("❌ Error en descarga", errorMsg);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell
      subtitle="Análisis de rutas, tiempos, alertas y eventos."
      title="Reportes"
    >
      {!isAdmin ? (
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedIcon}>🔒</Text>
          <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
          <Text style={styles.accessDeniedMessage}>
            Solo los administradores pueden acceder a los reportes.
          </Text>
          <Text style={styles.accessDeniedRole}>
            Tu rol actual: {auth.role || "No definido"}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* FILTROS */}
            <View style={appUi.card}>
              <Text style={appUi.sectionTitle}>Filtros</Text>
              <TextInput
                style={styles.input}
                placeholder="User ID"
                value={userId}
                onChangeText={setUserId}
                keyboardType="numeric"
              />
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Inicio (YYYY-MM-DD)"
                  value={startDate}
                  onChangeText={setStartDate}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Fin (YYYY-MM-DD)"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, !canRequest && styles.disabledBtn]}
                disabled={!canRequest}
                onPress={runReports}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? "Cargando..." : "Generar Reporte"}
                </Text>
              </TouchableOpacity>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* RESUMEN */}
            {(routeRows.length > 0 || alerts.length > 0) && (
              <>
                <Text style={appUi.sectionTitle}>RESUMEN</Text>
                <View style={styles.grid}>
                  <ReportCard
                    title="Puntos de Ruta"
                    value={summary.routePoints}
                    label="coordenadas"
                    color="#3b82f6"
                  />
                  <ReportCard
                    title="Vel. Promedio"
                    value={`${summary.averageSpeed} km/h`}
                    label="velocidad"
                    color="#10b981"
                  />
                  <ReportCard
                    title="Paradas"
                    value={summary.stopsCount}
                    label={`${summary.stoppedMinutes}min`}
                    color="#f59e0b"
                  />
                  <ReportCard
                    title="Alertas"
                    value={summary.alertsCount}
                    label="eventos"
                    color="#ef4444"
                  />
                  <ReportCard
                    title="Geocercas"
                    value={summary.eventsCount}
                    label="eventos"
                    color="#8b5cf6"
                  />
                </View>
              </>
            )}

            {/* SECCIÓN RUTAS */}
            {routeRows.length > 0 && (
              <CollapsibleSection
                title={`Rutas Recorridas (${routeRows.length} puntos)`}
                isExpanded={expandedSection === "routes"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "routes" ? null : "routes",
                  )
                }
              >
                {/* MAPA (solo en web) */}
                {Platform.OS === "web" && routeRows.length > 0 && (
                  <View style={styles.mapContainer}>
                    <MapRouteViewer routeData={routeRows} />
                  </View>
                )}

                <Text style={styles.sectionInfo}>Detalles de la ruta:</Text>

                {/* PUNTOS DE UBICACIÓN */}
                <Text style={[styles.sectionSubtitle, { marginTop: 12 }]}>
                  📍 Puntos de Recorrido
                </Text>
                {routeRows.slice(0, 10).map((point, idx) => (
                  <View key={idx} style={styles.dataItem}>
                    <Text style={styles.dataLabel}>•</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.dataText}>
                        {new Date(point.timestamp_captura).toLocaleString()}
                      </Text>
                      <Text style={styles.dataSubtext}>
                        📍 Lat: {point.latitud?.toFixed(4)}, Lng:{" "}
                        {point.longitud?.toFixed(4)}
                      </Text>
                      <Text style={styles.dataSubtext}>
                        ⚡ Velocidad: {point.velocidad || 0} km/h | 🔋 Batería:{" "}
                        {point.bateria || "N/A"}%
                      </Text>
                    </View>
                  </View>
                ))}
                {routeRows.length > 10 && (
                  <Text style={styles.moreText}>
                    ... y {routeRows.length - 10} puntos más
                  </Text>
                )}
              </CollapsibleSection>
            )}

            {/* SECCIÓN VELOCIDAD Y PARADAS */}
            {stats && (
              <CollapsibleSection
                title="⚡ Velocidad y Paradas"
                isExpanded={expandedSection === "speed"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "speed" ? null : "speed",
                  )
                }
              >
                <View style={styles.statsGrid}>
                  <View style={[appUi.card, styles.statCard]}>
                    <Text style={styles.statIcon}>⚡</Text>
                    <Text style={styles.statTitle}>Velocidad Promedio</Text>
                    <Text style={styles.statValue}>
                      {stats.velocidad_promedio || 0}
                    </Text>
                    <Text style={styles.statUnit}>km/h</Text>
                  </View>

                  <View style={[appUi.card, styles.statCard]}>
                    <Text style={styles.statIcon}>⏸️</Text>
                    <Text style={styles.statTitle}>Tiempo Total Parado</Text>
                    <Text style={styles.statValue}>
                      {stats.tiempo_total_parado_minutos || 0}
                    </Text>
                    <Text style={styles.statUnit}>minutos</Text>
                  </View>

                  {stats.velocidad_maxima && (
                    <View style={[appUi.card, styles.statCard]}>
                      <Text style={styles.statIcon}>🚀</Text>
                      <Text style={styles.statTitle}>Velocidad Máxima</Text>
                      <Text style={styles.statValue}>
                        {stats.velocidad_maxima}
                      </Text>
                      <Text style={styles.statUnit}>km/h</Text>
                    </View>
                  )}

                  {stats.tiempo_viajando_minutos && (
                    <View style={[appUi.card, styles.statCard]}>
                      <Text style={styles.statIcon}>🛣️</Text>
                      <Text style={styles.statTitle}>Tiempo en Movimiento</Text>
                      <Text style={styles.statValue}>
                        {stats.tiempo_viajando_minutos}
                      </Text>
                      <Text style={styles.statUnit}>minutos</Text>
                    </View>
                  )}
                </View>

                {/* DETALLES DE PARADAS */}
                {stats.paradas &&
                  Array.isArray(stats.paradas) &&
                  stats.paradas.length > 0 && (
                    <View style={{ marginTop: 15 }}>
                      <Text style={styles.sectionSubtitle}>
                        🛑 Lugares de Parada ({stats.paradas.length})
                      </Text>
                      {stats.paradas.slice(0, 8).map((parada, idx) => (
                        <View key={idx} style={styles.paradaItem}>
                          <View style={styles.paradaHeader}>
                            <Text style={styles.paradaIndex}>{idx + 1}.</Text>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.paradaTime}>
                                {new Date(parada.inicio).toLocaleString()} -{" "}
                                {new Date(parada.fin).toLocaleString()}
                              </Text>
                              <Text style={styles.paradaDuration}>
                                ⏱️ Duración: {parada.duracion_minutos || 0}{" "}
                                minutos
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.paradaLocation}>
                            📍 {parada.latitud?.toFixed(4)},{" "}
                            {parada.longitud?.toFixed(4)}
                          </Text>
                        </View>
                      ))}
                      {stats.paradas.length > 8 && (
                        <Text style={styles.moreText}>
                          ... y {stats.paradas.length - 8} paradas más
                        </Text>
                      )}
                    </View>
                  )}
              </CollapsibleSection>
            )}

            {/* SECCIÓN ALERTAS */}
            {alerts.length > 0 && (
              <CollapsibleSection
                title={`Historial de Alertas (${alerts.length} alertas)`}
                isExpanded={expandedSection === "alerts"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "alerts" ? null : "alerts",
                  )
                }
              >
                {alerts.slice(0, 15).map((alert, idx) => (
                  <View
                    key={idx}
                    style={[styles.alertItem, getAlertColor(alert.tipo_alerta)]}
                  >
                    <View style={styles.alertBadge}>
                      <Text style={styles.alertBadgeText}>
                        {alert.tipo_alerta[0]}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.alertTitle}>
                        {alert.tipo_alerta.replace(/_/g, " ")}
                      </Text>
                      <Text style={styles.alertTime}>
                        {new Date(alert.timestamp_alerta).toLocaleString()}
                      </Text>
                      {alert.descripcion && (
                        <Text style={styles.alertDesc}>
                          {alert.descripcion}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
                {alerts.length > 15 && (
                  <Text style={styles.moreText}>
                    ... y {alerts.length - 15} alertas más
                  </Text>
                )}
              </CollapsibleSection>
            )}

            {/* SECCIÓN EVENTOS GEOCERCAS */}
            {geofenceEvents.length > 0 && (
              <CollapsibleSection
                title={`Eventos de Geocercas (${geofenceEvents.length} eventos)`}
                isExpanded={expandedSection === "geofence"}
                onToggle={() =>
                  setExpandedSection(
                    expandedSection === "geofence" ? null : "geofence",
                  )
                }
              >
                {geofenceEvents.slice(0, 15).map((event, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.eventItem,
                      event.tipo_evento === "ENTER"
                        ? styles.enterEvent
                        : styles.exitEvent,
                    ]}
                  >
                    <View style={styles.eventIcon}>
                      <Text style={styles.eventIconText}>
                        {event.tipo_evento === "ENTER" ? "→" : "←"}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventTitle}>
                        {event.geofence_nombre}
                      </Text>
                      <Text style={styles.eventType}>
                        {event.tipo_evento === "ENTER" ? "Entrada" : "Salida"}
                      </Text>
                      <Text style={styles.eventTime}>
                        {new Date(event.timestamp_evento).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
                {geofenceEvents.length > 15 && (
                  <Text style={styles.moreText}>
                    ... y {geofenceEvents.length - 15} eventos más
                  </Text>
                )}
              </CollapsibleSection>
            )}

            {/* EXPORTAR */}
            {(routeRows.length > 0 || alerts.length > 0) && (
              <View style={appUi.card}>
                <Text style={appUi.sectionTitle}>Descargar Reportes</Text>
                <Text style={styles.exportInfo}>
                  Obtén un reporte completo en tu formato preferido
                </Text>
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[
                      styles.exportBtn,
                      downloading && styles.disabledBtn,
                    ]}
                    onPress={() => downloadReport("pdf")}
                    disabled={downloading}
                  >
                    <Text style={styles.exportBtnText}>
                      {downloading ? "⏳ Descargando..." : "📄 PDF"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.exportBtn,
                      downloading && styles.disabledBtn,
                    ]}
                    onPress={() => downloadReport("excel")}
                    disabled={downloading}
                  >
                    <Text style={styles.exportBtnText}>
                      {downloading ? "⏳ Descargando..." : "📊 Excel"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {loading && (
              <ActivityIndicator
                size="large"
                color="#091636"
                style={{ marginVertical: 20 }}
              />
            )}
            {!loading &&
              routeRows.length === 0 &&
              alerts.length === 0 &&
              stats === null &&
              !error && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    Genera un reporte para ver los datos
                  </Text>
                </View>
              )}
          </View>
        </ScrollView>
      )}
    </AppShell>
  );
}

// StyleSheet Definition
const styles = StyleSheet.create({
  scrollContainer: { flex: 1 },
  container: { gap: 10, paddingBottom: 30 },

  // Access Denied
  accessDeniedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fafafa",
  },
  accessDeniedIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#091636",
    marginBottom: 10,
    textAlign: "center",
  },
  accessDeniedMessage: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 15,
  },
  accessDeniedRole: {
    fontSize: 12,
    color: "#94a3b8",
    fontStyle: "italic",
  },

  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  row: { flexDirection: "row", gap: 10 },
  primaryBtn: {
    backgroundColor: "#091636",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledBtn: { opacity: 0.5 },
  primaryBtnText: { color: "#fff", fontWeight: "bold" },
  errorText: { color: "#ef4444", marginTop: 10, fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cardTitle: { fontSize: 12, color: "#64748b" },
  cardValue: { fontSize: 20, fontWeight: "bold", marginVertical: 4 },
  cardLabel: { fontSize: 10, color: "#94a3b8" },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  toggleIcon: { fontSize: 12, color: "#091636" },
  sectionInfo: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 10,
    fontStyle: "italic",
  },

  dataItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dataLabel: { color: "#3b82f6", fontWeight: "bold" },
  dataText: { fontSize: 12, fontWeight: "500", color: "#1f2937" },
  dataSubtext: { fontSize: 11, color: "#64748b", marginTop: 2 },
  moreText: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 10,
    fontStyle: "italic",
    textAlign: "center",
  },

  alertItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
  },
  alertBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  alertBadgeText: { fontWeight: "bold", fontSize: 12, color: "#fff" },
  alertTitle: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
  alertTime: { fontSize: 10, color: "#64748b", marginTop: 2 },
  alertDesc: { fontSize: 11, color: "#475569", marginTop: 4 },
  alertBattery: { backgroundColor: "#fef3c7" },
  alertSignal: { backgroundColor: "#dbeafe" },
  alertDisconnected: { backgroundColor: "#fed7aa" },
  alertDeviceOff: { backgroundColor: "#fecaca" },
  alertGeofence: { backgroundColor: "#d1d5db" },
  alertGeofenceExit: { backgroundColor: "#d1d5db" },
  alertDefault: { backgroundColor: "#f3f4f6" },

  eventItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    borderLeftWidth: 3,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
  },
  eventIconText: { fontSize: 18, fontWeight: "bold" },
  eventTitle: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
  eventType: { fontSize: 10, color: "#64748b", marginTop: 2 },
  eventTime: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  enterEvent: { backgroundColor: "#ecfdf5", borderLeftColor: "#10b981" },
  exitEvent: { backgroundColor: "#fef2f2", borderLeftColor: "#ef4444" },

  exportInfo: { fontSize: 11, color: "#64748b", marginBottom: 10 },
  exportBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  exportBtnText: { color: "#1f2937", fontWeight: "600", fontSize: 12 },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: { color: "#94a3b8", fontSize: 14 },

  // Map styles
  mapContainer: { marginVertical: 15 },
  mapWrapper: {
    width: "100%",
    height: 400,
    borderRadius: 12,
    overflow: "hidden",
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statTitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#091636",
    marginVertical: 6,
  },
  statUnit: { fontSize: 10, color: "#94a3b8" },

  // Section subtitle
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#091636",
    marginBottom: 10,
  },

  // Parada items
  paradaItem: {
    backgroundColor: "#f8fafc",
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  paradaHeader: { flexDirection: "row", gap: 8, marginBottom: 6 },
  paradaIndex: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f59e0b",
    minWidth: 24,
  },
  paradaTime: { fontSize: 11, fontWeight: "500", color: "#1f2937" },
  paradaDuration: { fontSize: 10, color: "#64748b", marginTop: 2 },
  paradaLocation: { fontSize: 10, color: "#64748b", fontStyle: "italic" },
});
