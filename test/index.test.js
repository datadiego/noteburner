const { createFile, scheduleFileDeletion } = require('../scripts/utils.js');
const fs = require('fs');
const path = require('path');

test('createFile debería crear un archivo correctamente', async () => {
    const filePath = path.join(__dirname, 'tempFile.txt');
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