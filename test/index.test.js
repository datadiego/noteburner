/* global test, expect */
import { createFile, encrypt, decrypt } from '../scripts/utils.js'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

test('createFile debería crear un archivo correctamente', async () => {
  // filepath is /notas/tempFile.txt
  const filePath = path.join('.', 'tempFile.txt')
  const content = 'Contenido de prueba'

  // Crear el archivo
  await createFile(filePath, content)

  // Verificar que el archivo se haya creado
  expect(fs.existsSync(filePath)).toBe(true)

  // Verificar el contenido del archivo
  const fileContent = fs.readFileSync(filePath, 'utf8')
  expect(fileContent).toBe(content)

  // Limpiar el archivo creado
  fs.unlinkSync(filePath)
})

test('encrypt y decrypt deberían encriptar y desencriptar correctamente', () => {
  const data = 'Hola, mundo'
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('encrypt y decrypt deberían encriptar y desencriptar correctamente', () => {
  const data = 'Un texto con caracteres más extraños!'
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('encrypt y decrypt deberían encriptar y desencriptar mensajes largos correctamente', () => {
  const data = 'A'.repeat(1024 ^ 4)
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('encrypt y decrypt deberían encriptar y desencriptar archivos sin romper sus caracteres', () => {
  const data = fs.readFileSync(path.join(__dirname, '../scripts/utils.js'), 'utf8')
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('16 bytes son suficientes para el id', () => {
  const bytes = []
  for (let i = 0; i < 1000000; i++) {
    const id = crypto.randomBytes(16).toString('hex')
    bytes.push(id)
  }
  const unique = new Set(bytes)
  expect(unique.size).toBe(bytes.length)
})
