export default function MapView() {
  return (
    <div style={styles.map}>
      <div style={styles.label}>Mapa interactivo</div>
      <div style={{ ...styles.pin, top: "35%", left: "30%" }}>A</div>
      <div style={{ ...styles.pin, top: "55%", left: "60%", background: "#f97316" }}>B</div>
      <div style={styles.legend}>Estados: Activo, ultima ubicacion y reconexion.</div>
    </div>
  );
}

const styles = {
  map: {
    position: "relative",
    width: "100%",
    minHeight: "320px",
    background: "linear-gradient(140deg, #f0f5ff, #e8eef8)",
    border: "1px solid #d1daeb",
    borderRadius: "20px",
    overflow: "hidden",
  },
  label: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "#ffffff",
    padding: "7px 10px",
    borderRadius: "10px",
    fontWeight: 700,
    fontSize: "12px",
    border: "1px solid #d7deec",
    color: "#0f1f44",
  },
  pin: {
    position: "absolute",
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    background: "#16a34a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.25)",
  },
  legend: {
    position: "absolute",
    right: 12,
    bottom: 12,
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid #d7deec",
    borderRadius: "10px",
    padding: "7px 9px",
    fontSize: "12px",
    color: "#4d5d80",
  },
};
