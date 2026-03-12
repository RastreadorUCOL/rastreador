import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, useWindowDimensions } from "react-native";

const AUTH_TABS = [
  { key: "login", label: "Login", path: "/login" },
  { key: "register", label: "Registro", path: "/register" },
  { key: "recovery", label: "Recuperacion", path: "/recovery" },
];

export default function AuthFrame({ activeTab, title, subtitle, children }) {
  const router = useRouter();
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

  const isTablet = viewportWidth < 1024;
  const isMobile = viewportWidth < 600;

  const dynamicStyles = {
    wrapper: {
      ...styles.wrapper,
      minHeight: viewportHeight,
    },
    page: {
      ...styles.page,
      flexDirection: isTablet ? "column" : "row",
      padding: isMobile ? 10 : 20,
    },
    heroPanel: {
      ...styles.heroPanel,
      padding: isMobile ? 20 : 40,
      marginBottom: isTablet ? 15 : 0,
      minHeight: isTablet ? 180 : 600,
    },
    formPanel: {
      ...styles.formPanel,
      padding: isMobile ? 20 : 35,
      flex: isTablet ? 0 : 1,
    }
  };

  return (
    <ScrollView 
      style={{ backgroundColor: "#ccd4e2" }}
      contentContainerStyle={dynamicStyles.wrapper} 
      bounces={Platform.OS === 'ios'}
    >
      <View style={dynamicStyles.page}>
        <View style={dynamicStyles.heroPanel}>
          <Text style={[styles.heroTitle, isMobile && { fontSize: 28, lineHeight: 32 }]}>
            Sistema rastreador UCOL
          </Text>
          <Text style={[styles.heroText, isMobile && { fontSize: 14, lineHeight: 20 }]}>
            Gestión inteligente de ubicación y seguridad en tiempo real.
          </Text>
        </View>

        <View style={dynamicStyles.formPanel}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>{title}</Text>
            {subtitle && <Text style={styles.formSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.tabs}>
            {AUTH_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => router.push(tab.path)}
                style={tab.key === activeTab ? styles.activeTab : styles.tab}
              >
                <Text style={tab.key === activeTab ? styles.activeTabText : styles.tabText}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.contentArea}>{children}</View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    backgroundColor: "#ccd4e2",
  },
  page: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
  },
  heroPanel: {
    backgroundColor: "#091636",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#0e2559",
    justifyContent: "center",
    flex: 1,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 48,
    letterSpacing: -1,
  },
  heroText: {
    marginTop: 12,
    color: "#d7e2ff",
    fontSize: 18,
    lineHeight: 26,
    opacity: 0.9,
  },
  formPanel: {
    backgroundColor: "#f7f9fc",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d3dbe8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formHeader: {
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f1f44",
  },
  formSubtitle: {
    marginTop: 6,
    color: "#526185",
    fontSize: 14,
    lineHeight: 20,
  },
  tabs: {
    backgroundColor: "#e5ebf4",
    borderRadius: 12,
    padding: 4,
    flexDirection: "row",
    gap: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  activeTab: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: "#4b5d80",
    fontSize: 13,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#091636",
    fontSize: 13,
    fontWeight: "700",
  },
  contentArea: {
    flex: 1,
  },
});

