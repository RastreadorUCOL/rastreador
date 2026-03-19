# Resumen de Actualizaciones y Correcciones 🛠️

Este documento detalla todos los problemas diagnosticados y resueltos, así como las mejoras implementadas en el sistema Rastreador.

## 1. Configuración del Entorno Local (Docker)
- **Problema Inicial:** La instalación de MySQL local vía Homebrew tenía un conflicto de contraseñas de "root" y chocaba con un proceso `mysqld` de sistema que ya ocupaba el puerto `3306`.
- **Solución:** Se optó por usar Docker Desktop como el entorno predeterminado para aislar las dependencias. 
- **Ajuste de Puertos:** Para evitar que el contenedor de Docker chocara con el MySQL de tu Mac, se modificó el archivo `.env` (`DB_PORT=3307`). De esta forma tu base de datos dockerizada se expone al puerto `3307` localmente, mientras que internamente sigue operando en el `3306`.

## 2. Despliegue en Railway (Dockerfile)
- **Problema:** El despliegue fallaba con el error `"Failed to build an image"`.
- **Causa:** El `Dockerfile` estaba instruyendo copiar la carpeta `node_modules` directamente desde la computadora (`COPY node_modules ./node_modules`). Dado que Git ignora esta carpeta, Railway no la encontraba al descargar tu repositorio.
- **Solución:** Se reescribió el `Dockerfile` para que Railway instale las dependencias de producción de forma nativa e independiente durante la fase de Build usando `RUN npm ci --omit=dev`.

## 3. Conexión del Frontend con Backend Local
- **Problema:** Al intentar registrar usuarios, la aplicación frontend fallaba arrojando errores 500 y 401.
- **Causa:** El archivo `frontend/lib/fetch.js` tenía quemada (hardcoded) la URL de entorno de producción (`https://pruebarastreador-production.up.railway.app/api`), por lo que intentaba interactuar con un backend en la nube posiblemente apagado, en vez del servidor Dockerizado que estaba corriendo en `localhost:3000`.
- **Solución:** Se actualizó `DEFAULT_API_BASE_URL` a `http://localhost:3000/api` para asegurar la conectividad íntegra en el entorno de desarrollo.

## 4. Refactorización UX/UI del Formulario de Registro (`register.jsx`)
Se rediseñó bajo requerimientos estrictos de usabilidad y reglas de negocio:
- **Limpieza de interfaz:** Se eliminó la sección de botones visuales de "roles" y el campo de identificador interno para simplificar el formulario.
- **Jerarquía Visual:** Se eliminaron los `placeholder` dentro de los inputs en favor de `Labels` estáticos sobre cada campo.
- **Validaciones Front-end Agregadas:** 
  - Reglas de campos obligatorios.
  - Validación de formato válido de Correo Electrónico.
  - Validación de Contraseña Segura (Mínimo 10 caracteres e inclusión de al menos 1 símbolo especial como `!@#$%^&*`).
- **Feedback de Interfaz:** Se incluyeron mensajes de error dinámicos de color rojo debajo del input afectado; y se añadieron estados de interacción visual para bordes en estado `Focus` y de `Error`. 

## 5. Corrección de Incompatibilidad de Roles en Base de Datos
- **Problema:** El backend arrojaba `"Data truncated for column 'rol'"` al insertar un usuario.
- **Causa:** Al eliminar el selector frontend, se estaba enviando por defecto el string `"Usuario"`. La base de datos, al tener un tipo `ENUM('ADMIN', 'SUPERVISOR', 'CLIENT', 'USER')`, rechazaba textos en español.
- **Solución:** Se modificó el payload oculto enviado desde el frontend para transmitir exactamente la cadena `"USER"` al backend, alineando los datos de la UI con las restricciones SQL.

## 6. Corrección de "401 Unauthorized" en Login (`login.jsx`)
- **Problema:** Tras registrar un usuario y validarlo en la base de datos, el login seguía rechazando las credenciales.
- **Solución Preventiva:** Para evitar los comunes errores de autenticación causados por el teclado del móvil o la copia de información accidental, se agregó curación de datos (`.trim()`) en los campos `correo` y `password` para remover automáticamente espacios en blanco invisibles (leading/trailing) antes de emitir la petición HTTP.
