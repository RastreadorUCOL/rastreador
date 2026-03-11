# Usar la imagen oficial de Node.js
FROM node:18-alpine

# Definir el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Dependencias de compilación para mysql2 (node-gyp necesita python, make, g++)
RUN apk add --no-cache python3 make g++ \
    && npm install --production \
    && npm cache clean --force

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
