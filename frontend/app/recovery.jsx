import { useRouter } from "expo-router";
import AuthFrame, { authFormStyles } from "../_components/auth-frame";

export default function Recovery() {
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    router.push("/login");
  };

  return (
    <AuthFrame
      activeTab="recovery"
      subtitle="Recupera acceso de forma segura y vuelve al flujo de login."
      title={"-> Recuperacion"}
    >
      <form style={authFormStyles.form} onSubmit={handleSubmit}>
        <input
          style={authFormStyles.input}
          type="email"
          placeholder="Correo para recuperacion"
          required
        />
        <button style={authFormStyles.buttonPrimary} type="submit">
          Enviar enlace
        </button>
        <p style={authFormStyles.helperText}>
          Te enviaremos un enlace de recuperacion y volveras al login.
        </p>
      </form>
    </AuthFrame>
  );
}
