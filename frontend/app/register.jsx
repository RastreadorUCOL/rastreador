import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView } from "react-native";
import AuthFrame from "../_components/auth-frame";
import { API_ROUTES } from "../lib/api-routes";
import { api } from "../lib/fetch";

const ROLE_OPTIONS = ["Administrador", "Supervisor", "Cliente", "Usuario"];

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [identificadorInterno, setIdentificadorInterno] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("Usuario");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nombre || !correo || !password) {
      const msg = "Por favor completa los campos obligatorios";
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("Error", msg);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(API_ROUTES.auth.register, {
        nombre,
        correo,
        telefono,
        identificador_interno: identificadorInterno || null,
        password,
        rol,
      });

      const successMsg = "Usuario registrado exitosamente";
      if (Platform.OS === 'web') alert(successMsg);
      else Alert.alert("Éxito", successMsg);
      
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar el registro";
      if (Platform.OS === 'web') alert(message);
      else Alert.alert("Error de registro", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      activeTab="register"
      subtitle="Demo visual de registro previo a la entrada del sistema."
      title={"Registro"}
    >
      <ScrollView contentContainerStyle={localStyles.form} showsVerticalScrollIndicator={false}>
        <TextInput
          style={localStyles.input}
          placeholder="Nombre completo *"
          value={nombre}
          onChangeText={setNombre}
        />
        <TextInput
          style={localStyles.input}
          placeholder="Correo electronico *"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={localStyles.input}
          placeholder="Telefono"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />
        <TextInput
          style={localStyles.input}
          placeholder="Identificador interno (opcional)"
          value={identificadorInterno}
          onChangeText={setIdentificadorInterno}
        />
        
        <View style={localStyles.roleSelector}>
          <Text style={localStyles.label}>Selecciona tu rol:</Text>
          <View style={localStyles.roleGrid}>
            {ROLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setRol(option)}
                style={[
                  localStyles.roleButton,
                  rol === option && localStyles.roleButtonActive
                ]}
              >
                <Text style={[
                  localStyles.roleButtonText,
                  rol === option && localStyles.roleButtonTextActive
                ]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          style={localStyles.input}
          placeholder="Contrasena *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[localStyles.buttonPrimary, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={localStyles.buttonText}>Crear cuenta</Text>
          )}
        </TouchableOpacity>
        
        <Text style={localStyles.helperText}>
          Al registrarte seras redirigido al login para iniciar sesion.
        </Text>
      </ScrollView>
    </AuthFrame>
  );
}

const localStyles = StyleSheet.create({
  form: {
    gap: 12,
    paddingBottom: 20,
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
  label: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
    fontWeight: "600",
  },
  roleSelector: {
    marginTop: 5,
  },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c9d3e5",
    backgroundColor: "#fff",
  },
  roleButtonActive: {
    backgroundColor: "#08153a",
    borderColor: "#08153a",
  },
  roleButtonText: {
    fontSize: 12,
    color: "#4b5563",
  },
  roleButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
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
