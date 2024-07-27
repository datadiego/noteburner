const { createFile, scheduleFileDeletion, deleteAllFiles } = require('../scripts/utils.js');
const fs = require('fs');
const path = require('path');

test('createFile debería crear un archivo correctamente', async () => {
    //filepath is /notas/tempFile.txt
    const filePath = path.join('.', 'tempFile.txt');
    const content = 'Contenido de prueba';

    // Crear el archivo
    await createFile(filePath, content);

    // Verificar que el archivo se haya creado
    expect(fs.existsSync(filePath)).toBe(true);

    // Verificar el contenido del archivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    expect(fileContent).toBe(content);

    // Limpiar el archivo creado
    fs.unlinkSync(filePath);
});

test('scheduleFileDeletion debería eliminar un archivo después de 1 minuto', async () => {
    const filePath = path.join('./test', 'tempFile.txt');
    const content = 'Contenido de prueba';

    // Crear el archivo
    await createFile(filePath, content);

    // Programar la eliminación del archivo
    scheduleFileDeletion(filePath);

    // Verificar que el archivo se haya creado
    expect(fs.existsSync(filePath)).toBe(true);

    // Esperar 1 minuto
    await new Promise(resolve => setTimeout(resolve, 120000));

    // Verificar que el archivo ya no exista
    expect(fs.existsSync(filePath)).toBe(false);
}, 150000);

