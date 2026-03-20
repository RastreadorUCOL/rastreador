import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { clearAuthSession, getAuthContext, setAuthSession } from "../lib/auth-session";
import { api } from "../lib/fetch";

export default function Profile() {
  const router = useRouter();
  const auth = getAuthContext();
  const normalizedRole = String(auth.role || auth.user?.rol || "").toUpperCase();
  const isUserRole = normalizedRole === "USER";
  const canQueryConsentEndpoint =
    normalizedRole === "ADMIN" || normalizedRole === "SUPERVISOR";

  const [nombre, setNombre] = useState(auth.user?.nombre || "");
  const [correo, setCorreo] = useState(auth.user?.correo || "");
  const [telefono, setTelefono] = useState(auth.user?.telefono || "");

  const [hasConsent, setHasConsent] = useState(false);
  const [loadingConsent, setLoadingConsent] = useState(true);
  const [error, setError] = useState("");

  const persistTrackingConsent = (enabled) => {
    const nextOptions = {
      ...(auth.options || {}),
      trackingConsent: enabled,
    };

    setAuthSession(auth.token, auth.user || null, nextOptions);
  };

  useEffect(() => {
    const loadConsent = async () => {
      setLoadingConsent(true);
      if (!auth.token || !auth.userId) {
        setLoadingConsent(false);
        return;
      }

      // Para USER no consultamos un endpoint que puede estar restringido en ambientes remotos.
      if (!canQueryConsentEndpoint) {
        setHasConsent(Boolean(auth.options?.trackingConsent));
        setLoadingConsent(false);
        return;
      }

      try {
        await api.get(API_ROUTES.consents.byUser(auth.userId), { token: auth.token });
        setHasConsent(true);
      } catch (err) {
        setHasConsent(false);
      } finally { setLoadingConsent(false); }
    };
    loadConsent();
  }, [auth.token, auth.userId, auth.options?.trackingConsent, canQueryConsentEndpoint]);

  const handleRecordConsent = async () => {
    setHasConsent(true);
    persistTrackingConsent(true);

    try {
      await api.post(API_ROUTES.consents.create, { id_user: auth.userId }, { token: auth.token });
      Alert.alert("Éxito", "Consentimiento registrado.");
    } catch (err) {
      // En algunos despliegues remotos el backend limita por rol; mantenemos el estado local para no bloquear la UX.
      console.warn("No se pudo registrar en backend, se mantuvo el cambio local de rastreo.", err);
    }
  };

  const handleRevokeConsent = async () => {
    setHasConsent(false);
    persistTrackingConsent(false);

    try {
      await api.post(API_ROUTES.consents.revoke, {}, { token: auth.token });
      Alert.alert("Éxito", "Consentimiento revocado.");
    } catch (err) {
      // Si backend remoto responde 403, el usuario igual puede desactivar rastreo en su sesión local.
      console.warn("No se pudo revocar en backend, se mantuvo el cambio local de rastreo.", err);
    }
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
          <TouchableOpacity
            style={styles.btn}
            onPress={hasConsent ? handleRevokeConsent : handleRecordConsent}
          >
            <Text style={styles.btnText}>{hasConsent ? "Desactivar Rastreo" : "Activar Rastreo"}</Text>
          </TouchableOpacity>
          {!isUserRole && (
            <TouchableOpacity style={styles.btnSecondary} onPress={handleRevokeConsent}>
              <Text style={styles.btnSecondaryText}>Revocar Permisos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SESION */}
        {isUserRole ? (
          <TouchableOpacity style={styles.userLogoutBtn} onPress={handleLogout}>
            <Text style={styles.userLogoutBtnText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        ) : (
          <View style={appUi.card}>
            <Text style={appUi.sectionTitle}>Seguridad</Text>
            <Text style={styles.infoText}>Sesión activa como: {auth.user?.rol}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}
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
  userLogoutBtn: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 12,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  userLogoutBtnText: { color: "#b91c1c", fontWeight: "bold" },
  logoutBtn: { borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 15, alignItems: "center" },
  logoutBtnText: { color: "#ef4444", fontWeight: "bold" }
});

