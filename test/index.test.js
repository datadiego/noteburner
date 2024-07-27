const { createFile, scheduleFileDeletion, deleteAllFiles, encrypt, decrypt } = require('../scripts/utils.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
/*
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

*/

test('encrypt y decrypt deberían encriptar y desencriptar correctamente', () => {
    const data = 'Hola, mundo';
    const id = crypto.randomBytes(16).toString('hex');
    const key = crypto.randomBytes(32);
    const encrypted = encrypt(data, id, key);
    const decrypted = decrypt(encrypted, id, key);
    expect(decrypted).toBe(data);
});

test('encrypt y decrypt deberían encriptar y desencriptar correctamente', () => {
    const data = 'Un texto con caracteres más extraños!';
    const id = crypto.randomBytes(16).toString('hex');
    const key = crypto.randomBytes(32);
    const encrypted = encrypt(data, id, key);
    const decrypted = decrypt(encrypted, id, key);
    expect(decrypted).toBe(data);
});

test('encrypt y decrypt deberían encriptar y desencriptar mensajes largos correctamente', () => {
    const data = 'A'.repeat(1024 ^ 4);
    const id = crypto.randomBytes(16).toString('hex');
    const key = crypto.randomBytes(32);
    const encrypted = encrypt(data, id, key);
    const decrypted = decrypt(encrypted, id, key);
    expect(decrypted).toBe(data);
});

test('encrypt y decrypt deberían encriptar y desencriptar archivos sin romper sus caracteres', () => {
    const data = fs.readFileSync(path.join(__dirname, '../scripts/utils.js'), 'utf8');
    const id = crypto.randomBytes(16).toString('hex');
    const key = crypto.randomBytes(32);
    const encrypted = encrypt(data, id, key);
    const decrypted = decrypt(encrypted, id, key);
    expect(decrypted).toBe(data);
});

/*
test('16 bytes son suficientes para el id', () => {
    const bytes = [];
    for (let i = 0; i < 1000000; i++) {
        const id = crypto.randomBytes(16).toString('hex');
        bytes.push(id);
    }
    const unique = new Set(bytes);
    expect(unique.size).toBe(bytes.length);

});
*/