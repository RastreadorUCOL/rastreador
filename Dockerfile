# Usar la imagen oficial de Node.js (Debian slim)
FROM node:20-slim

# Definir el directorio de trabajo
WORKDIR /app

# Copiamos package*.json y node_modules desde el host (ya ejecutaste `npm install` en la VM)
COPY package*.json ./
COPY node_modules ./node_modules

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
