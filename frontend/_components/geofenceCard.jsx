export default function GeofenceCard({
  name = "Geocerca",
  type = "Poligono",
  event = "Sin eventos",
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{name}</h3>
      <p style={styles.text}>Tipo: {type}</p>
      <p style={styles.text}>Evento: {event}</p>
      <button style={styles.button}>Ver historial</button>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #d7deec",
    borderRadius: "18px",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)",
    padding: "14px",
  },
  title: {
    margin: "0 0 8px 0",
    color: "#0f1f44",
    fontSize: "16px",
  },
  text: {
    margin: "4px 0",
    color: "#4d5d80",
    fontSize: "13px",
  },
  button: {
    marginTop: "10px",
    border: "1px solid #c7d1e4",
    borderRadius: "10px",
    padding: "8px 12px",
    background: "#ffffff",
    color: "#132754",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  },
};
