import { useEffect, useState } from "react";
import * as Location from "expo-location";
import * as Battery from "expo-battery";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthContext } from "../lib/auth-session";
import { api } from "../lib/fetch";
import { API_ROUTES } from "../lib/api-routes";

const OFFLINE_QUEUE_KEY = "offline_location_queue";

export function useLocationTracker() {
  const { token, options, user } = getAuthContext();
  const [lastSync, setLastSync] = useState(null);
  const [currentMetrics, setCurrentMetrics] = useState({
    latitude: null,
    longitude: null,
    speed: 0,
    battery: 100,
    network: "WiFi",
    status: "Activo",
    timestamp: null,
  });

  useEffect(() => {
    let intervalId;

    const trackAndSync = async () => {
      console.log("📡 Intentando rastrear ubicación...");
      
      // 1. Validar Token
      if (!token) {
        console.warn("⚠️ No hay token de sesión, abortando rastreo.");
        return;
      }

      // 2. Forzar consentimiento si no existe (para pruebas)
      const hasConsent = options?.trackingConsent !== false;

      try {
        // 3. Solicitar Permisos (Primer Plano)
        const { status: foreStatus } = await Location.requestForegroundPermissionsAsync();
        if (foreStatus !== "granted") {
          console.error("❌ Permiso de ubicación en primer plano denegado.");
          return;
        }

        // 4. Obtener Ubicación
        const loc = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.Balanced, // Balanced es más rápido para obtener el primer punto
        });
        
        console.log(`📍 Ubicación obtenida: ${loc.coords.latitude}, ${loc.coords.longitude}`);

        // 5. Obtener Batería
        let batteryLevel = -1;
        try {
          batteryLevel = await Battery.getBatteryLevelAsync();
          if (batteryLevel === -1 && Platform.OS === 'web' && navigator.getBattery) {
            const battery = await navigator.getBattery();
            batteryLevel = battery.level;
          }
        } catch (bErr) { console.warn("⚠️ Error batería:", bErr); }

        // 6. Obtener Red
        const networkState = await Network.getNetworkStateAsync();
        const isConnected = networkState.isConnected && networkState.isInternetReachable !== false;
        const networkType = networkState.type === Network.NetworkStateType.WIFI ? "WiFi" : "Celular";

        const now = new Date().toISOString();
        const newPoint = {
          latitud: loc.coords.latitude,
          longitud: loc.coords.longitude,
          precision_gps: loc.coords.accuracy,
          velocidad: Math.round(loc.coords.speed * 3.6) || 0,
          bateria: batteryLevel >= 0 ? Math.round(batteryLevel * 100) : "N/A",
          senal: networkType,
          timestamp_captura: now,
        };

        setCurrentMetrics({
          latitude: newPoint.latitud,
          longitude: newPoint.longitud,
          speed: newPoint.velocidad,
          battery: newPoint.bateria,
          network: newPoint.senal,
          status: isConnected ? "Activo" : "Sin internet",
          timestamp: now,
        });

        // 7. Sincronización
        const rawQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        let queue = rawQueue ? JSON.parse(rawQueue) : [];

        if (!isConnected) {
          queue.push(newPoint);
          await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
          console.log(`💾 Guardado offline. Pendientes: ${queue.length}`);
        } else {
          try {
            await api.post(API_ROUTES.locations.sync, {
              locations: [...queue, newPoint]
            }, { token });
            await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
            setLastSync(now);
            console.log("✅ Ubicación enviada al servidor.");
          } catch (syncError) {
            queue.push(newPoint);
            await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
            console.error("❌ Error enviando, guardado para reintento.");
          }
        }
      } catch (error) {
        console.error("❌ Error crítico en rastreo:", error);
      }
    };

    trackAndSync();
    intervalId = setInterval(trackAndSync, 15000);

    return () => clearInterval(intervalId);
  }, [token, options.trackingConsent]);

  return { currentMetrics, lastSync };
}
