import { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from "react-native";
import AppShell, { appUi } from "../_components/app-shell";
import UserCard from "../_components/userCard";
import { API_ROUTES } from "../lib/api-routes";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";

function normalizeRole(role) {
  if (!role) return "Rol";
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
        setError("No hay sesion valida.");
        setLoading(false);
        return;
      }

      try {
        const supervisorUsers = await api.get(
          API_ROUTES.supervisorUsers.usersBySupervisor(auth.userId),
          { token: auth.token }
        );
        setUsers(Array.isArray(supervisorUsers) ? supervisorUsers : []);
      } catch (firstError) {
        try {
          const clients = await api.get(API_ROUTES.clients.list, { token: auth.token });
          const firstClientId = Array.isArray(clients) && clients.length > 0 ? clients[0].id_client : null;
          if (!firstClientId) {
            setError("No se encontraron usuarios.");
            return;
          }
          setClientId(String(firstClientId));
          const usersByClient = await api.get(API_ROUTES.userClients.usersByClient(firstClientId), {
            token: auth.token,
          });
          setUsers(Array.isArray(usersByClient) ? usersByClient : []);
        } catch (secondError) {
          setError("Error al cargar usuarios.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [auth.token, auth.userId]);

  const loadUsersByClient = async () => {
    if (!auth.token || !clientId) return;
    setLoading(true);
    try {
      const data = await api.get(API_ROUTES.userClients.usersByClient(clientId), { token: auth.token });
      setUsers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError("Error al buscar por cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    const performDelete = async () => {
      try {
        await api.delete(API_ROUTES.users.remove(id), { token: auth.token });
        setUsers((prev) => prev.filter((u) => u.id_user !== id));
      } catch (err) {
        Alert.alert("Error", "No se pudo eliminar.");
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm("¿Seguro que deseas eliminarlo?")) performDelete();
    } else {
      Alert.alert("Eliminar Usuario", "¿Seguro que deseas eliminarlo?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: performDelete, style: "destructive" }
      ]);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter((u) => 
      u?.nombre?.toLowerCase().includes(term) || 
      u?.correo?.toLowerCase().includes(term) || 
      u?.rol?.toLowerCase().includes(term)
    );
  }, [search, users]);

  return (
    <AppShell subtitle="Búsqueda y gestión de usuarios." title="Usuarios">
      <View style={[appUi.card, styles.topBar]}>
        <TextInput 
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.clientRow}>
          <TextInput 
            style={styles.clientInput}
            placeholder="ID Cliente"
            value={clientId}
            onChangeText={setClientId}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.loadBtn} onPress={loadUsersByClient}>
            <Text style={styles.loadBtnText}>Filtrar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.grid}>
        {loading && <ActivityIndicator color="#091636" />}
        {filteredUsers.map((item) => (
          <UserCard
            key={item?.id_user}
            id={item?.id_user}
            name={item?.nombre}
            role={normalizeRole(item?.rol)}
            status={item?.correo}
            onDelete={handleDeleteUser}
          />
        ))}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  topBar: { gap: 10 },
  searchInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  clientRow: { flexDirection: "row", gap: 10 },
  clientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
  },
  loadBtn: {
    backgroundColor: "#091636",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  loadBtnText: { color: "#fff", fontWeight: "bold" },
  grid: { gap: 10, paddingBottom: 20 },
  errorBox: {
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    marginBottom: 10,
  },
  errorText: { color: "#b91c1c", fontSize: 13 },
});

