import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function UserCard({
  id,
  name = "Usuario",
  role = "Rol",
  status = "Activo",
  onDelete,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.text}>Rol: {role}</Text>
      <Text style={styles.text}>Estado: {status}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonSecondaryText}>Editar</Text>
        </TouchableOpacity>
        {onDelete && (
          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => onDelete(id)}
          >
            <Text style={[styles.buttonSecondaryText, { color: "#e11d48" }]}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7deec",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 8,
  },
  name: {
    color: "#0f1f44",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    color: "#4d5d80",
    fontSize: 13,
    marginVertical: 2,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  button: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#091636",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#c7d1e4",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
  },
  buttonSecondaryText: {
    color: "#132754",
    fontWeight: "600",
    fontSize: 12,
  },
});

