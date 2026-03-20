import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, SafeAreaView } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { clearAuthSession, getAuthToken, getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";
import { API_ROUTES } from "../lib/api-routes";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Mapa", icon: "🗺️" },
  { href: "/users", label: "Usuarios", icon: "👥" },
  { href: "/geofences", label: "Cercas", icon: "⭕" },
  { href: "/reports", label: "Reportes", icon: "📊" },
  { href: "/alerts", label: "Alertas", icon: "⚠️" },
  { href: "/profile", label: "Perfil", icon: "👤" },
];

export default function AppShell({ title, subtitle, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role } = getAuthContext();
  const normalizedRole = String(role || user?.rol || "").toUpperCase();
  const token = getAuthToken();
  const { width: viewportWidth } = useWindowDimensions();

  const handleLogout = async () => {
    try {
      if (token) await api.post(API_ROUTES.auth.logout, {}, { token });
    } catch (error) {
      console.error("Error logout:", error);
    } finally {
      clearAuthSession();
      router.replace("/login");
    }
  };

  const isMobile = viewportWidth < 768;

  const navigateTo = (href) => {
    router.push(href);
  };

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={isMobile ? styles.frameMobile : styles.frame}>
        
        {/* SIDEBAR (Desktop) */}
        {!isMobile && (
          <View style={styles.sidebar}>
            <View style={styles.brandBlock}>
              <View style={styles.brandBadge}><Text style={styles.brandBadgeText}>RT</Text></View>
              <View>
                <Text style={styles.brandTitle}>Rastreador</Text>
                <Text style={styles.brandSubtitle}>Control Real-Time</Text>
              </View>
            </View>

            <ScrollView style={styles.navScroll}>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                const canView =
                  normalizedRole === "ADMIN" ||
                  (normalizedRole === "SUPERVISOR" && ["/dashboard", "/reports", "/alerts", "/profile"].includes(item.href)) ||
                  (normalizedRole === "USER" && ["/dashboard", "/profile"].includes(item.href));

                if (!canView) return null;

                return (
                  <TouchableOpacity 
                    key={item.href} 
                    onPress={() => navigateTo(item.href)}
                    style={active ? styles.navLinkActive : styles.navLink}
                  >
                    <Text style={active ? styles.navLinkTextActive : styles.navLinkText}>
                      {item.icon}  {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButtonSidebar}>
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MAIN CONTENT */}
        <View style={styles.mainPanel}>
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>{title}</Text>
              {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
            </View>
            {isMobile && (
              <TouchableOpacity onPress={handleLogout} style={styles.logoutIconMobile}>
                <Text style={{fontSize: 20}}>🚪</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>

        {/* BOTTOM NAV (Mobile Only) */}
        {isMobile && (
          <View style={styles.bottomNav}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <TouchableOpacity 
                  key={item.href} 
                  onPress={() => navigateTo(item.href)}
                  style={styles.bottomNavItem}
                >
                  <Text style={{fontSize: 20}}>{item.icon}</Text>
                  <Text style={active ? styles.bottomNavTextActive : styles.bottomNavText}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

export const appUi = {
  card: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d7deec",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 4,
    color: "#0f1f44",
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionDescription: {
    color: "#5c6d8f",
    fontSize: 13,
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#ccd4e2",
  },
  frame: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    gap: 10,
  },
  frameMobile: {
    flex: 1,
    flexDirection: "column",
  },
  sidebar: {
    width: 260,
    backgroundColor: "#f7f9fc",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#d3dbe8",
  },
  brandBlock: {
    backgroundColor: "#091636",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#122654",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2e4477",
  },
  brandBadgeText: { color: "#fff", fontWeight: "800" },
  brandTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  brandSubtitle: { color: "#d2ddfb", fontSize: 11 },
  navScroll: { flex: 1 },
  navLink: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  navLinkActive: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 4,
    backgroundColor: "#091636",
  },
  navLinkText: {
    color: "#132754",
    fontWeight: "600",
    fontSize: 14,
  },
  navLinkTextActive: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  mainPanel: {
    flex: 1,
    backgroundColor: "#f7f9fc",
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: "#d3dbe8",
    overflow: "hidden",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#d7deec",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#0f1f44" },
  headerSubtitle: { fontSize: 13, color: "#5c6d8f", marginTop: 2 },
  content: { padding: 16 },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#d7deec",
    paddingBottom: 10,
    paddingTop: 10,
    justifyContent: "space-around",
  },
  bottomNavItem: { alignItems: "center", flex: 1 },
  bottomNavText: { fontSize: 10, color: "#5c6d8f", marginTop: 4 },
  bottomNavTextActive: { fontSize: 10, color: "#091636", fontWeight: "bold", marginTop: 4 },
  logoutButtonSidebar: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: { color: "#b91c1c", fontWeight: "bold", fontSize: 13 },
  logoutIconMobile: { padding: 8 },
});
