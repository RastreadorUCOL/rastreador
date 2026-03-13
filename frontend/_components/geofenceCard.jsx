import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function GeofenceCard({
  name = "Geocerca",
  type = "Poligono",
  event = "Sin eventos",
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.text}>Tipo: {type}</Text>
      <Text style={styles.text}>Evento: {event}</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Historial</Text>
      </TouchableOpacity>
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
  title: {
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
  button: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#c7d1e4",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#132754",
    fontWeight: "600",
    fontSize: 12,
  },
});

