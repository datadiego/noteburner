const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

/**
 * Crea un archivo con la data proporcionada y devuelve la URL del archivo al cliente
 * @param {*} filePath Ruta del archivo a crear
 * @param {*} data Texto a escribir en el archivo
 * @param {*} res Respuesta HTTP
 */
async function createFile(filePath, data, res) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) {
                console.error(`Error al crear el archivo ${filePath}:`, err);
                reject(err);
                return;
            }
            //console.log(`Archivo creado en ${filePath}`);
            
            resolve(`http://localhost:8000/${path.basename(filePath)}`);
        });
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

module.exports = { createFile, scheduleFileDeletion };