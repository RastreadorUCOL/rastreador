import { useState } from "react";
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
    Modal,
} from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString();
}

function formatDateOnly(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString();
}

export default function Reports() {
    const auth = getAuthContext();
    const isAdmin = auth.role?.toLowerCase() === "admin" || auth.role?.toLowerCase() === "administrador";

    const [userId, setUserId] = useState("");
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");

    const [reportData, setReportData] = useState(null);
    const [showMap, setShowMap] = useState(false);

    if (!isAdmin) {
        return (
            <AppShell title="Reportes" subtitle="Solo para administradores">
                <View style={styles.accessDenied}>
                    <Text style={styles.accessIcon}>🔒</Text>
                    <Text style={styles.accessTitle}>Acceso Denegado</Text>
                    <Text style={styles.accessMessage}>
                        Solo los administradores pueden acceder a los reportes.
                    </Text>
                    <Text style={styles.accessRole}>Tu rol: {auth.role || "No definido"}</Text>
                </View>
            </AppShell>
        );
    }

    const canGenerate = Boolean(userId && startDate && endDate);

    const generateReport = async () => {
        if (!canGenerate) {
            Alert.alert("Error", "Completa todos los campos");
            return;
        }

        setLoading(true);
        setError("");
        setReportData(null);

        try {
            const query = { startDate, endDate };

            const [routeRes, statsRes, alertsRes, geofenceRes] = await Promise.all([
                api.get(API_ROUTES.reports.route(userId), { token: auth.token, query }).catch(() => []),
                api.get(API_ROUTES.reports.stats(userId), { token: auth.token, query }).catch(() => null),
                api.get(API_ROUTES.reports.alerts(userId), { token: auth.token, query }).catch(() => []),
                api.get(API_ROUTES.reports.geofenceEvents(userId), { token: auth.token, query }).catch(() => []),
            ]);

            setReportData({
                route: Array.isArray(routeRes) ? routeRes : [],
                stats: statsRes || { velocidad_promedio: 0, velocidad_maxima: 0, tiempo_total_parado_minutos: 0, paradas: [] },
                alerts: Array.isArray(alertsRes) ? alertsRes : [],
                geofences: Array.isArray(geofenceRes) ? geofenceRes : [],
            });
        } catch (err) {
            setError(err.message || "Error al generar reporte");
            Alert.alert("Error", err.message || "Error al generar reporte");
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (format) => {
        if (!reportData) {
            Alert.alert("Error", "Primero genera un reporte");
            return;
        }

        setDownloading(true);
        try {
            const endpoint = format === "pdf"
                ? API_ROUTES.reports.exportPdf(userId)
                : API_ROUTES.reports.exportExcel(userId);

            const url = `${endpoint}?startDate=${startDate}&endDate=${endDate}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                    Accept: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}`);
            }

            const blob = await response.blob();

            if (Platform.OS === "web") {
                const blobUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = `Reporte_${userId}_${startDate}.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
                Alert.alert("Éxito", `Reporte ${format.toUpperCase()} descargado`);
            } else {
                Alert.alert("Éxito", `Reporte generado (${(blob.size / 1024).toFixed(1)} KB)`);
            }
        } catch (err) {
            Alert.alert("Error", err.message || "Error al descargar");
        } finally {
            setDownloading(false);
        }
    };

    const { route = [], stats = {}, alerts = [], geofences = [] } = reportData || {};

    return (
        <AppShell title="Reportes" subtitle="Análisis de rutas, tiempos y actividad">
            <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={appUi.card}>
                        <Text style={appUi.sectionTitle}>Filtros de Búsqueda</Text>

                        <Text style={styles.label}>User ID</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresa el ID del usuario"
                            value={userId}
                            onChangeText={setUserId}
                            keyboardType="numeric"
                        />

                        <View style={styles.row}>
                            <View style={styles.half}>
                                <Text style={styles.label}>Fecha Inicio</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={startDate}
                                    onChangeText={setStartDate}
                                />
                            </View>
                            <View style={styles.half}>
                                <Text style={styles.label}>Fecha Fin</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    value={endDate}
                                    onChangeText={setEndDate}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.btnPrimary, !canGenerate && styles.btnDisabled]}
                            onPress={generateReport}
                            disabled={!canGenerate || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>📊 Generar Reporte</Text>
                            )}
                        </TouchableOpacity>

                        {error && <Text style={styles.error}>{error}</Text>}
                    </View>

                    {reportData && (
                        <>
                            <Text style={appUi.sectionTitle}>📋 Resumen del Período</Text>
                            <View style={styles.summaryGrid}>
                                <View style={[styles.statCard, { borderLeftColor: "#3b82f6" }]}>
                                    <Text style={styles.statValue}>{route.length}</Text>
                                    <Text style={styles.statLabel}>Puntos de Ruta</Text>
                                </View>
                                <View style={[styles.statCard, { borderLeftColor: "#10b981" }]}>
                                    <Text style={styles.statValue}>{stats.velocidad_promedio || 0} km/h</Text>
                                    <Text style={styles.statLabel}>Vel. Promedio</Text>
                                </View>
                                <View style={[styles.statCard, { borderLeftColor: "#f59e0b" }]}>
                                    <Text style={styles.statValue}>{stats.paradas?.length || 0}</Text>
                                    <Text style={styles.statLabel}>Paradas</Text>
                                </View>
                                <View style={[styles.statCard, { borderLeftColor: "#ef4444" }]}>
                                    <Text style={styles.statValue}>{alerts.length}</Text>
                                    <Text style={styles.statLabel}>Alertas</Text>
                                </View>
                                <View style={[styles.statCard, { borderLeftColor: "#8b5cf6" }]}>
                                    <Text style={styles.statValue}>{geofences.length}</Text>
                                    <Text style={styles.statLabel}>Eventos Geocerca</Text>
                                </View>
                            </View>

                            <View style={appUi.card}>
                                <View style={styles.sectionHeader}>
                                    <Text style={appUi.sectionTitle}>🗺️ Rutas Recorridas</Text>
                                    <TouchableOpacity onPress={() => setShowMap(true)}>
                                        <Text style={styles.mapLink}>Ver mapa</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.sectionInfo}>
                                    {route.length} puntos registrados del {formatDateOnly(startDate)} al {formatDateOnly(endDate)}
                                </Text>
                                {route.slice(0, 5).map((r, i) => (
                                    <View key={i} style={styles.routeItem}>
                                        <Text style={styles.routeTime}>{formatDate(r.timestamp_captura)}</Text>
                                        <Text style={styles.routeCoord}>
                                            📍 {r.latitud?.toFixed(5)}, {r.longitud?.toFixed(5)}
                                        </Text>
                                        <Text style={styles.routeSpeed}>⚡ {r.velocidad || 0} km/h</Text>
                                    </View>
                                ))}
                                {route.length > 5 && (
                                    <Text style={styles.more}>... y {route.length - 5} puntos más</Text>
                                )}
                            </View>

                            <View style={appUi.card}>
                                <Text style={appUi.sectionTitle}>⏱️ Tiempos de Parada y Velocidad</Text>
                                <View style={styles.statsRow}>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statBoxValue}>{stats.velocidad_promedio || 0}</Text>
                                        <Text style={styles.statBoxLabel}>km/h promedio</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statBoxValue}>{stats.velocidad_maxima || 0}</Text>
                                        <Text style={styles.statBoxLabel}>km/h máxima</Text>
                                    </View>
                                    <View style={styles.statBox}>
                                        <Text style={styles.statBoxValue}>{stats.tiempo_total_parado_minutos || 0}</Text>
                                        <Text style={styles.statBoxLabel}>min parado</Text>
                                    </View>
                                </View>

                                {stats.paradas && stats.paradas.length > 0 && (
                                    <>
                                        <Text style={styles.subTitle}>🛑 Lugares de Parada ({stats.paradas.length})</Text>
                                        {stats.paradas.slice(0, 5).map((p, i) => (
                                            <View key={i} style={styles.paradaItem}>
                                                <Text style={styles.paradaTime}>
                                                    {formatDate(p.inicio || p.start)} - {formatDate(p.fin || p.end)}
                                                </Text>
                                                <Text style={styles.paradaDuration}>
                                                    ⏱️ Duración: {p.duracion_minutos || p.duracion || 0} minutos
                                                </Text>
                                                <Text style={styles.paradaLoc}>
                                                    📍 {p.latitud?.toFixed(4) || p.lat?.toFixed(4)}, {p.longitud?.toFixed(4) || p.lng?.toFixed(4)}
                                                </Text>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>

                            <View style={appUi.card}>
                                <Text style={appUi.sectionTitle}>⚠️ Historial de Actividad y Alertas</Text>
                                {alerts.length === 0 ? (
                                    <Text style={styles.emptyText}>Sin alertas en este período</Text>
                                ) : (
                                    alerts.slice(0, 10).map((a, i) => (
                                        <View key={i} style={styles.alertItem}>
                                            <View style={[styles.alertBadge, { backgroundColor: getAlertColor(a.tipo_alerta) }]}>
                                                <Text style={styles.alertBadgeText}>{a.tipo_alerta?.[0] || "?"}</Text>
                                            </View>
                                            <View style={styles.alertInfo}>
                                                <Text style={styles.alertType}>{a.tipo_alerta?.replace(/_/g, " ")}</Text>
                                                <Text style={styles.alertTime}>{formatDate(a.timestamp_alerta)}</Text>
                                                {a.descripcion && <Text style={styles.alertDesc}>{a.descripcion}</Text>}
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>

                            <View style={appUi.card}>
                                <Text style={appUi.sectionTitle}>📍 Eventos de Geocercas</Text>
                                {geofences.length === 0 ? (
                                    <Text style={styles.emptyText}>Sin eventos de geocercas</Text>
                                ) : (
                                    geofences.slice(0, 10).map((g, i) => (
                                        <View key={i} style={[styles.geofenceItem, g.tipo_evento === "ENTER" ? styles.enterEvent : styles.exitEvent]}>
                                            <Text style={styles.geofenceIcon}>{g.tipo_evento === "ENTER" ? "→" : "←"}</Text>
                                            <View>
                                                <Text style={styles.geofenceName}>{g.geofence_nombre}</Text>
                                                <Text style={styles.geofenceType}>{g.tipo_evento === "ENTER" ? "Entrada" : "Salida"}</Text>
                                                <Text style={styles.geofenceTime}>{formatDate(g.timestamp_evento)}</Text>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>

                            <View style={appUi.card}>
                                <Text style={appUi.sectionTitle}>📥 Exportar Reporte</Text>
                                <Text style={styles.exportInfo}>
                                    Descarga el reporte completo en formato PDF o Excel
                                </Text>
                                <View style={styles.exportRow}>
                                    <TouchableOpacity
                                        style={[styles.exportBtn, downloading && styles.btnDisabled]}
                                        onPress={() => downloadFile("pdf")}
                                        disabled={downloading}
                                    >
                                        <Text style={styles.exportBtnText}>📄 PDF</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.exportBtn, downloading && styles.btnDisabled]}
                                        onPress={() => downloadFile("excel")}
                                        disabled={downloading}
                                    >
                                        <Text style={styles.exportBtnText}>📊 Excel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>🗺️ Ruta del Dispositivo</Text>
                        <TouchableOpacity onPress={() => setShowMap(false)}>
                            <Text style={styles.closeBtn}>✕ Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                    {route.length > 0 && Platform.OS === "web" && (
                        <View style={styles.mapWrapper}>
                            <iframe
                                title="route-map"
                                style={{ width: "100%", height: "100%", border: "none" }}
                                srcDoc={generateMapHTML(route)}
                            />
                        </View>
                    )}
                    {route.length === 0 && (
                        <Text style={styles.noMapData}>Sin datos de ruta para mostrar</Text>
                    )}
                </View>
            </Modal>
        </AppShell>
    );
}

function getAlertColor(tipo) {
    const colors = {
        BATTERY_LOW: "#fef3c7",
        SIGNAL_LOST: "#dbeafe",
        DISCONNECTED: "#fed7aa",
        GEOFENCE_ENTER: "#d1fae5",
        GEOFENCE_EXIT: "#fee2e2",
    };
    return colors[tipo] || "#f3f4f6";
}

function generateMapHTML(routeData) {
    const lats = routeData.map((r) => r.latitud).filter(Boolean);
    const lngs = routeData.map((r) => r.longitud).filter(Boolean);
    if (lats.length === 0) return "";

    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const map = L.map('map').setView([${centerLat}, ${centerLng}], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
          }).addTo(map);

          const routePoints = ${JSON.stringify(routeData.map((r) => [r.latitud, r.longitud]))};
          
          if (routePoints.length > 0) {
            L.polyline(routePoints, {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
            }).addTo(map);

            L.circleMarker(routePoints[0], {
              radius: 8,
              fillColor: '#10b981',
              color: '#fff',
              weight: 2,
            }).bindPopup('Inicio').addTo(map);

            L.circleMarker(routePoints[routePoints.length - 1], {
              radius: 8,
              fillColor: '#ef4444',
              color: '#fff',
              weight: 2,
            }).bindPopup('Fin').addTo(map);
          }
        </script>
      </body>
    </html>`;
}

const styles = StyleSheet.create({
    scroll: { flex: 1 },
    container: { gap: 16, padding: 16, paddingBottom: 40 },

    accessDenied: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    accessIcon: { fontSize: 60, marginBottom: 16 },
    accessTitle: { fontSize: 22, fontWeight: "bold", color: "#091636", marginBottom: 8 },
    accessMessage: { fontSize: 14, color: "#64748b", textAlign: "center", marginBottom: 8 },
    accessRole: { fontSize: 12, color: "#94a3b8", fontStyle: "italic" },

    label: { fontSize: 12, color: "#64748b", marginBottom: 4, fontWeight: "500" },
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 10,
        padding: 12,
        backgroundColor: "#fff",
        marginBottom: 12,
    },
    row: { flexDirection: "row", gap: 12 },
    half: { flex: 1 },

    btnPrimary: {
        backgroundColor: "#091636",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    error: { color: "#ef4444", fontSize: 12, marginTop: 8 },

    summaryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 12,
        borderLeftWidth: 4,
        minWidth: "30%",
        flex: 1,
    },
    statValue: { fontSize: 18, fontWeight: "bold", color: "#091636" },
    statLabel: { fontSize: 10, color: "#64748b" },

    sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    mapLink: { color: "#3b82f6", fontWeight: "600", fontSize: 12 },
    sectionInfo: { fontSize: 12, color: "#64748b", marginBottom: 12, fontStyle: "italic" },
    more: { fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 8, fontStyle: "italic" },

    routeItem: {
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        paddingVertical: 8,
    },
    routeTime: { fontSize: 11, color: "#1f2937", fontWeight: "500" },
    routeCoord: { fontSize: 10, color: "#64748b" },
    routeSpeed: { fontSize: 10, color: "#10b981" },

    statsRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    statBox: {
        flex: 1,
        backgroundColor: "#f8fafc",
        borderRadius: 10,
        padding: 12,
        alignItems: "center",
    },
    statBoxValue: { fontSize: 16, fontWeight: "bold", color: "#091636" },
    statBoxLabel: { fontSize: 9, color: "#64748b" },

    subTitle: { fontSize: 13, fontWeight: "600", color: "#091636", marginBottom: 8, marginTop: 8 },
    paradaItem: {
        backgroundColor: "#fef3c7",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8,
    },
    paradaTime: { fontSize: 11, fontWeight: "500", color: "#1f2937" },
    paradaDuration: { fontSize: 10, color: "#64748b" },
    paradaLoc: { fontSize: 10, color: "#64748b", fontStyle: "italic" },

    emptyText: { fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 20 },

    alertItem: { flexDirection: "row", gap: 10, padding: 10, borderRadius: 8, marginBottom: 8 },
    alertBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    alertBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
    alertInfo: { flex: 1 },
    alertType: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
    alertTime: { fontSize: 10, color: "#64748b" },
    alertDesc: { fontSize: 10, color: "#475569", marginTop: 2 },

    geofenceItem: {
        flexDirection: "row",
        gap: 12,
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
    },
    enterEvent: { backgroundColor: "#d1fae5", borderLeftColor: "#10b981" },
    exitEvent: { backgroundColor: "#fee2e2", borderLeftColor: "#ef4444" },
    geofenceIcon: { fontSize: 18, fontWeight: "bold" },
    geofenceName: { fontSize: 12, fontWeight: "600", color: "#1f2937" },
    geofenceType: { fontSize: 10, color: "#64748b" },
    geofenceTime: { fontSize: 10, color: "#94a3b8" },

    exportInfo: { fontSize: 11, color: "#64748b", marginBottom: 12 },
    exportRow: { flexDirection: "row", gap: 12 },
    exportBtn: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#d1d5db",
    },
    exportBtnText: { color: "#1f2937", fontWeight: "600", fontSize: 14 },

    modalContainer: { flex: 1, backgroundColor: "#fff" },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: "#091636" },
    closeBtn: { color: "#ef4444", fontWeight: "600" },
    mapWrapper: { flex: 1 },
    noMapData: { flex: 1, textAlign: "center", marginTop: 40, color: "#64748b" },
});
