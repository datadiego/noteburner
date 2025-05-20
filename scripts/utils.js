import fs from 'fs'
import crypto from 'crypto'
import path from 'path'
import cron from 'node-cron'
// import { fileURLToPath } from 'url'
import { cronSchedule, deletionTime, port } from '../config.js'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
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
  const task = cron.schedule(cronSchedule, () => {
    fs.stat(filePath, (err, stats) => {
      console.log(`Verificando si el archivo ${filePath} debe ser eliminado`)
      if (err) {
        console.error(`Error al obtener información del archivo ${filePath}:`, err)
        return
      }
      const now = new Date().getTime()
      const createTime = new Date(stats.ctime).getTime()

      const endTime = createTime + deletionTime
      if (now > endTime) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error al eliminar el archivo ${filePath}:`, err)
          } else {
            console.log(`Archivo ${filePath} eliminado después de ${cronSchedule}`)
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
  // Cambia __dirname por process.cwd() para que sea relativo a la raíz del proyecto
  const dirPath = path.join(process.cwd(), 'notas')
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath)
  }
}
