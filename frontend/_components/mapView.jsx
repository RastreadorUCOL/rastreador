import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { getAuthOptions } from '../lib/auth-session';

const DEFAULT_ZOOM = 15;
const VISIBLE_PADDING_FACTOR = -0.2;

// Solo importamos WebView si no es Web
let WebView;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

export default function MapView({ markers = [] }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [LeafletComponents, setLeafletComponents] = useState(null);
  const [showRecenterButton, setShowRecenterButton] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  
  const options = getAuthOptions();

  // 1. Obtener la ubicación real mediante GPS
  useEffect(() => {
    (async () => {
      if (!options.trackingConsent) return;

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
    })();
    setIsClient(true);
  }, [options.trackingConsent]);

  // 2. Cargar Leaflet solo en la Web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const ReactLeaflet = require('react-leaflet');
        const L = require('leaflet');
        require('leaflet/dist/leaflet.css');

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
          iconUrl: require('leaflet/dist/images/marker-icon.png'),
          shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        setLeafletComponents({ ...ReactLeaflet, L });
      } catch (e) {
        console.error("Error en Leaflet Web:", e);
      }
    }
  }, []);

  const center = location ? [location.latitude, location.longitude] : [19.2433, -103.725];

  const shouldShowRecenter = (map) => {
    if (!location || !map) return false;
    const visibleArea = map.getBounds().pad(VISIBLE_PADDING_FACTOR);
    return !visibleArea.contains([location.latitude, location.longitude]);
  };

  useEffect(() => {
    // Mantener orden de hooks estable entre renders y plataformas.
    if (Platform.OS !== 'web') {
      return;
    }

    if (!mapInstance || !location) {
      setShowRecenterButton(false);
      return;
    }

    setShowRecenterButton(shouldShowRecenter(mapInstance));
  }, [mapInstance, location]);

  // --- RENDER PARA MÓVIL (WebView con Leaflet) ---
  if (Platform.OS !== 'web') {
    const markersHtml = markers.map(m => {
      if (m.isGeofence) {
        return `
          L.circle([${m.latitud}, ${m.longitud}], {
            color: '#091636',
            fillColor: '#091636',
            fillOpacity: 0.2,
            radius: ${m.radio || 100}
          }).addTo(map).bindPopup('<b>${m.nombre}</b><br>Radio: ${m.radio}m');
        `;
      }
      return `
        L.marker([${m.latitud}, ${m.longitud}])
          .addTo(map)
          .bindPopup('<b>${m.nombre || "Usuario"}</b><br>Vel: ${m.velocidad}km/h<br>Bat: ${m.bateria}%');
      `;
    }).join('\n');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body, html, #map { height: 100%; margin: 0; padding: 0; background: #f0f0f0; }
            #recenterBtn {
              position: absolute;
              right: 14px;
              bottom: 16px;
              z-index: 9999;
              background: #091636;
              color: #fff;
              border: 1px solid #0f1f44;
              border-radius: 12px;
              padding: 10px 12px;
              font-size: 13px;
              font-weight: 700;
              display: none;
              box-shadow: 0 8px 18px rgba(9, 22, 54, 0.25);
            }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <button id="recenterBtn">Reubicarme</button>
          <script>
            var userCenter = [${center[0]}, ${center[1]}];
            var map = L.map('map').setView(userCenter, ${DEFAULT_ZOOM});
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            L.circle(userCenter, { color: 'blue', radius: 30, fillOpacity: 0.5 }).addTo(map);
            ${markersHtml}

            var recenterBtn = document.getElementById('recenterBtn');

            function toggleRecenterButton() {
              var userPoint = L.latLng(userCenter[0], userCenter[1]);
              var visibleArea = map.getBounds().pad(${VISIBLE_PADDING_FACTOR});
              var isUserClearlyVisible = visibleArea.contains(userPoint);
              recenterBtn.style.display = isUserClearlyVisible ? 'none' : 'block';
            }

            map.on('moveend zoomend', toggleRecenterButton);
            recenterBtn.addEventListener('click', function () {
              map.setView(userCenter, ${DEFAULT_ZOOM}, { animate: true });
            });
            toggleRecenterButton();
          </script>
        </body>
      </html>
    `;

    return (
      <View style={styles.container}>
        <WebView originWhitelist={['*']} source={{ html: htmlContent }} style={{ flex: 1 }} />
      </View>
    );
  }

  // --- RENDER PARA WEB ---
  if (!isClient || !LeafletComponents) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator size="large" color="#091636" />
        <Text style={styles.fallbackText}>Cargando Mapa...</Text>
      </View>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } = LeafletComponents;

  const MapInstanceBridge = () => {
    const map = LeafletComponents.useMap();

    useEffect(() => {
      setMapInstance(map);
    }, [map]);

    return null;
  };

  const RecenterTracker = () => {
    useMapEvents({
      moveend: (event) => {
        const map = event.target;
        setShowRecenterButton(shouldShowRecenter(map));
      },
      zoomend: (event) => {
        const map = event.target;
        setShowRecenterButton(shouldShowRecenter(map));
      },
    });

    return null;
  };

  const handleRecenter = () => {
    if (!mapInstance || !location) return;
    mapInstance.flyTo([location.latitude, location.longitude], DEFAULT_ZOOM, { animate: true });
    setShowRecenterButton(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapLayer}>
        <MapContainer
          center={center}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
        >
          <MapInstanceBridge />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle center={center} pathOptions={{ color: 'blue' }} radius={30} />
          <RecenterTracker />

          {markers.map((m, idx) => (
            <React.Fragment key={idx}>
              {m.isGeofence ? (
                <Circle 
                  center={[m.latitud, m.longitud]} 
                  pathOptions={{ color: '#091636', fillColor: '#091636', fillOpacity: 0.2 }}
                  radius={m.radio || 100}
                >
                  <Popup><b>{m.nombre}</b><br />Radio: {m.radio}m</Popup>
                </Circle>
              ) : (
                <Marker position={[m.latitud, m.longitud]}>
                  <Popup>
                    <b>{m.nombre || "Usuario"}</b><br />
                    Velocidad: {m.velocidad} km/h <br />
                    Batería: {m.bateria}%
                  </Popup>
                </Marker>
              )}
            </React.Fragment>
          ))}
        </MapContainer>
      </View>

      {showRecenterButton && (
        <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
          <Text style={styles.recenterBtnText}>Reubicarme</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 450,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#d1daeb',
    backgroundColor: '#ffffff',
  },
  fallback: {
    width: '100%',
    height: 450,
    backgroundColor: '#eff4fb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  fallbackText: {
    color: '#4d5d80',
    fontSize: 14,
    fontWeight: '600',
  },
  mapLayer: {
    flex: 1,
    zIndex: 1,
  },
  recenterBtn: {
    position: 'absolute',
    right: 12,
    bottom: 14,
    backgroundColor: '#091636',
    borderColor: '#0f1f44',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    zIndex: 2000,
    elevation: 8,
    pointerEvents: 'auto',
  },
  recenterBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(255,0,0,0.7)',
    color: 'white',
    padding: 5,
    borderRadius: 5,
    fontSize: 10,
  }
});
