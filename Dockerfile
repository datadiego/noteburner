# Usa una imagen base de Node.js
FROM node:22-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos del proyecto
COPY ./public /public
COPY ./scripts/*.js /scripts/
COPY ./config.js /config.js
COPY ./index.js /index.js
COPY ./package.json /package.json
COPY ./package-lock.json /package-lock.json

# Expone el puerto en el que la app va a correr
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
