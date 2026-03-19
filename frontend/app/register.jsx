import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, ScrollView } from "react-native";
import AuthFrame from "../_components/auth-frame";
import { API_ROUTES } from "../lib/api-routes";
import { api } from "../lib/fetch";

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    let newErrors = {};
    
    if (!nombre.trim()) newErrors.nombre = "Este campo es obligatorio";
    if (!telefono.trim()) newErrors.telefono = "Este campo es obligatorio";

    if (!correo.trim()) {
      newErrors.correo = "Este campo es obligatorio";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        newErrors.correo = "Ingresa un correo electrónico válido";
      }
    }

    if (!password) {
      newErrors.password = "Este campo es obligatorio";
    } else {
      const specialCharRegex = /[!@#$%^&*]/;
      if (password.length < 10 || !specialCharRegex.test(password)) {
        newErrors.password = "La contraseña debe tener mínimo 10 caracteres e incluir un carácter especial";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await api.post(API_ROUTES.auth.register, {
        nombre,
        correo,
        telefono,
        password,
        rol: "USER", // Enviado por defecto según el ENUM de la base de datos
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

  const getInputStyle = (fieldName) => [
    localStyles.input,
    focusedInput === fieldName && localStyles.inputFocused,
    errors[fieldName] && localStyles.inputError,
    isSubmitting && localStyles.inputDisabled
  ];

  return (
    <AuthFrame
      activeTab="register"
      subtitle="Demo visual de registro previo a la entrada del sistema."
      title={"Registro"}
    >
      <ScrollView contentContainerStyle={localStyles.form} showsVerticalScrollIndicator={false}>
        <View style={localStyles.inputContainer}>
          <Text style={localStyles.label}>Nombre completo *</Text>
          <TextInput
            style={getInputStyle("nombre")}
            value={nombre}
            onChangeText={(val) => {
              setNombre(val);
              if (errors.nombre) setErrors({ ...errors, nombre: null });
            }}
            onFocus={() => setFocusedInput("nombre")}
            onBlur={() => setFocusedInput(null)}
            editable={!isSubmitting}
          />
          {errors.nombre && <Text style={localStyles.errorText}>{errors.nombre}</Text>}
        </View>

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
          <Text style={localStyles.label}>Teléfono *</Text>
          <TextInput
            style={getInputStyle("telefono")}
            value={telefono}
            onChangeText={(val) => {
              setTelefono(val);
              if (errors.telefono) setErrors({ ...errors, telefono: null });
            }}
            onFocus={() => setFocusedInput("telefono")}
            onBlur={() => setFocusedInput(null)}
            keyboardType="phone-pad"
            editable={!isSubmitting}
          />
          {errors.telefono && <Text style={localStyles.errorText}>{errors.telefono}</Text>}
        </View>

        <View style={localStyles.inputContainer}>
          <Text style={localStyles.label}>Contraseña *</Text>
          <TextInput
            style={getInputStyle("password")}
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry
            editable={!isSubmitting}
          />
          {errors.password && <Text style={localStyles.errorText}>{errors.password}</Text>}
        </View>

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
          Al registrarte serás redirigido al login para iniciar sesión.
        </Text>
      </ScrollView>
    </AuthFrame>
  );
}

const localStyles = StyleSheet.create({
  form: {
    paddingBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
  errorText: {
    color: "#e11d48",
    fontSize: 12,
    marginTop: 4,
  },
  buttonPrimary: {
    marginTop: 4,
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
    marginTop: 10,
  },
});
