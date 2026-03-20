import { Link, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import AlertCard from "../_components/alertCard";
import AppShell, { appUi } from "../_components/app-shell";
import MapView from "../_components/mapView";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken, getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";
import { useLocationTracker } from "../hooks/useLocationTracker";

const getQuickLinksByRole = (role) => {
  if (role === "ADMIN") {
    return [
      { href: "/alerts", title: "Alertas", description: "Eventos criticos" },
      { href: "/users", title: "Usuarios", description: "Gestion de personal" },
      { href: "/geofences", title: "Geocercas", description: "Zonas y eventos" },
      { href: "/reports", title: "Reportes", description: "Rutas y exportacion" },
    ];
  }

  if (role === "SUPERVISOR") {
    return [
      { href: "/alerts", title: "Alertas", description: "Eventos criticos" },
      { href: "/reports", title: "Reportes", description: "Rutas y exportacion" },
    ];
  }

  // USER (rastreado)
  return [
    { href: "/alerts", title: "Alertas", description: "Tus eventos" },
  ];
};

function formatTime(isoString) {
  if (!isoString) return "--:--";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function mapAlertDescription(item) {
  if (!item) return "Sin detalles";
  const time = formatTime(item.timestamp_alerta);
  return `${item.mensaje_alerta || "Evento detectado"} a las ${time}`;
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [geofences, setGeofences] = useState([]);
  
  const token = getAuthToken();
  const { user, role } = getAuthContext();
  const { currentMetrics, lastSync } = useLocationTracker();
  const [activeLocations, setActiveLocations] = useState([]);

  const normalizedRole = useMemo(
    () => String(role || user?.rol || "").toUpperCase(),
    [role, user?.rol]
  );
  const isAdminOrSup = normalizedRole === "ADMIN" || normalizedRole === "SUPERVISOR";

  const quickLinks = useMemo(
  () => getQuickLinksByRole(normalizedRole),
  [normalizedRole]
);

  useEffect(() => {
    
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Inicia sesion para consultar datos.");
        setLoading(false);
        return;
      }

      try {
        const [alertsData, geofencesData] = await Promise.all([
          isAdminOrSup
            ? api.get(API_ROUTES.alerts.list, { token, query: { limit: 5, offset: 0 } })
            : Promise.resolve([]),
          isAdminOrSup
            ? api.get(API_ROUTES.geofences.list, { token })
            : Promise.resolve([]),
        ]);

        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setGeofences(Array.isArray(geofencesData) ? geofencesData : []);
        setActiveLocations([]);
      } catch (requestError) {
        setError("Error al cargar datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [token, isAdminOrSup]);

  const recentAlerts = alerts.slice(0, 3);

  return (
    <AppShell
      subtitle="Estados y alertas de rastreo en tiempo real."
      title="Dashboard"
    >
      {/* STATS CARDS */}
      <View style={styles.statsGrid}>
        <StatCard label="Batería" value={`${currentMetrics.battery}%`} sub={currentMetrics.network} />
        <StatCard label="Velocidad" value={`${currentMetrics.speed}`} sub="km/h" />
        {isAdminOrSup && (
          <StatCard label="Geocercas" value={geofences.length} sub="Zonas activas" />
        )}
        <StatCard label="Sincro" value={formatTime(lastSync)} sub="Última vez" />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* MAP SECTION */}
      <View style={[appUi.card, styles.mapSection]}>
        <View style={styles.sectionHeader}>
          <Text style={appUi.sectionTitle}>Mapa interactivo</Text>
          <Text style={appUi.sectionDescription}>
            Ubicación de {isAdminOrSup ? "dispositivos" : "tu dispositivo"}
          </Text>
        </View>
        <MapView markers={activeLocations} />
      </View>

      {/* DISPOSITIVOS LIST (Solo Admin) */}
      {isAdminOrSup && activeLocations.length > 0 && (
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Dispositivos Activos</Text>
          {activeLocations.map((loc, idx) => (
            <View key={idx} style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{loc.nombre || `Usuario ${loc.id_user}`}</Text>
                <Text style={styles.deviceStatus}>{loc.velocidad > 0 ? "⚡ Movimiento" : "🅿️ Estacionado"}</Text>
              </View>
              <Text style={styles.deviceSub}>🔋 {loc.bateria}% | {loc.velocidad} km/h</Text>
            </View>
          ))}
        </View>
      )}

      {isAdminOrSup && (
        <>
          {/* RECENT ALERTS */}
          <View style={styles.alertHeader}>
            <Text style={appUi.sectionTitle}>Alertas Recientes</Text>
          </View>
          
          {recentAlerts.length === 0 && !loading ? (
            <View style={appUi.card}>
              <Text style={styles.emptyText}>No hay alertas recientes.</Text>
            </View>
          ) : (
            recentAlerts.map((item, idx) => (
              <AlertCard
                key={idx}
                title={item?.tipo_alerta || "Alerta"}
                description={mapAlertDescription(item)}
              />
            ))
          )}
        </>
      )}

      {/* QUICK LINKS */}
      <View style={styles.linksGrid}>
        {quickLinks.map((item) => (
          <TouchableOpacity 
            key={item.href} 
            onPress={() => router.push(item.href)}
            style={StyleSheet.flatten([appUi.card, styles.linkCard])}
          >
            <Text style={styles.linkTitle}>{item.title}</Text>
            <Text style={styles.linkDescription}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </AppShell>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <View style={StyleSheet.flatten([appUi.card, styles.statCard])}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 180 : '48%',
    padding: 14,
  },
  statLabel: { fontSize: 12, color: "#5c6d8f" },
  statValue: { fontSize: 26, fontWeight: "800", color: "#091636", marginVertical: 4 },
  statSub: { fontSize: 11, color: "#5c6d8f" },
  mapSection: { padding: 10, minHeight: 400 },
  sectionHeader: { padding: 10 },
  errorBox: {
    backgroundColor: "#fdecec",
    borderColor: "#ef9a9a",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  errorText: { color: "#b91c1c", fontSize: 13, textAlign: "center" },
  deviceItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  deviceInfo: { flexDirection: "row", justifyContent: "space-between" },
  deviceName: { fontWeight: "bold", color: "#1e293b", fontSize: 14 },
  deviceStatus: { fontSize: 11, color: "#64748b" },
  deviceSub: { fontSize: 12, color: "#475569", marginTop: 4 },
  alertHeader: { marginTop: 10, marginBottom: 5 },
  emptyText: { textAlign: "center", color: "#94a3b8", fontSize: 13 },
  linksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
    paddingBottom: 40,
  },
  linkCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 220 : '48%',
  },
  linkTitle: { fontWeight: "bold", color: "#0f1f44", fontSize: 15 },
  linkDescription: { fontSize: 12, color: "#5c6d8f", marginTop: 4 },
});

