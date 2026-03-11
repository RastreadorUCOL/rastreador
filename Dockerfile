# Usar la imagen oficial de Node.js en su versión más ligera (Alpine)
FROM node:18-alpine

# Establecer la variable de entorno para indicar que estamos en producción
# Esto hace que algunos paquetes (como Express) se optimicen automáticamente
ENV NODE_ENV=production

# Definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Dar propiedad del directorio al usuario 'node' (viene integrado en la imagen)
RUN chown node:node /app

# Cambiar a un usuario sin privilegios por seguridad (evita correr como root)
USER node

# Copiar SOLO los archivos de definición de dependencias primero (permite cachear esta capa)
COPY --chown=node:node package*.json ./

# Instalar únicamente las dependencias necesarias para producción
RUN npm install --omit=dev

# Copiar el resto del código del proyecto
COPY --chown=node:node . .

# Exponer el puerto que usará la aplicación
EXPOSE 3000

# Comando directo para arrancar la aplicación (más eficiente que 'npm start')
CMD ["node", "index.js"]