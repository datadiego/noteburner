//░█▀▄░█▀▀░█▀█░█▀▀░█▀█░█▀▄░█▀▀░█▀█░█▀▀░▀█▀░█▀█░█▀▀
//░█░█░█▀▀░█▀▀░█▀▀░█░█░█░█░█▀▀░█░█░█░░░░█░░█▀█░▀▀█
//░▀▀░░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cron = require('node-cron');

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

app.post('/', (req, res) => {
    const id = crypto.randomBytes(16).toString('hex');
    const raw_data = req.body;
    const iv = Buffer.from(id, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', AESKey, iv);
    let data = cipher.update(raw_data, 'utf8', 'hex');
    data += cipher.final('hex');
    const filePath = path.join(__dirname, 'notas', `${id}.txt`);
    createFile(filePath, data, res);
    scheduleFileDeletion(filePath);
});

app.get('/:id', (req, res) => {
    const id = req.params.id;
    const filePath = path.join(__dirname, 'notas', `${id}.txt`);
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

//░█▀▀░█░█░█▀█░█▀▀░▀█▀░█▀█░█▀█░█▀▀░█▀▀
//░█▀▀░█░█░█░█░█░░░░█░░█░█░█░█░█▀▀░▀▀█
//░▀░░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀░▀░▀▀▀░▀▀▀

/**
 * Crea un archivo con la data proporcionada y devuelve la URL del archivo al cliente
 * @param {*} filePath Ruta del archivo a crear
 * @param {*} data Texto a escribir en el archivo
 * @param {*} res Respuesta HTTP
 */
function createFile(filePath, data, res) {
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error al escribir el archivo');
            return;
        }
        console.log(`Archivo creado en ${filePath}`);
        res.send(`http://localhost:8000/${path.basename(filePath, '.txt')}`);
    });
}

/**
 * Programa la eliminación de un archivo
 * @param {*} filePath Ruta del archivo a eliminar
 */
function scheduleFileDeletion(filePath) {
    //cada minuto * * * * *
    //cada hora   0 * * * *
    //cada dia    0 0 * * *
    const task = cron.schedule('* * * * *', () => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`Error al obtener información del archivo ${filePath}:`, err);
                return;
            }
            const now = new Date().getTime();
            const createTime = new Date(stats.ctime).getTime();
            //60000 = 1 minuto
            //3600000 = 1 hora
            //86400000 = 24 horas
            const endTime = createTime + 60000;
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
