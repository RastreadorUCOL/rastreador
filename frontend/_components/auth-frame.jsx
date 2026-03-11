import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

const AUTH_TABS = [
  { key: "login", label: "Login", path: "/login" },
  { key: "register", label: "Registro", path: "/register" },
  { key: "recovery", label: "Recuperacion", path: "/recovery" },
];

export default function AuthFrame({ activeTab, title, subtitle, children }) {
  const router = useRouter();
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth
  );
  const [viewportHeight, setViewportHeight] = useState(
    typeof window === "undefined" ? 820 : window.innerHeight
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isTablet = viewportWidth < 1120;
  const isMobile = viewportWidth < 760;
  const isShortHeight = viewportHeight < 980;
  const isFullHD = viewportWidth >= 1800 && viewportHeight >= 900;
  const featureGridColumns =
    viewportWidth < 640
      ? "1fr"
      : viewportWidth < 900
        ? "repeat(2, minmax(0, 1fr))"
        : "repeat(3, minmax(0, 1fr))";

  const heroTitleStyle = {
    ...styles.heroTitle,
    maxWidth: isFullHD ? "760px" : styles.heroTitle.maxWidth,
    fontSize: isFullHD ? "clamp(40px, 3.25vw, 60px)" : styles.heroTitle.fontSize,
  };

  const heroTextStyle = {
    ...styles.heroText,
    maxWidth: isFullHD ? "760px" : styles.heroText.maxWidth,
    fontSize: isFullHD
      ? "clamp(17px, 1.25vw, 21px)"
      : styles.heroText.fontSize,
  };

  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.page,
          maxWidth: isFullHD ? "1840px" : styles.page.maxWidth,
          gridTemplateColumns: isTablet ? "1fr" : isFullHD ? "1.02fr 1fr" : "1fr 1fr",
          height: isTablet ? "auto" : "100%",
        }}
      >
        <section
          style={{
            ...styles.heroPanel,
            minHeight: isTablet ? "auto" : isShortHeight ? "560px" : "620px",
            height: isTablet ? "auto" : "100%",
            overflowY: isTablet ? "visible" : "auto",
            padding: isMobile
              ? "24px 20px"
              : isShortHeight
                ? "26px 26px"
                : isFullHD
                  ? "30px 32px"
                  : styles.heroPanel.padding,
          }}
        >
          <h1 style={heroTitleStyle}>Sistema rastreador UCOL</h1>
          <p style={heroTextStyle}>
            Pantalla independiente para inicio de sesion, registro, recuperacion
            de contrasena y aceptacion de permisos antes de entrar a la
            plataforma.
          </p>

          <div
            style={{
              ...styles.featureGrid,
              gridTemplateColumns: featureGridColumns,
              marginTop: isTablet ? "20px" : "26px",
            }}
          >
          </div>
        </section>

        <section
          style={{
            ...styles.formPanel,
            minHeight: isTablet ? "auto" : isShortHeight ? "560px" : "620px",
            height: isTablet ? "auto" : "100%",
            padding: isMobile
              ? "22px 16px 18px"
              : isShortHeight
                ? "20px 16px 14px"
                : isFullHD
                  ? "22px 20px 16px"
                  : styles.formPanel.padding,
            maxHeight: isTablet ? "none" : "100%",
            overflowY: isTablet ? "visible" : "auto",
          }}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>{title}</h2>
            <p style={styles.formSubtitle}>{subtitle}</p>
          </div>

          <div style={styles.tabs}>
            {AUTH_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => router.push(tab.path)}
                style={tab.key === activeTab ? styles.activeTab : styles.tab}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={styles.contentArea}>{children}</div>
        </section>
      </div>
    </div>
  );
}

export const authFormStyles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "9px",
  },
  input: {
    border: "1px solid #c9d3e5",
    borderRadius: "14px",
    padding: "10px 12px",
    fontSize: "14px",
    background: "#ffffff",
    color: "#111827",
    outline: "none",
  },
  buttonPrimary: {
    marginTop: "2px",
    border: "none",
    borderRadius: "14px",
    padding: "11px 10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#08153a",
    cursor: "pointer",
  },
  helperText: {
    fontSize: "12px",
    color: "#5a6a8d",
    margin: "2px 2px 0",
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
    overflow: "hidden",
    fontFamily: "Segoe UI, system-ui, sans-serif",
    boxSizing: "border-box",
  },
  page: {
    width: "100%",
    maxWidth: "1240px",
    margin: "0 auto",
    display: "grid",
    gap: "12px",
  },
  heroPanel: {
    background: "#091636",
    borderRadius: "30px",
    border: "1px solid #0e2559",
    boxShadow: "0 20px 40px rgba(4, 14, 38, 0.35)",
    color: "#ffffff",
    padding: "30px 30px",
    display: "flex",
    flexDirection: "column",
    minHeight: "620px",
  },
  badge: {
    alignSelf: "flex-start",
    background: "#182950",
    border: "1px solid #2b4174",
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "20px",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(34px, 3.7vw, 52px)",
    lineHeight: 1.06,
    letterSpacing: "-0.03em",
    maxWidth: "620px",
  },
  heroText: {
    marginTop: "16px",
    maxWidth: "640px",
    color: "#d7e2ff",
    fontSize: "clamp(16px, 1.65vw, 20px)",
    lineHeight: 1.36,
  },
  featureGrid: {
    marginTop: "26px",
    display: "grid",
    gap: "10px",
  },
  featureCard: {
    background: "rgba(255, 255, 255, 0.07)",
    border: "1px solid rgba(190, 210, 255, 0.26)",
    borderRadius: "20px",
    padding: "14px",
    minHeight: "84px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  featureIcon: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#b8d0ff",
  },
  featureTitle: {
    margin: 0,
    fontSize: "clamp(14px, 1.2vw, 17px)",
    lineHeight: 1.25,
  },
  formPanel: {
    background: "#f7f9fc",
    borderRadius: "30px",
    border: "1px solid #d3dbe8",
    boxShadow: "0 14px 28px rgba(15, 23, 42, 0.13)",
    padding: "20px 18px 16px",
    minHeight: "620px",
    display: "flex",
    flexDirection: "column",
  },
  formHeader: {
    marginBottom: "8px",
  },
  formTitle: {
    margin: 0,
    fontSize: "clamp(20px, 2.1vw, 28px)",
    color: "#0f1f44",
  },
  formSubtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#526185",
    fontSize: "14px",
  },
  tabs: {
    background: "#e5ebf4",
    borderRadius: "12px",
    padding: "3px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "3px",
    marginTop: "8px",
  },
  tab: {
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "#1a3664",
    padding: "7px 5px",
    fontSize: "14px",
    cursor: "pointer",
  },
  activeTab: {
    border: "1px solid #d0d8e7",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#091636",
    padding: "7px 5px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "default",
  },
  contentArea: {
    marginTop: "10px",
  },
};
