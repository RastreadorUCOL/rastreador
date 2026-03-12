import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { clearAuthSession, getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

export default function Profile() {
  const router = useRouter();
  const auth = getAuthContext();

  const [nombre, setNombre] = useState(auth.user?.nombre || "");
  const [correo, setCorreo] = useState(auth.user?.correo || "");
  const [telefono, setTelefono] = useState(auth.user?.telefono || "");

  const [hasConsent, setHasConsent] = useState(false);
  const [loadingConsent, setLoadingConsent] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConsent = async () => {
      setLoadingConsent(true);
      if (!auth.token || !auth.userId) return;
      try {
        await api.get(API_ROUTES.consents.byUser(auth.userId), { token: auth.token });
        setHasConsent(true);
      } catch (err) {
        setHasConsent(false);
      } finally { setLoadingConsent(false); }
    };
    loadConsent();
  }, [auth.token, auth.userId]);

  const handleRecordConsent = async () => {
    try {
      await api.post(API_ROUTES.consents.create, { id_user: auth.userId }, { token: auth.token });
      setHasConsent(true);
      Alert.alert("Éxito", "Consentimiento registrado.");
    } catch (err) { Alert.alert("Error", "No se pudo registrar."); }
  };

  const handleRevokeConsent = async () => {
    try {
      await api.post(API_ROUTES.consents.revoke, {}, { token: auth.token });
      setHasConsent(false);
      Alert.alert("Éxito", "Consentimiento revocado.");
    } catch (err) { Alert.alert("Error", "No se pudo revocar."); }
  };

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <AppShell subtitle="Datos personales y privacidad." title="Perfil">
      <View style={styles.container}>
        {/* PERFIL */}
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Datos Personales</Text>
          <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
          <TextInput style={styles.input} value={correo} editable={false} placeholder="Correo" />
          <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" />
          <TouchableOpacity style={[styles.btn, {backgroundColor: '#ccc'}]} disabled>
            <Text style={styles.btnText}>Guardar Cambios</Text>
          </TouchableOpacity>
        </View>

        {/* PRIVACIDAD */}
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Privacidad</Text>
          <View style={[styles.statusBox, hasConsent ? styles.statusBoxOn : styles.statusBoxOff]}>
            <Text style={hasConsent ? styles.statusTextOn : styles.statusTextOff}>
              {hasConsent ? "✓ Rastreo Autorizado" : "✗ Rastreo Desactivado"}
            </Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleRecordConsent}>
            <Text style={styles.btnText}>Activar Rastreo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleRevokeConsent}>
            <Text style={styles.btnSecondaryText}>Revocar Permisos</Text>
          </TouchableOpacity>
        </View>

        {/* SESION */}
        <View style={appUi.card}>
          <Text style={appUi.sectionTitle}>Seguridad</Text>
          <Text style={styles.infoText}>Sesión activa como: {auth.user?.rol}</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, paddingBottom: 30 },
  input: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 12, padding: 12, backgroundColor: "#fff", marginBottom: 10 },
  btn: { backgroundColor: "#091636", padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 8 },
  btnText: { color: "#fff", fontWeight: "bold" },
  btnSecondary: { padding: 12, alignItems: "center" },
  btnSecondaryText: { color: "#ef4444", fontWeight: "600" },
  statusBox: { padding: 12, borderRadius: 12, marginBottom: 10, alignItems: "center" },
  statusBoxOn: { backgroundColor: "#eaf9ef", borderWidth: 1, borderColor: "#9de1b2" },
  statusBoxOff: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" },
  statusTextOn: { color: "#1f6a39", fontWeight: "bold" },
  statusTextOff: { color: "#b91c1c", fontWeight: "bold" },
  infoText: { color: "#64748b", fontSize: 13, marginBottom: 15 },
  logoutBtn: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 15, alignItems: "center" },
  logoutBtnText: { color: "#ef4444", fontWeight: "bold" }
});

