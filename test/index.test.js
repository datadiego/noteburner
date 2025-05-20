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

test('Encriptar y desencriptar string básico', () => {
  const data = 'Hola, mundo'
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('Encriptar y desencriptar strings con caracteres especiales', () => {
  const data = 'Un texto con caracteres más extraños!'
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('Encriptar y desencriptar cadenas muy largas', () => {
  const data = 'A'.repeat(1024 ^ 4)
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('Encriptar y desencriptar cadenas excesivamente largas', () => {
  const data = 'A'.repeat(1024 ^ 8)
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})

test('Encriptar y desencriptar archivos de prueba', () => {
  const data = fs.readFileSync(path.join(__dirname, '../scripts/utils.js'), 'utf8')
  const id = crypto.randomBytes(16).toString('hex')
  const key = crypto.randomBytes(32)
  const encrypted = encrypt(data, id, key)
  const decrypted = decrypt(encrypted, id, key)
  expect(decrypted).toBe(data)
})
