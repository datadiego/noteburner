//░█▀▄░█▀▀░█▀█░█▀▀░█▀█░█▀▄░█▀▀░█▀█░█▀▀░▀█▀░█▀█░█▀▀
//░█░█░█▀▀░█▀▀░█▀▀░█░█░█░█░█▀▀░█░█░█░░░░█░░█▀█░▀▀█
//░▀▀░░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cron = require('node-cron');
const { port, createFile, scheduleFileDeletion, deleteAllFiles, encrypt, decrypt } = require('./scripts/utils.js');


//░█▀▀░█▀█░█▀█░█▀▀░▀█▀░█▀▀
//░█░░░█░█░█░█░█▀▀░░█░░█░█
//░▀▀▀░▀▀▀░▀░▀░▀░░░▀▀▀░▀▀▀

const app = express();
app.use(express.text({limit: '1mb'}));
app.use(express.static('public'));
const AESKey = crypto.randomBytes(32);
deleteAllFiles(path.join(__dirname, 'notas'));

//░█▀▀░█▀█░█▀▄░█▀█░█▀█░▀█▀░█▀█░▀█▀░█▀▀
//░█▀▀░█░█░█░█░█▀▀░█░█░░█░░█░█░░█░░▀▀█
//░▀▀▀░▀░▀░▀▀░░▀░░░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'simple.html'));
});

app.post('/', async (req, res) => {
    try {
        const id = crypto.randomBytes(16).toString('hex');
        const raw_data = req.body;
        const data = encrypt(raw_data, id, AESKey); 
        const filePath = path.join(__dirname, 'notas', `${id}`);
        const respuesta = await createFile(filePath, data, res);
        scheduleFileDeletion(filePath);
        res.send(respuesta);
    } catch (error) {
        console.error('Error en el endpoint POST /:', error);
        res.status(500).send('Error interno del servidor');
    }
});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(__dirname, 'notas', `${id}`);
    const encrypted = fs.readFileSync(filePath, 'utf8');
    const decrypted = decrypt(encrypted, id, AESKey);
    res.setHeader('Content-Type', 'text/plain');
    res.send(decrypted);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});


module.exports = app;