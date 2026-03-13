import { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform, Linking } from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

function todayIsoDate() { return new Date().toISOString().slice(0, 10); }
function daysAgoIsoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
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

  const summary = useMemo(() => ({
    routePoints: routeRows.length,
    averageSpeed: stats?.velocidad_promedio ?? "0.00",
    stoppedMinutes: stats?.tiempo_total_parado_minutos ?? "0.00",
    stopsCount: Array.isArray(stats?.paradas) ? stats.paradas.length : 0,
  }), [routeRows, stats]);

  const runReports = async () => {
    if (!canRequest) return;
    setLoading(true);
    setError("");
    try {
      const query = { startDate, endDate };
      const [routeData, statsData] = await Promise.all([
        api.get(API_ROUTES.reports.route(userId), { token: auth.token, query }),
        api.get(API_ROUTES.reports.stats(userId), { token: auth.token, query }),
      ]);
      setRouteRows(Array.isArray(routeData) ? routeData : []);
      setStats(statsData || null);
    } catch (err) {
      setError("Error al generar reportes.");
    } finally { setLoading(false); }
  };

  const downloadReport = async (format) => {
    const endpoint = format === "pdf" ? API_ROUTES.reports.exportPdf(userId) : API_ROUTES.reports.exportExcel(userId);
    const url = `${endpoint}?startDate=${startDate}&endDate=${endDate}`;
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(err => Alert.alert("Error", "No se pudo abrir el enlace de descarga."));
    }
  };

  return (
    <AppShell subtitle="Análisis de rutas y tiempos." title="Reportes">
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
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Inicio (YYYY-MM-DD)" value={startDate} onChangeText={setStartDate} />
            <TextInput style={[styles.input, {flex: 1}]} placeholder="Fin (YYYY-MM-DD)" value={endDate} onChangeText={setEndDate} />
          </View>
          <TouchableOpacity style={styles.primaryBtn} onPress={runReports}>
            <Text style={styles.primaryBtnText}>Generar Reporte</Text>
          </TouchableOpacity>
        </View>

        {/* RESUMEN */}
        <View style={styles.grid}>
          <ReportCard title="Puntos de Ruta" value={summary.routePoints} label="coordenadas" />
          <ReportCard title="Vel. Promedio" value={`${summary.averageSpeed} km/h`} label="velocidad" />
          <ReportCard title="Tiempo Parado" value={`${summary.stoppedMinutes} min`} label={`${summary.stopsCount} paradas`} />
        </View>

        {/* EXPORTAR */}
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Exportaciones</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => downloadReport("pdf")}>
              <Text style={styles.secondaryBtnText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => downloadReport("excel")}>
              <Text style={styles.secondaryBtnText}>Excel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

function ReportCard({ title, value, label }) {
  return (
    <View style={[appUi.card, { flex: 1, minWidth: '45%' }]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingBottom: 30 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 10, backgroundColor: "#fff", marginBottom: 10 },
  row: { flexDirection: "row", gap: 10 },
  primaryBtn: { backgroundColor: "#091636", padding: 14, borderRadius: 12, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "bold" },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#091636", padding: 12, borderRadius: 12, alignItems: "center" },
  secondaryBtnText: { color: "#091636", fontWeight: "bold" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cardTitle: { fontSize: 12, color: "#5c6d8f" },
  cardValue: { fontSize: 20, fontWeight: "bold", color: "#091636", marginVertical: 4 },
  cardLabel: { fontSize: 11, color: "#64748b" },
});

