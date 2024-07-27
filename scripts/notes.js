const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const AESKey = Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');

function getUserData(req) {
    const id = crypto.randomBytes(16).toString('hex');
    const raw_data = req.body;
    const iv = Buffer.from(id, 'hex');
    const cipher = crypto.createCipheriv('aes-256-cbc', AESKey, iv);
    let data = cipher.update(raw_data, 'utf8', 'hex');
    data += cipher.final('hex');
    const filePath = path.join(__dirname, '..', 'notas', `${id}.txt`);
    return { id, data, filePath };
}

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

function scheduleFileDeletion(filePath) {
    //cron ajusta cada cuánto tiempo se ejecutará la tarea
    //para comprobarla cada minuto se pone '0 * * * *'
    const task = cron.schedule('* * * * *', () => {
        fs.stat(filePath, (err, stats) => {
            if (err) {
                console.error(`Error al obtener información del archivo ${filePath}:`, err);
                return;
            }
            const now = new Date().getTime();
            const endTime = new Date(stats.ctime).getTime() + 60000; // 1 minuto
            //const endTime = new Date(stats.ctime).getTime() + 86400000; //24 horas
            //const endTime = new Date(stats.ctime).getTime() + 3600000; //1 hora
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

module.exports = { getUserData, createFile, scheduleFileDeletion };