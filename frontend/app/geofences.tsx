import { useCallback, useEffect, useState } from "react";
import GeofenceCard from "../_components/geofenceCard";
import AppShell, { appUi } from "../_components/app-shell";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthToken } from "../lib/auth-session";
import { api } from "../lib/fetch";

type Geofence = {
  id_geofence?: number;
  nombre?: string;
  tipo?: string;
};

function mapTypeLabel(tipo?: string) {
  if (tipo === "CIRCLE") {
    return "Circulo";
  }

  if (tipo === "POLYGON") {
    return "Poligono";
  }

  return "Sin definir";
}

export default function Geofences() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = getAuthToken();

  const loadGeofences = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!token) {
      setGeofences([]);
      setError("No hay token de sesion. Inicia sesion para consultar geocercas.");
      setLoading(false);
      return;
    }

    try {
      const data = await api.get(API_ROUTES.geofences.list, { token });
      setGeofences(Array.isArray(data) ? data : []);
    } catch (requestError: any) {
      setGeofences([]);
      setError(requestError?.message || "No se pudieron cargar las geocercas.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadGeofences();
  }, [loadGeofences]);

  const handleCreateGeofence = async () => {
    if (!token) {
      alert("Necesitas una sesion valida para crear geocercas.");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const nombre = window.prompt("Nombre de la geocerca:", "Nueva geocerca");
    if (!nombre) {
      return;
    }

    try {
      await api.post(
        API_ROUTES.geofences.create,
        {
          nombre,
          tipo: "CIRCLE",
          coordenadas: { lat: 19.4326, lng: -99.1332 },
          radio: 100,
        },
        { token }
      );

      await loadGeofences();
    } catch (requestError: any) {
      alert(requestError?.message || "No se pudo crear la geocerca.");
    }
  };

  return (
    <AppShell
      subtitle="Creacion de zonas por poligono o circulo y control de entrada/salida."
      title="Geocercas"
    >
      <div style={{ ...appUi.card, ...styles.topBar }}>
        <button style={appUi.primaryButton} type="button" onClick={handleCreateGeofence}>
          Crear geocerca
        </button>
        <button style={appUi.secondaryButton} type="button" onClick={loadGeofences}>
          Actualizar lista
        </button>
      </div>

      {error ? <div style={{ ...appUi.card, ...styles.errorBox }}>{error}</div> : null}

      <div style={styles.mapMock}>
        <div style={styles.circle} />
        <div style={styles.polygon} />
        <div style={styles.mapTag}>Motor de deteccion en tiempo real</div>
      </div>

      <div style={styles.grid}>
        {!loading && geofences.length === 0 ? (
          <div style={{ ...appUi.card, ...styles.emptyBox }}>
            No hay geocercas registradas para mostrar.
          </div>
        ) : null}

        {geofences.map((item) => (
          <GeofenceCard
            key={item.id_geofence || item.nombre || "geofence"}
            name={item.nombre || "Geocerca"}
            type={mapTypeLabel(item.tipo)}
            event="Sin eventos"
          />
        ))}
      </div>
    </AppShell>
  );
}

const styles = {
  topBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  mapMock: {
    ...appUi.card,
    minHeight: "280px",
    position: "relative",
    background: "linear-gradient(140deg, #f2f7ff, #eaf0fa)",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    left: "12%",
    top: "20%",
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    border: "4px solid rgba(14, 165, 233, 0.6)",
    background: "rgba(125, 211, 252, 0.25)",
  },
  polygon: {
    position: "absolute",
    right: "12%",
    top: "18%",
    width: "180px",
    height: "140px",
    border: "4px solid rgba(168, 85, 247, 0.6)",
    background: "rgba(216, 180, 254, 0.25)",
    clipPath: "polygon(10% 10%, 90% 20%, 85% 85%, 25% 95%, 5% 55%)",
  },
  mapTag: {
    position: "absolute",
    left: "14px",
    bottom: "14px",
    border: "1px solid #d7deec",
    borderRadius: "12px",
    background: "#ffffff",
    color: "#3b4f79",
    fontSize: "12px",
    padding: "8px 10px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "10px",
  },
  errorBox: {
    borderColor: "#ef9a9a",
    color: "#6e1f1f",
    background: "#fdecec",
  },
  emptyBox: {
    color: "#3c507f",
  },
} as const;
