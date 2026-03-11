export default function AlertCard({
  title = "Alerta",
  description = "Descripcion de alerta",
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.desc}>{description}</p>
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
    margin: "0 0 6px 0",
    color: "#0f1f44",
    fontSize: "16px",
  },
  desc: {
    margin: 0,
    color: "#4d5d80",
    fontSize: "13px",
    lineHeight: 1.45,
  },
};
