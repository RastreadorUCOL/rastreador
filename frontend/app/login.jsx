import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import AuthFrame, { authFormStyles } from "../_components/auth-frame";
import { API_ROUTES } from "../lib/api-routes";
import { setAuthSession } from "../lib/auth-session";
import { api } from "../lib/fetch";

const DEFAULT_OPTIONS = {
  trackingConsent: true,
  backgroundLocation: true,
  batteryExemption: true,
};

export default function Login() {
  const router = useRouter();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!correo || !password) {
      if (Platform.OS === 'web') alert("Por favor llena todos los campos");
      else Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await api.post(API_ROUTES.auth.login, {
        correo,
        password,
      });

      if (!data?.token) {
        throw new Error("El backend no devolvio token de sesion.");
      }

      setAuthSession(data.token, data.user || null, options);

      if (options.trackingConsent) {
        try {
          await api.post(API_ROUTES.consents.create, {
            id_user: data.user?.id || data.user?.id_user,
          }, { token: data.token });
        } catch (consentError) {
          console.error("No se pudo registrar el consentimiento legal:", consentError);
        }
      }

      router.push("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
      if (Platform.OS === 'web') alert(message);
      else Alert.alert("Error de acceso", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOption = (key) => {
    setOptions((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <AuthFrame activeTab="login" title={"Iniciar sesion"}>
      <View style={localStyles.form}>
        <TextInput
          style={localStyles.input}
          placeholder="Correo electronico"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={localStyles.input}
          placeholder="Contrasena"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={localStyles.switchGroup}>
          <SwitchRow
            checked={options.trackingConsent}
            label="Consentimiento de rastreo"
            onToggle={() => toggleOption("trackingConsent")}
          />
          <SwitchRow
            checked={options.backgroundLocation}
            label="Ubicacion en segundo plano"
            onToggle={() => toggleOption("backgroundLocation")}
          />
          <SwitchRow
            checked={options.batteryExemption}
            label="Evitar suspension por bateria"
            onToggle={() => toggleOption("batteryExemption")}
          />
        </View>

        <TouchableOpacity 
          style={[localStyles.buttonPrimary, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={localStyles.buttonText}>Entrar al sistema</Text>
          )}
        </TouchableOpacity>
      </View>
    </AuthFrame>
  );
}

function SwitchRow({ label, checked, onToggle }) {
  return (
    <View style={localStyles.switchRow}>
      <Text style={localStyles.switchLabel}>{label}</Text>
      <TouchableOpacity
        onPress={onToggle}
        style={checked ? localStyles.switchOn : localStyles.switchOff}
      >
        <View style={checked ? localStyles.knobOn : localStyles.knobOff} />
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#c9d3e5",
    borderRadius: 14,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  buttonPrimary: {
    marginTop: 10,
    backgroundColor: "#08153a",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchGroup: {
    borderWidth: 1,
    borderColor: "#cad5e6",
    borderRadius: 18,
    backgroundColor: "#f8faff",
    padding: 12,
    gap: 10,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchLabel: {
    fontSize: 14,
    color: "#0f1f44",
  },
  switchOff: {
    width: 44,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#d3dcea",
    borderWidth: 1,
    borderColor: "#c1cee2",
    position: "relative",
  },
  switchOn: {
    width: 44,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#0a173d",
    borderWidth: 1,
    borderColor: "#091636",
    position: "relative",
  },
  knobOff: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 2,
    left: 2,
  },
  knobOn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ffffff",
    position: "absolute",
    top: 2,
    right: 2,
  },
});
