//░█▀▄░█▀▀░█▀█░█▀▀░█▀█░█▀▄░█▀▀░█▀█░█▀▀░▀█▀░█▀█░█▀▀
//░█░█░█▀▀░█▀▀░█▀▀░█░█░█░█░█▀▀░█░█░█░░░░█░░█▀█░▀▀█
//░▀▀░░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cron = require('node-cron');
const { createFile, scheduleFileDeletion } = require('./scripts/utils.js');

//░█▀▀░█▀█░█▀█░█▀▀░▀█▀░█▀▀
//░█░░░█░█░█░█░█▀▀░░█░░█░█
//░▀▀▀░▀▀▀░▀░▀░▀░░░▀▀▀░▀▀▀

const app = express();
app.use(express.text({limit: '1mb'}));
app.use(express.static('public'));
const AESKey = crypto.randomBytes(32);

//░█▀▀░█▀█░█▀▄░█▀█░█▀█░▀█▀░█▀█░▀█▀░█▀▀
//░█▀▀░█░█░█░█░█▀▀░█░█░░█░░█░█░░█░░▀▀█
//░▀▀▀░▀░▀░▀▀░░▀░░░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/', async (req, res) => {
    try {
        const id = crypto.randomBytes(16).toString('hex');
        const raw_data = req.body;
        const iv = Buffer.from(id, 'hex');
        const cipher = crypto.createCipheriv('aes-256-cbc', AESKey, iv);
        let data = cipher.update(raw_data, 'utf8', 'hex');
        data += cipher.final('hex');
        const filePath = path.join(__dirname, 'notas', `${id}`);
        
        // Llamada asincrónica a createFile
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
    const iv = Buffer.from(id, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', AESKey, iv);
    const encryptedData = fs.readFileSync(filePath, 'utf8');
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    res.setHeader('Content-Type', 'text/plain');
    res.send(decrypted);
});

app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});


module.exports = app;