# Usar la imagen oficial de Node.js (Debian slim)
FROM node:20-slim

# Definir el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Dependencias de compilación para mysql2 (node-gyp necesita python, make, g++)
RUN apt-get update -o Acquire::ForceIPv4=true \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && npm install --production \
    && npm cache clean --force \
    && apt-get purge -y --auto-remove python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
