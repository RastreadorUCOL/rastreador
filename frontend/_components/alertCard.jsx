import { View, Text, StyleSheet } from 'react-native';

export default function AlertCard({
  title = "Alerta",
  description = "Descripcion de alerta",
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
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
    marginBottom: 4,
  },
  desc: {
    color: "#4d5d80",
    fontSize: 13,
    lineHeight: 18,
  },
});

