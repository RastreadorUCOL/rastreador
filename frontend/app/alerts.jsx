import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import AlertCard from "../_components/alertCard";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken } from "../lib/auth-session";
import { api } from "../lib/fetch";

function formatAlertTitle(alert) {
  return alert?.tipo_alerta || alert?.tipo || `Alerta ${alert?.id_alert || ""}`;
}

function formatAlertDescription(alert) {
  return alert?.descripcion || alert?.mensaje || (alert?.usuario_nombre ? `Evento para ${alert.usuario_nombre}` : "Evento recibido.");
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
    if (!token) return;

    try {
      const data = await api.get(API_ROUTES.alerts.list, {
        token,
        query: { limit: 20, unreadOnly },
      });
      setAlerts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError("Error al cargar alertas.");
    } finally {
      setLoading(false);
    }
  }, [token, unreadOnly]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const unreadCount = useMemo(() => 
    alerts.filter((a) => a?.is_read === false || a?.is_read === 0).length, 
  [alerts]);

  const markAsRead = async (alertId) => {
    try {
      await api.put(API_ROUTES.alerts.markAsRead(alertId), undefined, { token });
      loadAlerts();
    } catch (err) {
      console.error("No se pudo marcar como leída");
    }
  };

  return (
    <AppShell subtitle="Centro de eventos críticos en tiempo real." title="Alertas">
      <View style={[appUi.card, styles.summary]}>
        <View>
          <Text style={styles.label}>Alertas</Text>
          <Text style={styles.value}>{loading ? "..." : alerts.length}</Text>
        </View>
        <View>
          <Text style={styles.label}>No leídas</Text>
          <Text style={styles.value}>{loading ? "..." : unreadCount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setUnreadOnly(!unreadOnly)}
        >
          <Text style={styles.filterBtnText}>{unreadOnly ? "Ver todas" : "Ver no leídas"}</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      ) : null}

      <View style={styles.grid}>
        {loading && <ActivityIndicator color="#091636" />}
        {alerts.length === 0 && !loading && (
          <View style={appUi.card}><Text style={styles.emptyText}>Sin alertas pendientes.</Text></View>
        )}
        {alerts.map((item, idx) => (
          <View key={idx} style={styles.alertWrapper}>
            <AlertCard title={formatAlertTitle(item)} description={formatAlertDescription(item)} />
            {(item?.is_read === false || item?.is_read === 0) && (
              <TouchableOpacity style={styles.readBtn} onPress={() => markAsRead(item.id_alert)}>
                <Text style={styles.readBtnText}>✓ Marcar leída</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, color: "#5c6d8f" },
  value: { fontSize: 24, fontWeight: "800", color: "#091636" },
  filterBtn: { backgroundColor: "#091636", padding: 10, borderRadius: 10 },
  filterBtnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  grid: { gap: 10, paddingBottom: 30 },
  alertWrapper: { gap: 5 },
  readBtn: { padding: 8, alignSelf: "flex-start" },
  readBtnText: { color: "#3b82f6", fontWeight: "600", fontSize: 13 },
  emptyText: { textAlign: "center", color: "#94a3b8" },
  errorBox: { padding: 12, backgroundColor: "#fee2e2", borderRadius: 12, marginBottom: 10 },
  errorText: { color: "#b91c1c" }
});

