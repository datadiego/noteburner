const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { getUserData, createFile, scheduleFileDeletion } = require('./scripts/notes');
const app = express();

app.use(express.text({limit: '1mb'}));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/', (req, res) => {
    const { id, data, filePath } = getUserData(req);
    createFile(filePath, data, res);
    scheduleFileDeletion(filePath);
});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    const path = __dirname + `/notas/${id}.txt`;
    const IV = Buffer.from(id, 'hex');
    const AESKey = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
    const cipher = crypto.createDecipheriv('aes-256-cbc', AESKey, IV);
    const decrypted = cipher.update(fs.readFileSync(path, 'utf8'), 'hex', 'utf8');
    res.send(decrypted + cipher.final('utf8'));


});

app.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});
/*
function getUserData(req) {
    const id = crypto.randomBytes(16).toString('hex');
    const data = Object.entries(req.body)[0][0];
    const filePath = path.join(__dirname, 'notas', `${id}.txt`);
    return { id, data, filePath };
}

function createFile(filePath, data, res) {
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al escribir el archivo');
            return;
        }
        res.send(`http://localhost:8000/${path.basename(filePath, '.txt')}`);
    });
}

function scheduleFileDeletion(filePath) {
    const task = cron.schedule('* * * * *', () => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`Error al obtener información del archivo ${filePath}:`, err);
                return;
            }
            const now = new Date().getTime();
            const endTime = new Date(stats.ctime).getTime() + 60000; // 1 minuto en milisegundos

            if (now > endTime) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error al eliminar el archivo ${filePath}:`, err);
                    } else {
                        console.log(`Archivo ${filePath} eliminado después de 1 minuto`);
                    }
                });
                task.stop(); // Detener la tarea cron después de eliminar el archivo
            }
        });
    });
}
*/
