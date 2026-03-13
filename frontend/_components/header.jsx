export default function Header() {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>Panel de control</h1>
        <p style={styles.subtitle}>
          Monitoreo en tiempo real y gestión general
        </p>
      </div>

      <div style={styles.userBox}>
        <span>Administrador</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "24px",
  },
  subtitle: {
    margin: "4px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  userBox: {
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 600,
  },
};
