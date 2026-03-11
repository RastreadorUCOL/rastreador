export default function UserCard({
  name = "Usuario",
  role = "Rol",
  status = "Activo",
}) {
  return (
    <div style={styles.card}>
      <h3 style={styles.name}>{name}</h3>
      <p style={styles.text}>Rol: {role}</p>
      <p style={styles.text}>Estado: {status}</p>
      <div style={styles.actions}>
        <button style={styles.button}>Ver detalle</button>
        <button style={styles.buttonSecondary}>Editar</button>
      </div>
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
  name: {
    margin: "0 0 8px 0",
    color: "#0f1f44",
    fontSize: "16px",
  },
  text: {
    margin: "4px 0",
    color: "#4d5d80",
    fontSize: "13px",
  },
  actions: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  button: {
    border: "none",
    borderRadius: "10px",
    padding: "8px 12px",
    background: "#091636",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
  },
  buttonSecondary: {
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
