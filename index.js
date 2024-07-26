const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
    console.log("POST");
    // Generar un ID único para el archivo
    const id = crypto.randomBytes(16).toString('hex');

    // Leer el cuerpo de la solicitud como un buffer de texto sin procesar
    req.setEncoding('utf8');
    const body = req.body;
    console.log(body)
    // take the key value pairs from the body
    const entradas = Object.entries(body)[0];
    const data = entradas[0];
    //write the data to the file
    fs.writeFile(__dirname + `/notas/${id}.txt`, data, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al escribir el archivo');
            return;
        }
    });
    res.send(`http://localhost:8000/${id}`);
    // Escribir el contenido del cuerpo en un archivo

});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    // Enviar el archivo con el ID solicitado
    res.sendFile(__dirname + `/notas/${id}.txt`);
});

app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
