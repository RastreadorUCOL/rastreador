import { useRouter } from "expo-router";
import { useState } from "react";
import AuthFrame, { authFormStyles } from "../_components/auth-frame";
import { API_ROUTES } from "../lib/api-routes";
import { setAuthSession } from "../lib/auth-session";
import { api } from "../lib/fetch";

const ROLES = ["Administrador", "Supervisor", "Cliente", "Usuario"];

const DEFAULT_OPTIONS = {
  trackingConsent: true,
  backgroundLocation: true,
  batteryExemption: true,
};

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("Administrador");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const data = await api.post(API_ROUTES.auth.login, {
        correo,
        password,
      });

      if (!data?.token) {
        throw new Error("El backend no devolvio token de sesion.");
      }

      setAuthSession(data.token, data.user || null);
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesion";
      alert(message);
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
    <AuthFrame
      activeTab="login"
      title={"Iniciar sesion"}
    >
      <form style={authFormStyles.form} onSubmit={handleSubmit}>
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
          type="password"
          placeholder="Contrasena"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={styles.switchGroup}>
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
        </div>

        <button style={authFormStyles.buttonPrimary} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Entrar al sistema"}
        </button>
      </form>
    </AuthFrame>
  );
}

function SwitchRow({ label, checked, onToggle }) {
  return (
    <label style={styles.switchRow}>
      <span>{label}</span>
      <button
        aria-label={label}
        aria-pressed={checked}
        onClick={onToggle}
        style={checked ? styles.switchOn : styles.switchOff}
        type="button"
      >
        <span style={checked ? styles.knobOn : styles.knobOff} />
      </button>
    </label>
  );
}

const styles = {
  rolesBlock: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "10px",
    alignItems: "stretch",
  },
  rolesColumn: {
    display: "flex",
    flexDirection: "column",
  },
  blockTitle: {
    margin: "0 0 6px",
    color: "#0f1f44",
    fontSize: "clamp(16px, 1.6vw, 20px)",
  },
  rolesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
  },
  roleButton: {
    border: "1px solid #c7d0e1",
    borderRadius: "999px",
    padding: "8px 8px",
    fontSize: "13px",
    color: "#0f1f44",
    background: "#ffffff",
    cursor: "pointer",
  },
  activeRoleButton: {
    border: "1px solid #040f2f",
    borderRadius: "999px",
    padding: "8px 8px",
    fontSize: "13px",
    color: "#ffffff",
    background: "#08153a",
    cursor: "pointer",
  },
  policyCard: {
    border: "1px solid #c7d0e1",
    borderRadius: "18px",
    background: "#eff4fb",
    padding: "10px 12px",
  },
  policyTitle: {
    margin: "0 0 6px 0",
    color: "#0f1f44",
    fontSize: "clamp(15px, 1.35vw, 18px)",
  },
  policyList: {
    margin: 0,
    paddingLeft: "16px",
    display: "grid",
    gap: "3px",
    color: "#23365f",
    fontSize: "13px",
  },
  switchGroup: {
    border: "1px solid #cad5e6",
    borderRadius: "18px",
    background: "#f8faff",
    padding: "8px 10px",
    display: "grid",
    gap: "4px",
  },
  switchRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
    color: "#0f1f44",
  },
  switchOff: {
    width: "44px",
    height: "24px",
    border: "1px solid #c1cee2",
    borderRadius: "999px",
    background: "#d3dcea",
    position: "relative",
    padding: 0,
    cursor: "pointer",
  },
  switchOn: {
    width: "44px",
    height: "24px",
    border: "1px solid #091636",
    borderRadius: "999px",
    background: "#0a173d",
    position: "relative",
    padding: 0,
    cursor: "pointer",
  },
  knobOff: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#ffffff",
    position: "absolute",
    top: "2px",
    left: "2px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.35)",
  },
  knobOn: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#ffffff",
    position: "absolute",
    top: "2px",
    right: "2px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.35)",
  },
};
