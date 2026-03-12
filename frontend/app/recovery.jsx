import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from "react-native";
import AuthFrame from "../_components/auth-frame";
import { useState } from "react";

export default function Recovery() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");

  const handleSubmit = () => {
    if (!correo) {
      const msg = "Por favor ingresa tu correo";
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("Campo requerido", msg);
      return;
    }

    const successMsg = "Enlace de recuperación enviado (Demo)";
    if (Platform.OS === 'web') alert(successMsg);
    else Alert.alert("Enviado", successMsg);
    
    router.push("/login");
  };

  return (
    <AuthFrame
      activeTab="recovery"
      subtitle="Recupera acceso de forma segura y vuelve al flujo de login."
      title={"Recuperacion"}
    >
      <View style={localStyles.form}>
        <TextInput
          style={localStyles.input}
          placeholder="Correo para recuperacion"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TouchableOpacity style={localStyles.buttonPrimary} onPress={handleSubmit}>
          <Text style={localStyles.buttonText}>Enviar enlace</Text>
        </TouchableOpacity>
        
        <Text style={localStyles.helperText}>
          Te enviaremos un enlace de recuperacion y volveras al login.
        </Text>
      </View>
    </AuthFrame>
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
  helperText: {
    textAlign: "center",
    fontSize: 12,
    color: "#5a6a8d",
    marginTop: 5,
  },
});
