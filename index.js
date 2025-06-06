// ░█▀▄░█▀▀░█▀█░█▀▀░█▀█░█▀▄░█▀▀░█▀█░█▀▀░▀█▀░█▀█░█▀▀
// ░█░█░█▀▀░█▀▀░█▀▀░█░█░█░█░█▀▀░█░█░█░░░░█░░█▀█░▀▀█
// ░▀▀░░▀▀▀░▀░░░▀▀▀░▀░▀░▀▀░░▀▀▀░▀░▀░▀▀▀░▀▀▀░▀░▀░▀▀▀

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import express from 'express'
import { createFile, scheduleFileDeletion, deleteAllFiles, encrypt, decrypt, createNoteDir } from './scripts/utils.js'
import { port } from './config.js'
import { fileURLToPath } from 'url'

// ░█▀▀░█▀█░█▀█░█▀▀░▀█▀░█▀▀
// ░█░░░█░█░█░█░█▀▀░░█░░█░█
// ░▀▀▀░▀▀▀░▀░▀░▀░░░▀▀▀░▀▀▀

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
export const app = express()
app.use(express.text({ limit: '1mb' }))
app.use(express.static('public'))
const AESKey = crypto.randomBytes(32)
deleteAllFiles(path.join(__dirname, 'notas'))
createNoteDir()

// ░█▀▀░█▀█░█▀▄░█▀█░█▀█░▀█▀░█▀█░▀█▀░█▀▀
// ░█▀▀░█░█░█░█░█▀▀░█░█░░█░░█░█░░█░░▀▀█
// ░▀▀▀░▀░▀░▀▀░░▀░░░▀▀▀░▀▀▀░▀░▀░░▀░░▀▀▀

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simple.html'))
})

app.post('/', async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString('hex')
    const rawData = req.body
    const data = encrypt(rawData, id, AESKey)
    const filePath = path.join(__dirname, 'notas', `${id}`)
    const respuesta = await createFile(filePath, data, res)
    scheduleFileDeletion(filePath)
    res.send(respuesta)
  } catch (error) {
    console.error('Error en el endpoint POST /:', error)
    res.status(500).send('Error interno del servidor')
  }
})

app.get('/:id', (req, res) => {
  const id = req.params.id
  const filePath = path.join(__dirname, 'notas', `${id}`)
  try {
    const encrypted = fs.readFileSync(filePath, 'utf8')
    const decrypted = decrypt(encrypted, id, AESKey)
    res.setHeader('Content-Type', 'text/plain')
    res.send(decrypted)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).send('Nota no encontrada')
    } else {
      console.error('Error al leer la nota:', error)
      res.status(500).send('Error interno del servidor')
    }
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
