# Usar la imagen oficial de Node.js (Debian slim)
FROM node:20-slim

# Establecer la variable de entorno para indicar que estamos en producción
# Esto hace que algunos paquetes (como Express) se optimicen automáticamente
ENV NODE_ENV=production

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package*.json y node_modules desde el host (ya ejecutaste `npm install` en la VM)
COPY package*.json ./
COPY node_modules ./node_modules

# Copiar el resto del código del proyecto
COPY --chown=node:node . .

# Exponer el puerto que usará la aplicación
EXPOSE 3000

# Comando directo para arrancar la aplicación (más eficiente que 'npm start')
CMD ["node", "index.js"]