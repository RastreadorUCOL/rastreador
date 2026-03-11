import { useCallback, useEffect, useMemo, useState } from "react";
import AlertCard from "../_components/alertCard";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken } from "../lib/auth-session";
import { api } from "../lib/fetch";

function formatAlertTitle(alert) {
  if (alert?.tipo_alerta) {
    return String(alert.tipo_alerta);
  }

  if (alert?.tipo) {
    return String(alert.tipo);
  }

  return `Alerta ${alert?.id_alert || ""}`.trim();
}

function formatAlertDescription(alert) {
  if (alert?.descripcion) {
    return String(alert.descripcion);
  }

  if (alert?.mensaje) {
    return String(alert.mensaje);
  }

  if (alert?.usuario_nombre) {
    return `Evento registrado para ${alert.usuario_nombre}.`;
  }

  return "Evento recibido desde la API.";
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const token = getAuthToken();

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setAlerts([]);
      setError("No hay token de sesion. Inicia sesion para consultar alertas.");
      setLoading(false);
      return;
    }

    try {
      const data = await api.get(API_ROUTES.alerts.list, {
        token,
        query: { limit: 20, unreadOnly },
      });

      setAlerts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setAlerts([]);
      setError(requestError?.message || "No se pudieron cargar las alertas.");
    } finally {
      setLoading(false);
    }
  }, [token, unreadOnly]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const unreadCount = useMemo(
    () => alerts.filter((item) => item?.is_read === false || item?.is_read === 0).length,
    [alerts]
  );

  const markAsRead = async (alertId) => {
    if (!token || !alertId) {
      return;
    }

    try {
      await api.put(API_ROUTES.alerts.markAsRead(alertId), undefined, { token });
      await loadAlerts();
    } catch (requestError) {
      alert(requestError?.message || "No se pudo marcar la alerta como leida.");
    }
  };

  return (
    <AppShell
      subtitle="Centro de eventos criticos: bateria, conexion, geocercas y GPS."
      title="Alertas"
    >
      <div style={{ ...appUi.card, ...styles.summary }}>
        <div>
          <p style={styles.label}>Alertas cargadas</p>
          <p style={styles.value}>{loading ? "..." : alerts.length}</p>
        </div>
        <div>
          <p style={styles.label}>No leidas</p>
          <p style={styles.value}>{loading ? "..." : unreadCount}</p>
        </div>
        <button
          style={appUi.primaryButton}
          type="button"
          onClick={() => setUnreadOnly((current) => !current)}
        >
          {unreadOnly ? "Ver todas" : "Ver no leidas"}
        </button>
      </div>

      {error ? <div style={{ ...appUi.card, ...styles.errorBox }}>{error}</div> : null}

      <div style={styles.grid}>
        {!loading && alerts.length === 0 ? (
          <div style={{ ...appUi.card, ...styles.emptyBox }}>
            No hay alertas para mostrar con los filtros actuales.
          </div>
        ) : null}

        {alerts.map((item) => (
          <div key={item?.id_alert || formatAlertTitle(item)} style={styles.alertItem}>
            <AlertCard title={formatAlertTitle(item)} description={formatAlertDescription(item)} />
            {(item?.is_read === false || item?.is_read === 0) && item?.id_alert ? (
              <button
                style={{ ...appUi.secondaryButton, ...styles.readButton }}
                type="button"
                onClick={() => markAsRead(item.id_alert)}
              >
                Marcar como leida
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </AppShell>
  );
}

const styles = {
  summary: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  label: {
    margin: 0,
    color: "#5c6d8f",
    fontSize: "12px",
  },
  value: {
    margin: "4px 0 0 0",
    color: "#091636",
    fontSize: "24px",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "10px",
  },
  alertItem: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  readButton: {
    justifySelf: "start",
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
