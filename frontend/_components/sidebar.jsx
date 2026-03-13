import { Link, usePathname } from "expo-router";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/geofences", label: "Geocercas" },
  { href: "/reports", label: "Reportes" },
  { href: "/alerts", label: "Alertas" },
  { href: "/profile", label: "Perfil" },
  { href: "/mobileView", label: "Vista móvil" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoBox}>
        <h2 style={{ margin: 0 }}>Rastreador</h2>
        <p style={styles.sub}>Sistema de monitoreo</p>
      </div>

      <nav style={styles.nav}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              ...styles.link,
              background: pathname === link.href ? "#111827" : "transparent",
              color: pathname === link.href ? "#fff" : "#111827",
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    padding: "20px",
  },
  logoBox: {
    marginBottom: "24px",
  },
  sub: {
    margin: "6px 0 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  link: {
    textDecoration: "none",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 600,
  },
};
