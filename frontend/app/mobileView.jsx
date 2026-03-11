import { useState } from "react";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken } from "../lib/auth-session";
import { api } from "../lib/fetch";

export default function MobileView() {
  const token = getAuthToken();
  const [syncMessage, setSyncMessage] = useState("Sin sincronizar");
  const [queueSize, setQueueSize] = useState(12);
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!token) {
      setSyncMessage("No hay token de sesion para sincronizar.");
      return;
    }

    setLoading(true);
    setSyncMessage("Sincronizando...");

    try {
      const nowIso = new Date().toISOString();
      const response = await api.post(
        API_ROUTES.locations.sync,
        {
          locations: [
            {
              latitud: 19.4326,
              longitud: -99.1332,
              precision_gps: 12,
              velocidad: 0,
              bateria: 40,
              senal: "LTE",
              timestamp_captura: nowIso,
            },
          ],
        },
        { token }
      );

      const savedPoints = Number(response?.puntos_guardados || 0);
      setQueueSize((current) => Math.max(0, current - savedPoints));
      setSyncMessage(response?.message || "Sincronizacion completada.");
    } catch (requestError) {
      setSyncMessage(requestError?.message || "No se pudo sincronizar la cola offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell
      subtitle="Vista del usuario rastreado con modo offline y reconexion."
      title="Vista movil"
    >
      <div style={styles.layout}>
        <div style={appUi.card}>
          <h3 style={appUi.sectionTitle}>Pantalla del usuario</h3>
          <p style={{ ...appUi.sectionDescription, marginBottom: "10px" }}>
            Seguimiento en tiempo real, permisos y sincronizacion en segundo plano.
          </p>

          <div style={styles.phone}>
            <div style={styles.notch} />
            <div style={styles.screen}>
              <div style={styles.statusBox}>
                <p style={styles.statusLabel}>Estado actual</p>
                <h4 style={styles.statusTitle}>Sin internet</h4>
                <p style={styles.statusSub}>Ultima ubicacion conocida: 10:18 AM</p>
              </div>

              <div style={styles.infoGrid}>
                <div style={styles.infoCard}>Bateria: 14%</div>
                <div style={styles.infoCard}>Cola offline: {queueSize} eventos</div>
              </div>

              <div style={styles.permissionsBox}>
                <div style={styles.permissionRow}>Rastreo activo</div>
                <div style={styles.permissionRow}>Segundo plano</div>
                <div style={styles.permissionRow}>Sincronizacion automatica</div>
              </div>

              <button style={appUi.primaryButton} type="button" onClick={handleSync}>
                {loading ? "Sincronizando..." : "Sincronizar cola"}
              </button>
              <p style={styles.syncMessage}>{syncMessage}</p>
            </div>
          </div>
        </div>

        <div style={{ ...appUi.card, ...styles.flowCard }}>
          <h3 style={appUi.sectionTitle}>Flujo de resiliencia</h3>
          <div style={styles.step}>1. En linea: envio en tiempo real.</div>
          <div style={styles.step}>2. Sin internet: se almacena cola local.</div>
          <div style={styles.step}>3. Orden temporal: sin duplicados.</div>
          <div style={styles.step}>4. Reconexion: sincronizacion automatica.</div>
          <div style={styles.step}>5. Bateria baja: frecuencia adaptativa.</div>
        </div>
      </div>
    </AppShell>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "10px",
    alignItems: "start",
  },
  phone: {
    width: "100%",
    maxWidth: "340px",
    margin: "0 auto",
    borderRadius: "34px",
    background: "#091636",
    padding: "10px",
  },
  notch: {
    width: "115px",
    height: "18px",
    margin: "0 auto 9px",
    borderRadius: "0 0 14px 14px",
    background: "#020818",
  },
  screen: {
    borderRadius: "24px",
    minHeight: "460px",
    background: "#f6f9ff",
    padding: "12px",
    display: "grid",
    gap: "10px",
    alignContent: "start",
  },
  statusBox: {
    background: "#091636",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "12px",
  },
  statusLabel: {
    margin: 0,
    fontSize: "12px",
    color: "#cfdbfb",
  },
  statusTitle: {
    margin: "4px 0 0 0",
    fontSize: "20px",
  },
  statusSub: {
    margin: "5px 0 0 0",
    fontSize: "12px",
    color: "#cfdbfb",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  infoCard: {
    border: "1px solid #d7deec",
    borderRadius: "12px",
    background: "#ffffff",
    padding: "10px",
    color: "#334a76",
    fontSize: "12px",
    fontWeight: 600,
  },
  permissionsBox: {
    border: "1px solid #d7deec",
    borderRadius: "14px",
    background: "#ffffff",
    padding: "10px",
    display: "grid",
    gap: "8px",
  },
  permissionRow: {
    fontSize: "13px",
    color: "#334a76",
  },
  flowCard: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  step: {
    border: "1px solid #d7deec",
    borderRadius: "12px",
    background: "#f4f8ff",
    padding: "10px",
    color: "#304873",
    fontSize: "13px",
  },
  syncMessage: {
    margin: 0,
    color: "#334a76",
    fontSize: "12px",
  },
};
