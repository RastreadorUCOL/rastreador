import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthFrame from "../_components/auth-frame";
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
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  const validate = () => {
    let newErrors = {};

    if (!correo.trim()) {
      newErrors.correo = "Este campo es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(correo)) {
        newErrors.correo = "Ingresa un correo electrónico válido (ej. usuario@ucol.mx)";
      }
    }

    if (!password) {
      newErrors.password = "Este campo es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = await api.post(API_ROUTES.auth.login, {
        correo: correo.trim(),
        password: password.trim(),
      });

      if (!data?.token) {
        throw new Error("El backend no devolvió token de sesión.");
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
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
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

  const getInputStyle = (fieldName) => [
    localStyles.input,
    focusedInput === fieldName && localStyles.inputFocused,
    errors[fieldName] && localStyles.inputError,
    isSubmitting && localStyles.inputDisabled
  ];

  return (
    <AuthFrame activeTab="login" title={"Iniciar sesión"}>
      <View style={localStyles.form}>
        
        <View style={localStyles.inputContainer}>
          <Text style={localStyles.label}>Correo electrónico *</Text>
          <TextInput
            style={getInputStyle("correo")}
            value={correo}
            onChangeText={(val) => {
              setCorreo(val);
              if (errors.correo) setErrors({ ...errors, correo: null });
            }}
            onFocus={() => setFocusedInput("correo")}
            onBlur={() => setFocusedInput(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {errors.correo && <Text style={localStyles.errorText}>{errors.correo}</Text>}
        </View>

        <View style={localStyles.inputContainer}>
          <Text style={localStyles.label}>Contraseña *</Text>
          <View style={localStyles.passwordContainer}>
            <TextInput
              style={[getInputStyle("password"), localStyles.passwordInput]}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={!showPassword}
              editable={!isSubmitting}
            />
            <TouchableOpacity 
              style={localStyles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#5a6a8d" 
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={localStyles.errorText}>{errors.password}</Text>}
        </View>

        <View style={localStyles.switchGroup}>
          <SwitchRow
            checked={options.trackingConsent}
            label="Consentimiento de rastreo"
            onToggle={() => toggleOption("trackingConsent")}
          />
          <SwitchRow
            checked={options.backgroundLocation}
            label="Ubicación en segundo plano"
            onToggle={() => toggleOption("backgroundLocation")}
          />
          <SwitchRow
            checked={options.batteryExemption}
            label="Evitar suspensión por batería"
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
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 6,
    fontWeight: "600",
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
  inputFocused: {
    borderColor: "#08153a",
  },
  inputError: {
    borderColor: "#e11d48",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    opacity: 0.7,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 45, // Espacio para el ojo
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    color: "#e11d48",
    fontSize: 12,
    marginTop: 4,
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
    marginTop: 8,
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
