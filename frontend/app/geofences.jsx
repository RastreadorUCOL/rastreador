import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import GeofenceCard from "../_components/geofenceCard";
import AppShell, { appUi } from "../_components/app-shell";
import MapView from "../_components/mapView";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken, getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

export default function Geofences() {
  const [geofences, setGeofences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  // Formulario para definir el área
  const [formData, setFormData] = useState({
    nombre: "",
    latitud: "19.2433",
    longitud: "-103.725",
    radio: "200"
  });

  const token = getAuthToken();
  const { user } = getAuthContext();

  const loadGeofences = useCallback(async () => {
    setLoading(true);
    setError("");
    if (!token) return;

    try {
      const data = await api.get(API_ROUTES.geofences.list, { token });
      setGeofences(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError("No se pudieron cargar las geocercas.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadGeofences(); }, [loadGeofences]);

  const handleCreate = async () => {
    if (!formData.nombre || !formData.latitud || !formData.longitud) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      await api.post(API_ROUTES.geofences.create, {
        nombre: formData.nombre,
        tipo: "CIRCLE",
        coordenadas: { lat: parseFloat(formData.latitud), lng: parseFloat(formData.longitud) },
        radio: parseInt(formData.radio),
      }, { token });

      setShowForm(false);
      setFormData({ nombre: "", latitud: "19.2433", longitud: "-103.725", radio: "200" });
      loadGeofences();
      Alert.alert("Éxito", "Geocerca creada correctamente");
    } catch (err) {
      Alert.alert("Error", "No se pudo crear la geocerca");
    }
  };

  const isAdmin = user?.rol === "Administrador";

  return (
    <AppShell
      subtitle="Define áreas de control (geocercas) para recibir alertas de entrada y salida."
      title="Geocercas"
    >
      {/* MAPA DE REFERENCIA */}
      <View style={[appUi.card, { height: 350, padding: 0, overflow: 'hidden' }]}>
        <MapView markers={geofences.map(g => ({
          latitud: Number(g.coordenadas?.lat || 0),
          longitud: Number(g.coordenadas?.lng || 0),
          nombre: g.nombre || "Zona",
          radio: Number(g.radio || 200),
          isGeofence: true
        }))} />
      </View>

      {/* BOTÓN CREAR (Habilitado para pruebas) */}
      {!showForm && (
        <TouchableOpacity 
          style={[appUi.card, styles.createBtn]} 
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.createBtnText}>➕ Definir nueva geocerca</Text>
        </TouchableOpacity>
      )}

      {/* FORMULARIO DE DEFINICIÓN DE ÁREA */}
      {showForm && (
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Definir Área</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Nombre (ej. Oficina Central)" 
            value={formData.nombre}
            onChangeText={(v) => setFormData({...formData, nombre: v})}
          />
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Latitud" 
              keyboardType="numeric"
              value={formData.latitud}
              onChangeText={(v) => setFormData({...formData, latitud: v})}
            />
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Longitud" 
              keyboardType="numeric"
              value={formData.longitud}
              onChangeText={(v) => setFormData({...formData, longitud: v})}
            />
          </View>
          <TextInput 
            style={styles.input} 
            placeholder="Radio en metros (ej. 200)" 
            keyboardType="numeric"
            value={formData.radio}
            onChangeText={(v) => setFormData({...formData, radio: v})}
          />
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}>
              <Text style={styles.saveBtnText}>Guardar Geocerca</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* LISTA DE GEOCERCAS */}
      <View style={styles.listContainer}>
        <Text style={[appUi.sectionTitle, { marginBottom: 10 }]}>Zonas registradas</Text>
        {loading ? <ActivityIndicator color="#091636" /> : null}
        {geofences.map((item, idx) => (
          <GeofenceCard
            key={idx}
            name={item.nombre}
            type={item.tipo === "CIRCLE" ? "Círculo" : "Polígono"}
            event={`Radio: ${item.radio}m`}
          />
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  createBtn: {
    backgroundColor: "#091636",
    alignItems: "center",
    padding: 15,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c7d1e4",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: "#091636",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  cancelBtnText: { color: "#475569" },
  listContainer: {
    marginTop: 10,
    paddingBottom: 40,
  },
  errorBox: {
    padding: 15,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    marginBottom: 10,
  },
  errorText: { color: "#b91c1c" }
});

