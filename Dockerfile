# Usar la imagen oficial de Node.js (Debian slim)
FROM node:20-slim

# Establecer la variable de entorno para indicar que estamos en producción
ENV NODE_ENV=production

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package*.json e instalamos dependencias DE PRODUCCIÓN dentro del contenedor
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el resto del código del proyecto
COPY --chown=node:node . .

# Exponer el puerto que usará la aplicación
EXPOSE 3000

# Comando directo para arrancar la aplicación
CMD ["node", "index.js"]