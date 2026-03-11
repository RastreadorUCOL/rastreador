import { useRouter } from "expo-router";
import { useState } from "react";
import AuthFrame, { authFormStyles } from "../_components/auth-frame";
import { API_ROUTES } from "../lib/api-routes";
import { api } from "../lib/fetch";

const ROLE_OPTIONS = ["ADMIN", "SUPERVISOR", "CLIENT", "USER"];

export default function Register() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [identificadorInterno, setIdentificadorInterno] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("USER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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

      alert("Usuario registrado exitosamente");
      router.push("/login");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo completar el registro";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFrame
      activeTab="register"
      subtitle="Demo visual de registro previo a la entrada del sistema."
      title={"-> Registro"}
    >
      <form style={authFormStyles.form} onSubmit={handleSubmit}>
        <input
          style={authFormStyles.input}
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          style={authFormStyles.input}
          type="email"
          placeholder="Correo electronico"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />
        <input
          style={authFormStyles.input}
          type="text"
          placeholder="Telefono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <input
          style={authFormStyles.input}
          type="text"
          placeholder="Identificador interno (opcional)"
          value={identificadorInterno}
          onChange={(e) => setIdentificadorInterno(e.target.value)}
        />
        <select
          style={authFormStyles.input}
          value={rol}
          onChange={(e) => setRol(e.target.value)}
          required
        >
          {ROLE_OPTIONS.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleOption}
            </option>
          ))}
        </select>
        <input
          style={authFormStyles.input}
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button style={authFormStyles.buttonPrimary} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
        <p style={authFormStyles.helperText}>
          Al registrarte seras redirigido al login para iniciar sesion.
        </p>
      </form>
    </AuthFrame>
  );
}
