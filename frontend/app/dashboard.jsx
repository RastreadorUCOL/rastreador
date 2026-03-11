import { Link } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import AlertCard from "../_components/alertCard";
import AppShell, { appUi } from "../_components/app-shell";
import MapView from "../_components/mapView";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken } from "../lib/auth-session";
import { api } from "../lib/fetch";

const quickLinks = [
  { href: "/alerts", title: "Alertas", description: "Eventos criticos del sistema" },
  { href: "/users", title: "Usuarios", description: "Alta, edicion y gestion" },
  { href: "/geofences", title: "Geocercas", description: "Zonas y eventos" },
  { href: "/reports", title: "Reportes", description: "Rutas y exportaciones" },
  { href: "/profile", title: "Perfil", description: "Privacidad y seguridad" },
  { href: "/mobileView", title: "Vista movil", description: "Flujo del usuario" },
];

function mapAlertDescription(alert) {
  if (alert?.descripcion) {
    return String(alert.descripcion);
  }

  if (alert?.mensaje) {
    return String(alert.mensaje);
  }

  return "Evento registrado por el sistema de rastreo.";
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [geofences, setGeofences] = useState([]);

  const token = getAuthToken();

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError("");

      if (!token) {
        setAlerts([]);
        setGeofences([]);
        setError("No hay token de sesion. Inicia sesion para consultar datos del dashboard.");
        setLoading(false);
        return;
      }

      try {
        const [alertsData, geofencesData] = await Promise.all([
          api.get(API_ROUTES.alerts.list, {
            token,
            query: { limit: 50, offset: 0 },
          }),
          api.get(API_ROUTES.geofences.list, { token }),
        ]);

        setAlerts(Array.isArray(alertsData) ? alertsData : []);
        setGeofences(Array.isArray(geofencesData) ? geofencesData : []);
      } catch (requestError) {
        setAlerts([]);
        setGeofences([]);
        setError(requestError?.message || "No se pudieron cargar los datos del dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [token]);

  const metrics = useMemo(() => {
    const uniqueUsers = new Set(alerts.map((item) => item?.id_user).filter(Boolean));
    const unreadAlerts = alerts.filter((item) => item?.is_read === false || item?.is_read === 0);

    return {
      activeDevices: uniqueUsers.size,
      incidents: unreadAlerts.length,
      activeGeofences: geofences.length,
      recentAlerts: alerts.length,
    };
  }, [alerts, geofences]);

  const recentAlerts = alerts.slice(0, 3);

  return (
    <AppShell
      subtitle="Mapa en tiempo real, estados y alertas de rastreo."
      title="Dashboard principal"
    >
      <div style={styles.stats}>
        <div style={{ ...appUi.card, ...styles.statCard }}>
          <p style={styles.statLabel}>Dispositivos activos</p>
          <p style={styles.statValue}>{loading ? "..." : metrics.activeDevices}</p>
        </div>
        <div style={{ ...appUi.card, ...styles.statCard }}>
          <p style={styles.statLabel}>Con incidencias</p>
          <p style={styles.statValue}>{loading ? "..." : metrics.incidents}</p>
        </div>
        <div style={{ ...appUi.card, ...styles.statCard }}>
          <p style={styles.statLabel}>Geocercas activas</p>
          <p style={styles.statValue}>{loading ? "..." : metrics.activeGeofences}</p>
        </div>
        <div style={{ ...appUi.card, ...styles.statCard }}>
          <p style={styles.statLabel}>Alertas recientes</p>
          <p style={styles.statValue}>{loading ? "..." : metrics.recentAlerts}</p>
        </div>
      </div>

      {error ? <div style={{ ...appUi.card, ...styles.errorBox }}>{error}</div> : null}

      <div style={appUi.card}>
        <h3 style={appUi.sectionTitle}>Mapa interactivo</h3>
        <p style={{ ...appUi.sectionDescription, marginBottom: "10px" }}>
          Ubicacion actual, bateria, velocidad y estado de conexion.
        </p>
        <MapView />
      </div>

      <div style={styles.alertGrid}>
        {recentAlerts.length === 0 && !loading ? (
          <div style={{ ...appUi.card, ...styles.emptyBox }}>
            No hay alertas recientes para mostrar.
          </div>
        ) : null}

        {recentAlerts.map((item) => (
          <AlertCard
            key={item?.id_alert || `${item?.tipo_alerta || "alert"}-${item?.timestamp_alerta || "row"}`}
            title={item?.tipo_alerta || "Alerta"}
            description={mapAlertDescription(item)}
          />
        ))}
      </div>

      <div style={styles.linksGrid}>
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} style={styles.linkCard}>
            <h3 style={styles.linkTitle}>{item.title}</h3>
            <p style={styles.linkText}>{item.description}</p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}

const styles = {
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },
  statCard: {
    padding: "14px",
  },
  statLabel: {
    margin: 0,
    color: "#5c6d8f",
    fontSize: "12px",
  },
  statValue: {
    margin: "8px 0 0 0",
    color: "#091636",
    fontSize: "30px",
    fontWeight: 800,
    lineHeight: 1,
  },
  alertGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "10px",
  },
  linksGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },
  linkCard: {
    ...appUi.card,
    textDecoration: "none",
    display: "block",
    color: "inherit",
  },
  linkTitle: {
    margin: 0,
    color: "#0f1f44",
    fontSize: "16px",
  },
  linkText: {
    margin: "5px 0 0 0",
    color: "#5c6d8f",
    fontSize: "13px",
  },
  errorBox: {
    borderColor: "#ef9a9a",
    color: "#6e1f1f",
    background: "#fdecec",
  },
  emptyBox: {
    color: "#3c507f",
  },
};
