import { useEffect, useState } from "react";
import { Link, usePathname } from "expo-router";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/users", label: "Usuarios" },
  { href: "/geofences", label: "Geocercas" },
  { href: "/reports", label: "Reportes" },
  { href: "/alerts", label: "Alertas" },
  { href: "/profile", label: "Perfil" },
  { href: "/mobileView", label: "Vista movil" },
];

export default function AppShell({ title, subtitle, children }) {
  const pathname = usePathname();
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => setViewportWidth(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isTablet = viewportWidth < 1120;
  const isMobile = viewportWidth < 760;

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.frame,
          gridTemplateColumns: isTablet ? "1fr" : styles.frame.gridTemplateColumns,
        }}
      >
        <aside style={styles.sidebar}>
          <div style={styles.brandBlock}>
            <div style={styles.brandBadge}>RT</div>
            <div>
              <h2 style={styles.brandTitle}>Rastreador</h2>
              <p style={styles.brandSubtitle}>Control en tiempo real</p>
            </div>
          </div>

          <nav
            style={{
              ...styles.nav,
              gridTemplateColumns: isTablet ? "repeat(2, minmax(0, 1fr))" : "1fr",
              overflowX: isMobile ? "auto" : "visible",
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : null),
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div style={styles.rulesBox}>
            <p style={styles.rulesTitle}>Reglas de acceso</p>
            <p style={styles.rulesText}>Administrador: control total.</p>
            <p style={styles.rulesText}>Supervisor: vista operativa.</p>
            <p style={styles.rulesText}>Cliente: datos de su cuenta.</p>
            <p style={styles.rulesText}>Usuario: estado propio.</p>
          </div>
        </aside>

        <main style={styles.mainPanel}>
          <header
            style={{
              ...styles.header,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
            }}
          >
            <div>
              <h1 style={styles.headerTitle}>{title}</h1>
              <p style={styles.headerSubtitle}>{subtitle}</p>
            </div>
            <div style={styles.sessionBadge}>Sesion: Administrador</div>
          </header>
          <section style={styles.content}>{children}</section>
        </main>
      </div>
    </div>
  );
}

export const appUi = {
  card: {
    background: "#ffffff",
    border: "1px solid #d7deec",
    borderRadius: "20px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
    padding: "16px",
  },
  sectionTitle: {
    margin: "0 0 6px 0",
    color: "#0f1f44",
    fontSize: "18px",
  },
  sectionDescription: {
    margin: 0,
    color: "#5c6d8f",
    fontSize: "13px",
  },
  primaryButton: {
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    background: "#091636",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "13px",
    cursor: "pointer",
  },
  secondaryButton: {
    border: "1px solid #c6d0e3",
    borderRadius: "12px",
    padding: "10px 14px",
    background: "#ffffff",
    color: "#0f1f44",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
  },
  input: {
    border: "1px solid #c7d1e4",
    borderRadius: "12px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#0f172a",
    background: "#ffffff",
    outline: "none",
  },
};

const styles = {
  wrapper: {
    height: "100vh",
    minHeight: "100vh",
    width: "100%",
    background:
      "radial-gradient(circle at top, #eef2f9 0%, #d9e0eb 50%, #ccd4e2 100%)",
    padding: "8px",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, system-ui, sans-serif",
  },
  frame: {
    height: "100%",
    maxWidth: "1840px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    gap: "12px",
  },
  sidebar: {
    background: "#f7f9fc",
    border: "1px solid #d3dbe8",
    borderRadius: "28px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.1)",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minHeight: 0,
    overflowY: "auto",
  },
  brandBlock: {
    background: "#091636",
    borderRadius: "20px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#ffffff",
  },
  brandBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    border: "1px solid #2e4477",
    background: "#122654",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
  },
  brandTitle: {
    margin: 0,
    fontSize: "18px",
  },
  brandSubtitle: {
    margin: "2px 0 0 0",
    color: "#d2ddfb",
    fontSize: "12px",
  },
  nav: {
    display: "grid",
    gap: "6px",
  },
  navLink: {
    textDecoration: "none",
    borderRadius: "12px",
    padding: "10px 12px",
    fontWeight: 600,
    fontSize: "14px",
    color: "#132754",
    border: "1px solid transparent",
  },
  navLinkActive: {
    background: "#091636",
    color: "#ffffff",
    border: "1px solid #1b356f",
  },
  rulesBox: {
    marginTop: "auto",
    borderRadius: "18px",
    border: "1px dashed #b8c5dd",
    background: "#edf2fb",
    padding: "12px",
    color: "#34476f",
  },
  rulesTitle: {
    margin: 0,
    fontWeight: 700,
    fontSize: "13px",
    color: "#1a2f5f",
  },
  rulesText: {
    margin: "6px 0 0 0",
    fontSize: "12px",
  },
  mainPanel: {
    background: "#f7f9fc",
    border: "1px solid #d3dbe8",
    borderRadius: "28px",
    boxShadow: "0 10px 24px rgba(15, 23, 42, 0.1)",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    borderBottom: "1px solid #d7deec",
    padding: "16px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  headerTitle: {
    margin: 0,
    color: "#0f1f44",
    fontSize: "26px",
  },
  headerSubtitle: {
    margin: "4px 0 0 0",
    color: "#5c6d8f",
    fontSize: "14px",
  },
  sessionBadge: {
    border: "1px solid #c7d1e4",
    borderRadius: "999px",
    background: "#edf2fb",
    color: "#1a2f5f",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: "14px",
    display: "grid",
    gap: "12px",
    scrollbarWidth: "thin",
  },
};
