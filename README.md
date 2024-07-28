API REST de almacenamiento volátil de información

Endpoints:

`GET /`: Página principal
`POST /`: Enviar texto
`GET /:id`: Devuelve el texto almacenado

Utilizamos una clave de 16 bytes para el id de cada mensaje.

El servidor genera una clave de 32 bytes para encriptar el contenido de los usuarios con AES256 en modo CBC.

Usamos AES256 para encriptar los mensajes en el servidor usando el ID como IV.

Uso:


Guarda mensajes

echo "quema esto en 24 horas :)" | curl -X POST --data-binary @- -H "Content-Type: text/plain" http://localhost:8000
Guarda archivos

cat somefile.txt | curl -X POST --data-binary @- -H "Content-Type: text/plain" http://localhost:8000
Alias

noteburburner="curl -X POST --data-binary @- -H 'Content-Type: text/plain' http://localhost:8000"
