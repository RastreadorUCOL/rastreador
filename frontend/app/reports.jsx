import { useMemo, useState } from "react";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

function todayIsoDate() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

function daysAgoIsoDate(days) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  return now.toISOString().slice(0, 10);
}

export default function Reports() {
  const auth = getAuthContext();
  const [userId, setUserId] = useState(auth.userId ? String(auth.userId) : "");
  const [startDate, setStartDate] = useState(daysAgoIsoDate(7));
  const [endDate, setEndDate] = useState(todayIsoDate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [routeRows, setRouteRows] = useState([]);
  const [stats, setStats] = useState(null);

  const canRequest = Boolean(auth.token && userId && startDate && endDate);

  const summary = useMemo(() => {
    const averageSpeed = stats?.velocidad_promedio ?? "0.00";
    const stoppedMinutes = stats?.tiempo_total_parado_minutos ?? "0.00";
    const stopsCount = Array.isArray(stats?.paradas) ? stats.paradas.length : 0;

    return {
      routePoints: routeRows.length,
      averageSpeed,
      stoppedMinutes,
      stopsCount,
    };
  }, [routeRows, stats]);

  const buildReportQuery = () => ({
    startDate,
    endDate,
  });

  const runReports = async () => {
    if (!canRequest) {
      setError("Completa userId, fechas y una sesion valida para consultar reportes.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = buildReportQuery();

      const [routeData, statsData] = await Promise.all([
        api.get(API_ROUTES.reports.route(userId), {
          token: auth.token,
          query,
        }),
        api.get(API_ROUTES.reports.stats(userId), {
          token: auth.token,
          query,
        }),
      ]);

      setRouteRows(Array.isArray(routeData) ? routeData : []);
      setStats(statsData && typeof statsData === "object" ? statsData : null);
    } catch (requestError) {
      setRouteRows([]);
      setStats(null);
      setError(requestError?.message || "No se pudieron generar los reportes.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (format) => {
    if (!canRequest) {
      setError("Completa userId, fechas y una sesion valida antes de exportar.");
      return;
    }

    const endpoint =
      format === "pdf"
        ? API_ROUTES.reports.exportPdf(userId)
        : API_ROUTES.reports.exportExcel(userId);

    const queryParams = new URLSearchParams(buildReportQuery()).toString();
    const url = `${endpoint}?${queryParams}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`No se pudo exportar ${format.toUpperCase()}.`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download =
        format === "pdf" ? `reporte_${userId}.pdf` : `reporte_${userId}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (requestError) {
      setError(requestError?.message || "No se pudo exportar el reporte.");
    }
  };

  return (
    <AppShell
      subtitle="Rutas, tiempos, velocidad, historial y exportaciones."
      title="Reportes"
    >
      <div style={styles.layout}>
        <div style={styles.mainGrid}>
          <div style={{ ...appUi.card, ...styles.reportCard }}>
            <h3 style={styles.reportTitle}>Ruta recorrida</h3>
            <p style={styles.reportText}>Puntos cargados: {loading ? "..." : summary.routePoints}</p>
            <button style={appUi.primaryButton} type="button" onClick={runReports}>
              Generar
            </button>
          </div>

          <div style={{ ...appUi.card, ...styles.reportCard }}>
            <h3 style={styles.reportTitle}>Velocidad promedio</h3>
            <p style={styles.reportText}>
              {loading ? "Calculando..." : `${summary.averageSpeed} km/h`}
            </p>
            <button style={appUi.primaryButton} type="button" onClick={runReports}>
              Actualizar
            </button>
          </div>

          <div style={{ ...appUi.card, ...styles.reportCard }}>
            <h3 style={styles.reportTitle}>Tiempos de parada</h3>
            <p style={styles.reportText}>
              {loading ? "Calculando..." : `${summary.stoppedMinutes} min`}
            </p>
            <p style={styles.reportText}>Paradas detectadas: {summary.stopsCount}</p>
          </div>

          <div style={{ ...appUi.card, ...styles.reportCard }}>
            <h3 style={styles.reportTitle}>Exportaciones</h3>
            <div style={styles.actions}>
              <button
                style={appUi.secondaryButton}
                type="button"
                onClick={() => downloadReport("pdf")}
              >
                Exportar PDF
              </button>
              <button
                style={appUi.secondaryButton}
                type="button"
                onClick={() => downloadReport("excel")}
              >
                Exportar Excel
              </button>
            </div>
          </div>
        </div>

        <div style={{ ...appUi.card, ...styles.filters }}>
          <h3 style={appUi.sectionTitle}>Filtros</h3>
          <input
            style={appUi.input}
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
          <input
            style={appUi.input}
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            style={appUi.input}
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <button style={appUi.primaryButton} type="button" onClick={runReports}>
            Aplicar filtros
          </button>
          {!auth.token ? (
            <p style={styles.helpText}>No hay token de sesion para consultar endpoints protegidos.</p>
          ) : null}
          {error ? <p style={styles.errorText}>{error}</p> : null}
        </div>
      </div>
    </AppShell>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(260px, 1fr)",
    gap: "10px",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },
  reportCard: {
    display: "grid",
    gap: "10px",
    alignContent: "start",
  },
  reportTitle: {
    margin: 0,
    color: "#0f1f44",
    fontSize: "16px",
  },
  reportText: {
    margin: 0,
    color: "#5c6d8f",
    fontSize: "13px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  filters: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  helpText: {
    margin: 0,
    color: "#5c6d8f",
    fontSize: "12px",
  },
  errorText: {
    margin: 0,
    color: "#6e1f1f",
    fontSize: "12px",
  },
};
