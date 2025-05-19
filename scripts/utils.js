import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import cron from 'node-cron'
import { fileURLToPath } from 'url'
export const port = 8000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
/**
 * Crea un archivo con la data proporcionada y devuelve la URL del archivo al cliente
 * @param {*} filePath Ruta del archivo a crear
 * @param {*} data Texto a escribir en el archivo
 * @param {*} res Respuesta HTTP
 */
export async function createFile (filePath, data, res) {
  console.log(`Creando archivo ${filePath} a las ${new Date().toLocaleTimeString()}`)
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      if (err) {
        console.error(`Error al crear el archivo ${filePath}:`, err)
        reject(err)
        return
      }
      resolve(`http://localhost:${port}/${path.basename(filePath)}`)
    })
  })
}

/**
 * Programa la eliminación de un archivo
 * @param {*} filePath Ruta del archivo a eliminar
 */
export function scheduleFileDeletion (filePath) {
  // cada 5 minutos */5 * * * *
  // cada minuto * * * * *
  // cada hora   0 * * * *
  // cada dia    0 0 * * *
  const task = cron.schedule('0 0 * * *', () => {
    fs.stat(filePath, (err, stats) => {
      console.log(`Verificando si el archivo ${filePath} debe ser eliminado`)
      if (err) {
        console.error(`Error al obtener información del archivo ${filePath}:`, err)
        return
      }
      const now = new Date().getTime()
      const createTime = new Date(stats.ctime).getTime()
      // 60000 = 1 minuto
      // 3600000 = 1 hora
      // 86400000 = 24 horas
      const endTime = createTime + 60000
      if (now > endTime) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo ${filePath}:`, err)
          } else {
            console.log(`Archivo ${filePath} eliminado después de 1 minuto`)
          }
        })
        task.stop() // Detener la tarea cron después de eliminar el archivo
      }
    })
  })
}

export function deleteAllFiles (path) {
  fs.readdir(path, (err, files) => {
    if (err) {
      console.error(`Error al leer el directorio ${path}:`, err)
      return
    }
    files.forEach(file => {
      fs.unlink(path + '/' + file, err => {
        if (err) {
          console.error(`Error al eliminar el archivo ${file}:`, err)
        } else {
          console.log(`Archivo ${file} eliminado`)
        }
      })
    })
  })
}

export function encrypt (data, id, key) {
  const iv = Buffer.from(id, 'hex')
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}

export function decrypt (data, id, key) {
  const iv = Buffer.from(id, 'hex')
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  let decrypted = decipher.update(data, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function createNoteDir () {
  const dirPath = path.join(__dirname, 'notas')
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}
