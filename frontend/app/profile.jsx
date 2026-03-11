import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
      setError("");

      if (!auth.token || !auth.userId) {
        setHasConsent(false);
        setLoadingConsent(false);
        setError("No hay sesion valida para consultar consentimiento.");
        return;
      }

      try {
        await api.get(API_ROUTES.consents.byUser(auth.userId), {
          token: auth.token,
        });

        setHasConsent(true);
      } catch (requestError) {
        if (requestError?.status === 404) {
          setHasConsent(false);
          setError("");
        } else {
          setHasConsent(false);
          setError(requestError?.message || "No se pudo consultar el consentimiento.");
        }
      } finally {
        setLoadingConsent(false);
      }
    };

    loadConsent();
  }, [auth.token, auth.userId]);

  const handleRecordConsent = async () => {
    if (!auth.token || !auth.userId) {
      setError("No hay sesion valida para registrar consentimiento.");
      return;
    }

    try {
      await api.post(
        API_ROUTES.consents.create,
        {
          id_user: auth.userId,
        },
        {
          token: auth.token,
        }
      );

      setHasConsent(true);
      setError("");
    } catch (requestError) {
      setError(requestError?.message || "No se pudo registrar el consentimiento.");
    }
  };

  const handleRevokeConsent = async () => {
    if (!auth.token) {
      setError("No hay sesion valida para revocar consentimiento.");
      return;
    }

    try {
      await api.post(API_ROUTES.consents.revoke, {}, { token: auth.token });
      setHasConsent(false);
      setError("");
    } catch (requestError) {
      setError(requestError?.message || "No se pudo revocar el consentimiento.");
    }
  };

  const handleLogout = async () => {
    try {
      if (auth.token) {
        await api.post(API_ROUTES.auth.logout, {}, { token: auth.token });
      }
    } catch {
      // Si falla logout en servidor, limpiamos sesion local de todas formas.
    } finally {
      clearAuthSession();
      router.push("/login");
    }
  };

  return (
    <AppShell
      subtitle="Datos personales, privacidad y seguridad por usuario."
      title="Perfil y privacidad"
    >
      <div style={styles.layout}>
        <div style={{ ...appUi.card, ...styles.formCard }}>
          <h3 style={appUi.sectionTitle}>Perfil de usuario</h3>
          <input
            style={appUi.input}
            type="text"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Nombre"
          />
          <input
            style={appUi.input}
            type="email"
            value={correo}
            onChange={(event) => setCorreo(event.target.value)}
            placeholder="Correo"
          />
          <input
            style={appUi.input}
            type="text"
            value={telefono}
            onChange={(event) => setTelefono(event.target.value)}
            placeholder="Telefono"
          />
          <button style={appUi.primaryButton} type="button" disabled>
            Guardar cambios
          </button>
        </div>

        <div style={{ ...appUi.card, ...styles.formCard }}>
          <h3 style={appUi.sectionTitle}>Consentimiento</h3>
          <label style={styles.checkRow}>
            <input checked={hasConsent} readOnly type="checkbox" />
            Acepto rastreo y tratamiento de ubicacion
          </label>
          <button style={appUi.primaryButton} type="button" onClick={handleRecordConsent}>
            Registrar consentimiento
          </button>
          <button style={appUi.secondaryButton} type="button" onClick={handleRevokeConsent}>
            Revocar consentimiento
          </button>
          <div style={styles.successBox}>
            {loadingConsent
              ? "Consultando estado de consentimiento..."
              : hasConsent
                ? "Consentimiento registrado correctamente."
                : "No hay consentimiento activo."}
          </div>
        </div>

        <div style={{ ...appUi.card, ...styles.formCard }}>
          <h3 style={appUi.sectionTitle}>Seguridad</h3>
          <div style={styles.securityItem}>Sesion actual: {auth.token ? "protegida" : "sin token"}</div>
          <div style={styles.securityItem}>Dispositivo autorizado: 1 activo</div>
          <div style={styles.securityItem}>Auditoria: habilitada</div>
          <button style={appUi.secondaryButton} type="button" onClick={handleLogout}>
            Cerrar sesion
          </button>
        </div>
      </div>

      {error ? <div style={{ ...appUi.card, ...styles.errorBox }}>{error}</div> : null}
    </AppShell>
  );
}

const styles = {
  layout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "10px",
  },
  formCard: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  checkRow: {
    border: "1px solid #d7deec",
    borderRadius: "12px",
    background: "#f6f9ff",
    padding: "10px",
    display: "flex",
    gap: "8px",
    alignItems: "center",
    color: "#314a77",
    fontSize: "13px",
  },
  successBox: {
    border: "1px solid #9de1b2",
    borderRadius: "12px",
    background: "#eaf9ef",
    color: "#1f6a39",
    padding: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  securityItem: {
    border: "1px solid #d7deec",
    borderRadius: "12px",
    background: "#f6f9ff",
    color: "#314a77",
    padding: "10px",
    fontSize: "13px",
  },
  errorBox: {
    borderColor: "#ef9a9a",
    color: "#6e1f1f",
    background: "#fdecec",
  },
};
