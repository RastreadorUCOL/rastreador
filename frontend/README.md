# 📍 Rastreador Frontend - [RastreadorUCOL]

Este repositorio contiene el **Módulo de Interfaz de Usuario y Visualización Geográfica** del sistema de rastreo. Nuestra misión es transformar las coordenadas del backend en una experiencia interactiva y fluida utilizando **Leaflet** y **OpenStreetMap**.

---

## 🛠️ Stack Tecnológico
* **Framework:** [Expo](https://expo.dev) (React Native) con soporte multiplataforma.
* **Motor de Mapas:** [Leaflet.js](https://leafletjs.com/).
* **Proveedor de Capas:** [OpenStreetMap](https://www.openstreetmap.org/) (Tiles).
* **Navegación:** Expo Router (File-based routing).
* **Comunicación:** Fetch (API Rest).

---

## 📋 Guía para Equipos de Colaboración

Este documento sirve como puente técnico entre los equipos del proyecto.

### 🧩 Equipo de Integración
El punto de entrada principal se encuentra en la carpeta `/app`.
* **Web:** Renderizado nativo en el DOM.
* **Mobile:** Implementado mediante `react-native-webview` para asegurar compatibilidad con la librería Leaflet en entornos nativos.

### 📡 Equipo de Base de Datos / API
Para el correcto funcionamiento del rastreador, el frontend espera que los endpoints devuelvan objetos bajo el siguiente esquema:
```json
{
  "id": "string",
  "latitude": "number",
  "longitude": "number",
  "speed": "number",
  "last_update": "ISO8601"
}
```

## 🎨 Equipo de Análisis y Diseño
Estamos implementando los lineamientos de UI/UX definidos, asegurando que la interactividad del mapa (marcadores, popups y rutas) respete la guía de estilos oficial.

## 🚀 Inicio Rápido
Instalar dependencias

```Bash
npm install
Iniciar el entorno de desarrollo
```
```Bash
npx expo start
```
---
### Comandos útiles:

Presiona w para abrir en el navegador.

Presiona a para Android (requiere emulador/dispositivo).

Presiona i para iOS (requiere simulador/dispositivo).

---

## 🏗️ Estructura del Proyecto (Front-end)
El proyecto sigue una arquitectura modular basada en las convenciones de Expo Router:

app/: Corazón de la aplicación y sistema de rutas.

(tabs)/: Contiene la navegación principal por pestañas.

rastreo/: Módulo principal del rastreador (Mapa Leaflet).

geocercas/: Gestión de perímetros de seguridad.

reportes/: Visualización de historial y detalles de rutas.

usuarios/: Gestión de perfiles y configuración de cuenta.

_layout.tsx: Define la estructura global y los proveedores de contexto (Themes, Auth).

components/: Componentes reutilizables.

ui/: Componentes de interfaz base (botones, textos tematizados, iconos). Es vital mantener la consistencia visual aquí para el equipo de Diseño.

assets/: Recursos estáticos como imágenes, iconos de la aplicación y el logo del proyecto.

hooks/: Lógica extraída para el manejo de estados globales, como el esquema de colores (useColorScheme) y el consumo de la ubicación en tiempo real.

constants/: Valores de configuración global, como el theme.ts que centraliza los colores del sistema.

---

## ⚠️ Notas Técnicas Importantes
Renderizado en Móvil: Debido a que Leaflet es una librería Web, en **Android/iOS** el mapa corre dentro de un WebView. Toda comunicación entre el mapa y la app nativa se realiza mediante postMessage.

Variables de Entorno: Asegúrate de configurar la URL de la API en el archivo .env para que el cliente pueda realizar las peticiones correctamente.

### 🤝 Contribución
Para cambios en este módulo, por favor crear una rama (branch) siguiendo la convención: feat/nombre-de-la-mejora o fix/descripcion-del-error.
