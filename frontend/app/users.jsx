import { useEffect, useMemo, useState } from "react";
import AppShell, { appUi } from "../_components/app-shell";
import UserCard from "../_components/userCard";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

function normalizeRole(role) {
  if (!role) {
    return "Rol";
  }

  return String(role).toUpperCase();
}

export default function Users() {
  const auth = getAuthContext();
  const [search, setSearch] = useState("");
  const [clientId, setClientId] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError("");

      if (!auth.token || !auth.userId) {
        setUsers([]);
        setError("No hay sesion valida para consultar usuarios.");
        setLoading(false);
        return;
      }

      try {
        const supervisorUsers = await api.get(
          API_ROUTES.supervisorUsers.usersBySupervisor(auth.userId),
          {
            token: auth.token,
          }
        );

        setUsers(Array.isArray(supervisorUsers) ? supervisorUsers : []);
      } catch (firstError) {
        try {
          const clients = await api.get(API_ROUTES.clients.list, { token: auth.token });
          const firstClientId = Array.isArray(clients) && clients.length > 0 ? clients[0].id_client : null;

          if (!firstClientId) {
            setUsers([]);
            setError(firstError?.message || "No se encontraron usuarios para tu sesion.");
            setLoading(false);
            return;
          }

          setClientId(String(firstClientId));

          const usersByClient = await api.get(API_ROUTES.userClients.usersByClient(firstClientId), {
            token: auth.token,
          });

          setUsers(Array.isArray(usersByClient) ? usersByClient : []);
        } catch (secondError) {
          setUsers([]);
          setError(secondError?.message || "No se pudieron cargar usuarios desde la API.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [auth.token, auth.userId]);

  const loadUsersByClient = async () => {
    if (!auth.token || !clientId) {
      setError("Indica un client ID para consultar usuarios por cliente.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await api.get(API_ROUTES.userClients.usersByClient(clientId), {
        token: auth.token,
      });

      setUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setUsers([]);
      setError(requestError?.message || "No se pudieron cargar usuarios por cliente.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((item) => {
      const byName = item?.nombre?.toLowerCase().includes(term);
      const byEmail = item?.correo?.toLowerCase().includes(term);
      const byRole = item?.rol?.toLowerCase().includes(term);
      return byName || byEmail || byRole;
    });
  }, [search, users]);

  return (
    <AppShell
      subtitle="Busqueda, alta y gestion de usuarios con permisos por rol."
      title="Usuarios y permisos"
    >
      <div style={{ ...appUi.card, ...styles.topBar }}>
        <input
          style={{ ...appUi.input, ...styles.searchInput }}
          type="text"
          placeholder="Buscar por nombre, correo o rol"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <input
          style={{ ...appUi.input, ...styles.clientInput }}
          type="number"
          placeholder="Client ID"
          value={clientId}
          onChange={(event) => setClientId(event.target.value)}
        />
        <button style={appUi.secondaryButton} type="button" onClick={loadUsersByClient}>
          Cargar por cliente
        </button>
      </div>

      {error ? <div style={{ ...appUi.card, ...styles.errorBox }}>{error}</div> : null}

      <div style={styles.grid}>
        {!loading && filteredUsers.length === 0 ? (
          <div style={{ ...appUi.card, ...styles.emptyBox }}>No hay usuarios para mostrar.</div>
        ) : null}

        {filteredUsers.map((item) => (
          <UserCard
            key={item?.id_user || item?.correo || item?.nombre}
            name={item?.nombre || "Usuario"}
            role={normalizeRole(item?.rol)}
            status={item?.correo || "Sin correo"}
          />
        ))}
      </div>

      <div style={appUi.card}>
        <h3 style={appUi.sectionTitle}>Permisos operativos</h3>
        <p style={{ ...appUi.sectionDescription, marginBottom: "10px" }}>
          Estas acciones dependen de tu rol y del endpoint consultado.
        </p>
        <div style={styles.permissionsGrid}>
          <div style={styles.permissionBox}>Administrador: CRUD completo</div>
          <div style={styles.permissionBox}>Supervisor: monitoreo y seguimiento</div>
          <div style={styles.permissionBox}>Cliente: lectura de su cuenta</div>
          <div style={styles.permissionBox}>Usuario: estado personal</div>
        </div>
      </div>
    </AppShell>
  );
}

const styles = {
  topBar: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    minWidth: "230px",
  },
  clientInput: {
    width: "140px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },
  permissionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "8px",
  },
  permissionBox: {
    border: "1px solid #d7deec",
    background: "#f2f6fd",
    borderRadius: "12px",
    padding: "10px",
    color: "#263d6b",
    fontSize: "13px",
    fontWeight: 600,
  },
  errorBox: {
    borderColor: "#ef9a9a",
    color: "#6e1f1f",
    background: "#fdecec",
  },
  emptyBox: {
    color: "#3c507f",
  },
};
